import { NextResponse } from 'next/server';
import { getGrokLearningStatus } from '@/lib/orpaynter/grok-learning';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try { requireLocalRequest(request); } catch { return NextResponse.json({error: 'Local access required.'}, {status: 403}); }
  return NextResponse.json(await getGrokLearningStatus(), {headers: {'Cache-Control': 'no-store'}});
}
