import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { requireLocalRequest } from '@/lib/orpaynter/local-scope';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 try{requireLocalRequest(request);}catch{return NextResponse.json({error:'Local access required.'},{status:403});}
 let buildId:string|null=null;try{buildId=(await readFile(path.join(process.cwd(),'.next','BUILD_ID'),'utf8')).trim();}catch{}
 return NextResponse.json({service:'orpaynter-world-twin',status:buildId?'ready':'development',buildId,checkedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
}
