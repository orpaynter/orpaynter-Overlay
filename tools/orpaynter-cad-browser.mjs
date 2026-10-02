import { chromium } from '/mnt/c/Users/OrPay/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4180/orpaynter-cad/index.html',{waitUntil:'networkidle'});
 assert.equal(await page.locator('article').count(),10);
 assert.equal(await page.getByRole('link',{name:'Download 2D DXF',exact:true}).count(),10);
 assert.equal(await page.locator('img').evaluateAll(items=>items.filter(img=>img.complete&&img.naturalWidth>0).length),10);
 await page.screenshot({path:'../public-cad-pilot/pilot-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await page.screenshot({path:'../public-cad-pilot/pilot-mobile.png'});
 assert.equal(errors.length,0);
 await fs.writeFile('../public-cad-pilot/browser-qa.json',JSON.stringify({passed:5,checks:['10 public site cards','10 CAD links','10 rendered source footprint SVGs','mobile viewport fits','no uncaught browser errors'],errors},null,2));console.log('5 public CAD pilot browser checks passed');
}finally{await browser.close();}
