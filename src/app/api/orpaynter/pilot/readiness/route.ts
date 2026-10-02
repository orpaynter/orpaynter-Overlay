import { NextResponse } from 'next/server';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';
import { PILOT_RUNTIME_READINESS } from '@/lib/orpaynter/property-pilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  try { requireLocalRequest(request); } catch {
    return NextResponse.json({ error: 'Local same-origin access required.' }, { status: 403 });
  }
  return NextResponse.json(PILOT_RUNTIME_READINESS, { headers: { 'Cache-Control': 'no-store' } });
}
