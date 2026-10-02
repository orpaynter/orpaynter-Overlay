import { NextResponse } from 'next/server';
import { getCompanyState } from '@/lib/orpaynter/company';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try { requireLocalRequest(request); }
  catch { return NextResponse.json({ error: 'Local access required.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } }); }
  return NextResponse.json(await getCompanyState(), { headers: { 'Cache-Control': 'no-store' } });
}
