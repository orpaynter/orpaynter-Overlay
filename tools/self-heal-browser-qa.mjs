import { chromium } from '/mnt/c/Users/OrPay/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
try{
 await page.goto('http://127.0.0.1:4180/?layers=satellites,earthquakes,day_night',{waitUntil:'domcontentloaded',timeout:120000});
 const desk=page.getByRole('region',{name:'OrPaynter company operations'});await desk.getByText('Owner account connected',{exact:true}).waitFor({timeout:40000});await page.waitForTimeout(18000);
 await desk.getByRole('button',{name:'healing',exact:true}).click();await desk.getByText('Self-healing is active',{exact:true}).waitFor();check('healing view shows source integrity identities',await desk.getByText(/SHA-256/).count()>0);
 const initial=await page.locator('[data-map-camera]').getAttribute('data-map-camera');
 const firstCanvas=await page.locator('canvas.maplibregl-canvas').elementHandle();
 const lost=await page.locator('canvas.maplibregl-canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl2');const ext=gl?.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;});check('actual WebGL fault induced through browser graphics API',lost);
 await page.waitForFunction(()=>document.querySelector('.orpa-desk')?.textContent.includes('Renderer rebuilt; prior camera, layers and source records retained.'),null,{timeout:60000});
 check('renderer automatically rebuilt',await firstCanvas.evaluate(e=>!e.isConnected));check('one recovered globe canvas remains',await page.locator('canvas.maplibregl-canvas').count()===1);
 const after=JSON.parse(await page.locator('[data-map-camera]').getAttribute('data-map-camera')),before=JSON.parse(initial);check('camera center and zoom preserved',Math.abs(before.lat-after.lat)<0.01&&Math.abs(before.lng-after.lng)<0.01&&Math.abs(before.zoom-after.zoom)<0.01);
 check('company work survives renderer recovery',await desk.getByText('Oliver Paynter · sole operator',{exact:true}).count()===1);await page.screenshot({path:'orpaynter-evidence/self-heal-renderer.png'});
 const a=await page.request.get('http://127.0.0.1:4180/api/orpaynter/recovery?source=satellites');const envelope=await a.json();check('actual source accepted with stored integrity identity',['healthy','recovered'].includes(envelope.recovery.status)&&envelope.recovery.lastGoodHash.length===64&&envelope.payload.satellites.length>0);
 const state=JSON.parse(await fs.readFile('.local-runs/supervisor-state.json','utf8'));check('supervisor controls a healthy owned server',state.status==='healthy'&&state.serverPid&&state.buildId);
 const jobBefore=await (await page.request.get('http://127.0.0.1:4180/api/orpaynter/grok')).json();
 const oldPid=state.serverPid;process.kill(oldPid,'SIGKILL');let recovered=null;
 for(let i=0;i<100;i++){await page.waitForTimeout(1000);const s=JSON.parse(await fs.readFile('.local-runs/supervisor-state.json','utf8'));if(s.status==='healthy'&&s.serverPid!==oldPid&&s.restartCount>state.restartCount){recovered=s;break;}}
 check('owned local server automatically restarted and health verified',!!recovered);check('same verified build retained',recovered.buildId===state.buildId);check('recovery journal records process exit and recovery',recovered.events.some(e=>e.kind==='process-exit')&&recovered.events.some(e=>e.kind==='recovered'));
 const checkApi=await page.request.get('http://127.0.0.1:4180/api/orpaynter/recovery?source=company');const work=await checkApi.json();check('owner-scoped work restored after process restart',work.payload.github.status==='connected'&&work.payload.work.length>0);
 const jobAfter=await (await page.request.get('http://127.0.0.1:4180/api/orpaynter/grok')).json();check('completed company job and frozen input survive server recovery',jobBefore?.status==='completed'&&jobAfter.runId===jobBefore.runId&&jobAfter.snapshotId===jobBefore.snapshotId&&jobAfter.text===jobBefore.text&&jobAfter.externalAction===false);
 await fs.writeFile('orpaynter-evidence/self-heal-browser-qa.json',JSON.stringify({checkedAt:new Date().toISOString(),passed:checks.length,checks,renderer:{before,after},server:{oldPid,newPid:recovered.serverPid,restartCount:recovered.restartCount,buildId:recovered.buildId,events:recovered.events},source:{hash:envelope.recovery.lastGoodHash,receivedAt:envelope.recovery.receivedAt,count:envelope.payload.satellites.length}},null,2));console.log(JSON.stringify({passed:checks.length,oldPid,newPid:recovered.serverPid}));
}finally{await browser.close();}
