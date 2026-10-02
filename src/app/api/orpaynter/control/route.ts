import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
  try {requireLocalRequest(request);}catch{return NextResponse.json({error:'Local access required.'},{status:403});}
  try {
    const data=JSON.parse(await readFile(path.join(process.cwd(),'.local-runs','company-source-packet.json'),'utf8'));
    if(data.company?.notionWorkspace?.id!=='7bef58f4-b0ab-495b-9765-ba3d729be1df')throw new Error();
    const clean=(r:Record<string,unknown>)=>Object.fromEntries(['source','title','url','lastEdited','recordStatus','priority','summary','nextAction'].filter(key=>typeof r[key]==='string').map(key=>[key,String(r[key]).slice(0,700)]));
    return NextResponse.json({capturedAt:data.capturedAt,company:{name:'OrPaynter, Inc.',operatorName:'Oliver Paynter',mode:'Sole operator'},records:data.records.filter((r:{source:string})=>r.source==='Notion').map(clean),controls:data.controls.map(clean),sourceMode:'captured Notion context; not a live connection'},{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({records:[],controls:[],sourceMode:'Company context unavailable'},{headers:{'Cache-Control':'no-store'}});}
}
