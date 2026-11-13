import { NextRequest, NextResponse } from 'next/server';
import { runDeepResearch } from '@/lib/skill_executor';
import { checkRateLimit, researchLimiter } from '@/lib/rate_limiter';

export const runtime = 'nodejs';
export const maxDuration = 60; // Mayor límite de timeout debido al paralelismo

export async function POST(req: NextRequest) {
    const limited = await checkRateLimit(req, researchLimiter);
    if (limited) return limited;

    try {
        const body = await req.json();
        const topic = typeof body?.topic === 'string' ? body.topic.trim() : '';
        const context = typeof body?.context === 'string' ? body.context.trim() : '';

        if (!topic || topic.length > 2_000 || context.length > 4_000) {
            return NextResponse.json(
                { error: 'Topic (1–2000 chars) and context (0–4000 chars) are required.' },
                { status: 400 }
            );
        }

        console.info('[DeepResearch API] request accepted', { topicChars: topic.length, contextChars: context.length });

        // FASE 1: Research Agent — 5 ángulos de investigación paralelos
        const research = await runDeepResearch(topic, context || "");

        // FASE 2: Retorno estructurado al orquestador o frontend
        return NextResponse.json({
            success: true,
            topic,
            context,
            research: {
                totalSourcesProcessed: [
                    research.overview,
                    research.trends,
                    research.keyPlayers,
                    research.dataMetrics,
                    research.challenges,
                ].reduce((acc, r) => acc + r.sources.length, 0),
                searchTimeMs: research.totalSearchTime,
                topOverviewSources:  research.overview.sources.slice(0, 3),
                topMetricsSources:   research.dataMetrics.sources.slice(0, 3),
                topTrendsSources:    research.trends.sources.slice(0, 3),
                rawSynthesis:        research.rawSynthesis, // Síntesis 360 para que la lea el Engine LLM
            },
        });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error desconocido de red';
        console.error('[DeepResearch API] Error:', message);
        return NextResponse.json({ error: 'Research service unavailable' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
}
