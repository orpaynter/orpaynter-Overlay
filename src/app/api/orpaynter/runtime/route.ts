import { NextResponse } from 'next/server';
import { getGrokRuntime } from '@/lib/orpaynter/grok';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try { requireLocalRequest(request); } catch { return NextResponse.json({error:'Local access required.'},{status:403}); }
  return NextResponse.json(await getGrokRuntime(),{headers:{'Cache-Control':'no-store'}});
}
