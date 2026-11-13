import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getAgentStats } from '@/lib/tools';

export async function GET(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const stats = await getAgentStats();
        return NextResponse.json(stats);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
