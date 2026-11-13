import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function authorized(req: NextRequest): boolean {
    const expected = process.env.OPEN_GRAVITY_DIAG_TOKEN;
    const supplied = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] ?? '';
    if (!expected || !supplied) return false;

    const expectedBytes = Buffer.from(expected, 'utf8');
    const suppliedBytes = Buffer.from(supplied, 'utf8');
    return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
}

export async function GET(req: NextRequest) {
    const noStore = { headers: { 'Cache-Control': 'no-store' } };
    if (!authorized(req)) {
        return NextResponse.json({ error: 'Not found' }, { ...noStore, status: 404 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
        return NextResponse.json({ error: 'Diagnostic provider is not configured' }, { ...noStore, status: 503 });
    }

    const tests = [
        { name: 'Workers AI text', model: '@cf/meta/llama-3-8b-instruct', payload: { messages: [{ role: 'user', content: 'health check' }] } },
        { name: 'Workers AI speech', model: '@cf/deepgram/aura-2-es', payload: { text: 'health check' } },
        { name: 'Workers AI TTS', model: '@cf/myshell-ai/melotts', payload: { text: 'health check', lang: 'es' } },
    ];

    const results = [];
    for (const test of tests) {
        const startedAt = Date.now();
        try {
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${test.model}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(test.payload),
                signal: AbortSignal.timeout(15_000),
            });
            results.push({
                test: test.name,
                model: test.model,
                status: response.status,
                ok: response.ok,
                latencyMs: Date.now() - startedAt,
            });
            await response.body?.cancel();
        } catch {
            results.push({ test: test.name, model: test.model, ok: false, error: 'Provider request failed', latencyMs: Date.now() - startedAt });
        }
    }

    return NextResponse.json({ timestamp: new Date().toISOString(), results }, noStore);
}
