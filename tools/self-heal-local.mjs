import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'.local-runs');await fs.mkdir(directory,{recursive:true});
const stateFile=path.join(directory,'supervisor-state.json');
const buildId=(await fs.readFile(path.join(root,'.next','BUILD_ID'),'utf8')).trim();
const proof=JSON.parse(await fs.readFile(path.join(directory,'build-proof.json'),'utf8'));
const cssHash=createHash('sha256').update(await fs.readFile(path.join(root,'src/app/globals.css'),'utf8')).digest('hex');
if(proof.status!=='verified'||proof.buildId!==buildId||proof.sourceCssHash!==cssHash)throw Error('Run tools/build-verified.mjs before serving this build.');
const url='http://127.0.0.1:4180/api/orpaynter/health';
let child=null,stopping=false,restarting=false,failures=0,status='starting',restartCount=0,lastStart=0,lastHealthyAt=null;
const events=[],recentRestarts=[];
function event(kind,detail){events.unshift({at:new Date().toISOString(),kind,detail});events.splice(30);console.log(`${kind}: ${detail}`);}
let saving=Promise.resolve();
function save(){const state={service:'orpaynter-world-twin',checkedAt:new Date().toISOString(),supervisorPid:process.pid,serverPid:child?.pid??null,status,restartCount,lastHealthyAt,buildId,events};saving=saving.catch(()=>{}).then(async()=>{const temp=stateFile+'.tmp';await fs.writeFile(temp,JSON.stringify(state,null,2),{mode:0o600});await fs.rename(temp,stateFile);});return saving;}
async function health(){try{const r=await fetch(url,{signal:AbortSignal.timeout(8000),cache:'no-store'});if(!r.ok)return null;return await r.json();}catch{return null;}}
const existing=await health();if(existing){console.error('Port 4180 is already serving a process. Stop that local process before starting its supervisor.');process.exit(1);}
function start(){lastStart=Date.now();status='starting';child=spawn(process.execPath,[path.join(root,'node_modules','next','dist','bin','next'),'start','--hostname','127.0.0.1','--port','4180'],{cwd:root,shell:false,stdio:['ignore','inherit','inherit'],env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});const current=child;event('started','Starting the same verified local build.');child.on('error',()=>{event('start-failed','Local server process could not start.');});child.on('exit',(code)=>{if(child===current)child=null;if(!stopping&&!restarting){event('process-exit',`Owned server exited (${code??'signal'}).`);void restart('Owned server process exited.');}});}
async function restart(reason){if(stopping||restarting||status==='paused')return;restarting=true;const now=Date.now();while(recentRestarts.length&&now-recentRestarts[0]>600000)recentRestarts.shift();if(recentRestarts.length>=4){status='paused';event('paused','Four restarts in ten minutes; automatic restart stopped for inspection.');await save();restarting=false;return;}recentRestarts.push(now);restartCount++;status='restarting';event('restart',reason);const current=child;if(current){current.kill('SIGTERM');await new Promise(resolve=>setTimeout(resolve,1500));if(child===current)current.kill('SIGKILL');}await new Promise(resolve=>setTimeout(resolve,Math.min(1000*2**(recentRestarts.length-1),8000)));if(!stopping){failures=0;start();}restarting=false;await save();}
let checking=false;
async function check(){if(checking||stopping)return;checking=true;try{if(status==='paused'){await save();return;}const h=await health();if(h&&h.service==='orpaynter-world-twin'&&h.buildId===buildId){failures=0;lastHealthyAt=new Date().toISOString();if(status!=='healthy'){status='healthy';event(restartCount?'recovered':'healthy','Same build responded to its health check.');}}else if(Date.now()-lastStart>(status==='starting'?90000:20000)){if(h){status='paused';event('identity-mismatch','Health response belongs to a different build; stopped automatic intervention.');}else if(++failures>=2)await restart('Two consecutive health checks failed.');}await save();}finally{checking=false;}}
async function stop(){if(stopping)return;stopping=true;status='stopped';clearInterval(timer);child?.kill('SIGTERM');event('stopped','Supervisor stopped by operator.');await save();process.exit(0);}
process.on('SIGTERM',()=>void stop());process.on('SIGINT',()=>void stop());start();await save();const timer=setInterval(()=>void check().catch(()=>{}),5000);void check();
