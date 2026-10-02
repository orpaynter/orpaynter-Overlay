import { chromium } from '/mnt/c/Users/OrPay/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1600,height:1000}});
try{
 await page.goto('http://127.0.0.1:4180/',{waitUntil:'domcontentloaded',timeout:120000});
 const desk=page.getByRole('region',{name:'OrPaynter company operations'});await desk.getByText('Owner account connected',{exact:true}).waitFor({timeout:35000});
 await desk.getByRole('button',{name:'GB-01 DO NOW — Storm Desk clerk (pre-claim kits before the phone rings)',exact:true}).click();
 const pane=page.getByRole('region',{name:'OrPaynter intelligence workspace'});
 await pane.locator('textarea').fill('For this owner-assigned OrPaynter Storm Desk task, draft an internal weather intake brief using the sampled NWS observations. Identify potentially relevant public signals. Do not invent service territories, customers, property damage, matched claims or completed kits. State the missing evidence and one exact next action. Respect the captured company operating lock and source limits. Keep the brief under 350 words.');
 const runButton=pane.getByRole('button',{name:'Run Grok analysis'});await runButton.waitFor();await page.waitForFunction(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Run Grok analysis'));return b&&!b.disabled;},{},{timeout:45000});
 const resultResponse=page.waitForResponse(r=>r.url().includes('/api/orpaynter/grok')&&r.request().method()==='POST',{timeout:240000});await runButton.click();
 let progress=null;for(let i=0;i<12;i++){await page.waitForTimeout(1000);const r=await page.request.get('http://127.0.0.1:4180/api/orpaynter/activity');const a=await r.json();progress=a.jobs.find(j=>j.companyWork?.number===33&&['starting','running'].includes(j.status));if(progress)break;}
 assert.ok(progress,'real starting/running task visible in process journal');await desk.getByRole('button',{name:'workers',exact:true}).click();await desk.getByText(/Grok · /).first().waitFor();await page.screenshot({path:'orpaynter-evidence/company-job-running.png'});
 const response=await resultResponse;const result=await response.json();assert.equal(response.status(),200);assert.equal(result.status,'completed');assert.equal(result.companyWork.number,33);assert.equal(result.companyWork.repo,'orpaynter/claimflow');assert.equal(result.externalAction,false);assert.ok(result.companyRevision);assert.ok(result.companyContext?.records.length);assert.ok(result.text.length>100);
 await fs.writeFile('orpaynter-evidence/company-job-proof.json',JSON.stringify({checkedAt:new Date().toISOString(),progress,result},null,2));
 await pane.getByText('Completed Grok analysis',{exact:true}).waitFor({timeout:15000});await pane.getByText('Completed Grok analysis',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'orpaynter-evidence/company-job-completed.png'});
 console.log(JSON.stringify({runId:result.runId,task:result.companyWork.id,snapshot:result.snapshotId,status:result.status,chars:result.text.length,externalAction:result.externalAction,progress:progress.status}));
}finally{await browser.close();}
