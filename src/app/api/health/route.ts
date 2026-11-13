import { NextResponse } from 'next/server';

export async function GET() {
    const storageConfigured = Boolean(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
    );

    return NextResponse.json(
        { ok: true, service: 'open-gravity-ui', storageConfigured },
        {
            status: storageConfigured ? 200 : 503,
            headers: { 'Cache-Control': 'no-store' },
        }
    );
}
