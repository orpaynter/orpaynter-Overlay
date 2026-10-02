import { NextResponse } from 'next/server';
import { readFile,readdir } from 'node:fs/promises';
import path from 'node:path';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';
import { getGrokRuntime } from '@/lib/orpaynter/grok';
export const runtime='nodejs';
export const dynamic='force-dynamic';
let cached: {at:number;openclaw:boolean;aia:boolean}|null=null;
async function ready(url:string) {try{const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(1800)});return r.ok;}catch{return false;}}
export async function GET(request:Request) {
  try {requireLocalRequest(request);}catch{return NextResponse.json({error:'Local access required.'},{status:403});}
  if(!cached||Date.now()-cached.at>15000){const [openclaw,aia]=await Promise.all([ready('http://127.0.0.1:18789/ready'),ready('http://127.0.0.1:3001/health')]);cached={at:Date.now(),openclaw,aia};}
  const directory=path.join(process.cwd(),'.local-runs','grok');let jobs:Record<string,unknown>[]=[];
  try {
    const names=(await readdir(directory)).filter(name=>/^[a-f0-9-]{36}\.json$/.test(name)).slice(-100);
    const records=await Promise.all(names.map(async name=>{try{return JSON.parse(await readFile(path.join(directory,name),'utf8'));}catch{return null;}}));
    jobs=records.filter(r=>r&&typeof r.runId==='string').sort((a,b)=>String(b.startedAt).localeCompare(String(a.startedAt))).slice(0,12).map(r=>({runId:r.runId,status:['starting','running'].includes(r.status)&&Date.now()-Date.parse(r.startedAt)>300000?'interrupted':r.status,objective:r.objective,startedAt:r.startedAt,completedAt:r.completedAt||null,snapshotId:r.snapshotId,companyWork:r.companyWork||null,externalAction:false}));
  }catch{/* A missing journal proves no journal records, not no ecosystem workers. */}
  let supervisor=null;try{const s=JSON.parse(await readFile(path.join(process.cwd(),'.local-runs','supervisor-state.json'),'utf8'));supervisor={status:Date.now()-Date.parse(s.checkedAt)>20000?'heartbeat stale':s.status,checkedAt:s.checkedAt,restartCount:s.restartCount,lastHealthyAt:s.lastHealthyAt,events:s.events?.slice(0,8)};}catch{}
  return NextResponse.json({supervisor,checkedAt:new Date().toISOString(),grok:await getGrokRuntime(),jobs,openclaw:{reachable:cached.openclaw,companyActivity:'not connected to this work journal'},aia:{reachable:cached.aia,companyReadConnected:false},scope:'Local Grok journal and fixed runtime health checks; not the entire company workforce'},{headers:{'Cache-Control':'no-store'}});
}
