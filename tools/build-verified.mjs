import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=text=>createHash('sha256').update(text).digest('hex');
const source=await fs.readFile(path.join(root,'src/app/globals.css'),'utf8');
const markers=['orpa-workspace','orpa-desk','orpa-healing-note','orpa-time-modes','orpa-overlay-launch','orpa-brand-mark','orpa-company-setup'];
async function verify(){try{const serverNames=(await fs.readdir(path.join(root,'.next/server/chunks'))).filter(n=>n.endsWith('.js'));const server=await Promise.all(serverNames.map(n=>fs.readFile(path.join(root,'.next/server/chunks',n),'utf8')));if(!server.some(c=>c.includes('Loopback host identity mismatch.')))return false;const names=(await fs.readdir(path.join(root,'.next/static/chunks'))).filter(n=>n.endsWith('.css'));const css=await Promise.all(names.map(n=>fs.readFile(path.join(root,'.next/static/chunks',n),'utf8')));return markers.every(m=>css.some(c=>c.includes(m)))&&hash(await fs.readFile(path.join(root,'src/app/globals.css'),'utf8'))===hash(source);}catch{return false;}}
async function build(){await new Promise((resolve,reject)=>{const child=spawn(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{cwd:root,shell:false,stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('Production build failed.')));});}
if(!process.argv.includes('--verify-existing'))await build();
let repaired=false;
if(!await verify()){console.log('Build integrity: expected stylesheet is missing. Clearing the build cache and retrying once.');await fs.rm(path.join(root,'.next/cache'),{recursive:true,force:true});await build();repaired=true;}
if(!await verify())throw Error('Build integrity failed after one repair. This artifact is not ready to serve.');
const directory=path.join(root,'.local-runs');await fs.mkdir(directory,{recursive:true});const receipt={checkedAt:new Date().toISOString(),status:'verified',cacheRepaired:repaired,sourceCssHash:hash(source),buildId:(await fs.readFile(path.join(root,'.next/BUILD_ID'),'utf8')).trim(),checks:[...markers,'compiled-loopback-host-guard']};await fs.writeFile(path.join(directory,'build-proof.json'),JSON.stringify(receipt,null,2));await fs.appendFile(path.join(directory,'build-history.jsonl'),JSON.stringify(receipt)+'\n');console.log(JSON.stringify(receipt));
