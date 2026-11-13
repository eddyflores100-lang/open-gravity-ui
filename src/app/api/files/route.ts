import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { saveFile, readFile, listFiles, deleteFile, updateFile } from '@/lib/tools';

export async function GET(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const id = req.nextUrl.searchParams.get('id');
        if (id) {
            const file = await readFile(id);
            if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });
            return NextResponse.json(file);
        }
        const dir = req.nextUrl.searchParams.get('path') || '/';
        const files = await listFiles(dir);
        return NextResponse.json({ files });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const body = await req.json();
        const result = await saveFile(
            body.name || 'untitled.txt',
            body.path || '/',
            body.content || '',
            body.mimeType || 'text/plain'
        );
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const body = await req.json();
        if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        await updateFile(body.id, body.content);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const denied = requireApiKey(req);
    if (denied) return denied;
    const denied = requireApiKey(req);
    if (denied) return denied;
    try {
        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        await deleteFile(id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
