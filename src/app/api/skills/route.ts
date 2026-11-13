import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { listSkills, installSkill, deleteSkill } from '@/lib/tools';

export async function GET(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const skills = await listSkills();
        return NextResponse.json({ skills });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const body = await req.json();
        const skill = await installSkill(body);
        return NextResponse.json({ skill });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        await deleteSkill(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
