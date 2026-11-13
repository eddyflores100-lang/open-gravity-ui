/**
 * OpenGravity v10 — Unified Ingestion API
 * Permite que scripts externos (ej: Lead Sniper) inyecten datos al Knowledge Graph.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { injectLeadAsNode, injectFileAsNode } from '@/lib/knowledge_graph';

export async function POST(req: Request) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const body: { type: string; data: any } = await req.json();
        const { type, data } = body;

        console.log(`[INGEST] v10 Recibida carga útil: ${type}`);

        if (type === 'lead') {
            await injectLeadAsNode(data);
            return NextResponse.json({ success: true, message: "Lead inyectado." });
        }

        if (type === 'file') {
            await injectFileAsNode(data);
            return NextResponse.json({ success: true, message: "Archivo/Asset inyectado." });
        }

        return NextResponse.json({ success: false, error: "Tipo no soportado." }, { status: 400 });

    } catch (e: unknown) {
        return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
}
