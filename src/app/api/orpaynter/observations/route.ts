import { NextResponse } from 'next/server';
import { collectSnapshot, saveSnapshot, readSnapshot, validSnapshotId } from '@/lib/orpaynter/observations';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
let capture: ReturnType<typeof collectSnapshot> | null = null;
export async function GET(request: Request) {
  try { requireLocalRequest(request); } catch { return NextResponse.json({error:'Local same-origin access required.'},{status:403}); }
  const snapshotId = new URL(request.url).searchParams.get('snapshotId');
  if (snapshotId !== null) {
    if (!validSnapshotId(snapshotId)) return NextResponse.json({error:'Invalid capture identity.'},{status:400});
    try { return NextResponse.json(await readSnapshot(snapshotId),{headers:{'Cache-Control':'no-store'}}); }
    catch { return NextResponse.json({error:'Saved capture unavailable or failed integrity verification.'},{status:404}); }
  }
  try {
    if (!capture) capture = collectSnapshot().finally(()=>{capture=null;});
    const snapshot = await capture;
    await saveSnapshot(snapshot);
    return NextResponse.json(snapshot,{headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'Observation capture failed; no snapshot promoted.'},{status:503}); }
}
