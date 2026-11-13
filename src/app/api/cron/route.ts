import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { createCronJob, listCronJobs, toggleCronJob, deleteCronJob, markCronJobRun } from '@/lib/tools';

export async function GET(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const jobs = await listCronJobs();
        return NextResponse.json({ jobs });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const body = await req.json();
        const job = await createCronJob({
            name: body.name || 'Untitled Job',
            description: body.description || '',
            schedule: body.schedule || 'daily',
            action: body.action || '',
            enabled: body.enabled !== false
        });
        return NextResponse.json(job);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const body = await req.json();
        if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        if (body.action === 'toggle') {
            await toggleCronJob(body.id, body.enabled);
        } else if (body.action === 'run') {
            await markCronJobRun(body.id, body.result || 'Executed');
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        await deleteCronJob(id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
