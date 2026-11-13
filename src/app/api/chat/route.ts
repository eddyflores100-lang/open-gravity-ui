import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, chatLimiter } from '@/lib/rate_limiter';
import { sanitizeResponse } from '@/lib/security';
import { buildStreamPayload } from '@/lib/ai_logic';

export const runtime = 'nodejs'; // Ensure Node.js runtime for streaming

export async function POST(req: NextRequest) {
    const limited = await checkRateLimit(req, chatLimiter);
    if (limited) return limited;

    try {
        const body = await req.json();
        const messages = body?.messages;
        if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
            return NextResponse.json({ error: "Invalid message list" }, { status: 400 });
        }
        const validMessages = messages.every((message) =>
            message &&
            typeof message === 'object' &&
            (message.role === 'user' || message.role === 'assistant') &&
            typeof message.content === 'string' &&
            message.content.length <= 12_000
        );
        if (!validMessages) {
            return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
        }

        const { apiUrl, headers, body, engine } = await buildStreamPayload(messages);

        // Call DeepSeek (or fallback) with stream: true
        const upstreamRes = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!upstreamRes.ok || !upstreamRes.body) {
            const errText = await upstreamRes.text();
            console.error('UPSTREAM_ERROR:', upstreamRes.status, errText);
            // Return a non-streaming fallback error
            const errorPayload = `data: ${JSON.stringify({ content: "❌ Error del motor: " + sanitizeResponse(errText).substring(0, 200), engine })}\n\ndata: [DONE]\n\n`;
            return new Response(errorPayload, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        // Pipe the SSE stream directly from DeepSeek → Client
        const transformStream = new TransformStream({
            transform(chunk, controller) {
                controller.enqueue(chunk);
            },
        });

        const reader = upstreamRes.body.getReader();
        const writer = transformStream.writable.getWriter();

        // Pump data through
        (async () => {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // Send engine info as final SSE event
                        const encoder = new TextEncoder();
                        await writer.write(encoder.encode(`data: ${JSON.stringify({ engine })}\n\n`));
                        await writer.close();
                        break;
                    }
                    await writer.write(value);
                }
            } catch (e) {
                console.error('STREAM_PIPE_ERROR:', e);
                await writer.abort(e as Error);
            }
        })();

        return new Response(transformStream.readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('CHAT_API_ERROR:', message);
        return NextResponse.json({ error: 'Chat service unavailable' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
}
