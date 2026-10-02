import { NextResponse } from 'next/server';
import { getRecoveredSource, getRecoverySummary, RECOVERY_SOURCES, type RecoverySource } from '@/lib/orpaynter/recovery';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try { requireLocalRequest(request); }
  catch { return NextResponse.json({ error: 'Local access required.' }, { status: 403, headers }); }
  const url = new URL(request.url);
  if ([...url.searchParams.keys()].some(key => key !== 'source') || url.searchParams.getAll('source').length > 1) return NextResponse.json({ error: 'Only one fixed recovery source is accepted.' }, { status: 400, headers });
  const source = url.searchParams.get('source');
  if (source === null) return NextResponse.json(await getRecoverySummary(), { headers });
  if (!RECOVERY_SOURCES.includes(source as RecoverySource)) return NextResponse.json({ error: 'Recovery source is outside the read scope.' }, { status: 400, headers });
  return NextResponse.json(await getRecoveredSource(source as RecoverySource, url.origin), { headers });
}
