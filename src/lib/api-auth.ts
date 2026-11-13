import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

/**
 * Protects server-to-server admin APIs. Never expose this key in NEXT_PUBLIC_*
 * variables or browser bundles. Public UI routes should use their own auth flow.
 */
export function requireApiKey(request: Request, envName = 'OPEN_GRAVITY_ADMIN_KEY'): NextResponse | null {
  const expected = process.env[envName];
  if (!expected) {
    return NextResponse.json(
      { error: 'Admin API is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const authorization = request.headers.get('authorization') ?? '';
  const supplied = authorization.match(/^Bearer\s+(.+)$/i)?.[1] ?? '';
  const expectedBytes = Buffer.from(expected, 'utf8');
  const suppliedBytes = Buffer.from(supplied, 'utf8');

  if (
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(suppliedBytes, expectedBytes)
  ) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return null;
}
