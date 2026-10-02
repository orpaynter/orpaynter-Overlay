'use client';
import { useEffect, useState } from 'react';
import { Bot, X, RefreshCw, Download, ArrowUpRight, ShieldCheck, Radio, FileSearch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CompanyWork } from '@/lib/orpaynter/company';
import type { ObservationSnapshot } from '@/lib/orpaynter/observations';

type Runtime = {ready:boolean;installed:boolean;version:string|null;pluginCount:number;toolPolicy:string};
type Run = {runId:string;status:string;snapshotId:string;objective:string;startedAt:string;completedAt?:string;text?:string;error?:string;companyWork?:CompanyWork;externalAction:false};
const STORAGE='orpaynter.osiris.last-run.v1';
export default function OrPaynterWorkspace({revealed,selectedCompanyWork}:{revealed:boolean;selectedCompanyWork:CompanyWork|null}) {
 const [open,setOpen]=useState(false),[runtime,setRuntime]=useState<Runtime|null>(null);
 const [snapshot,setSnapshot]=useState<ObservationSnapshot|null>(null),[loading,setLoading]=useState(false),[running,setRunning]=useState(false);
 const [run,setRun]=useState<Run|null>(null),[error,setError]=useState('');
 const [captureMode,setCaptureMode]=useState<'updating'|'frozen'>('updating');
 const [objective,setObjective]=useState('Summarize the public signals, explain uncertainty, and identify one useful next investigation for OrPaynter.');
 useEffect(()=>{fetch('/api/orpaynter/runtime').then(r=>r.json()).then(setRuntime).catch(()=>{});fetch('/api/orpaynter/grok').then(r=>r.json()).then(data=>{if(data?.runId)setRun(data);}).catch(()=>{});try{const prior=JSON.parse(localStorage.getItem(STORAGE)||'null');if(prior?.runId && prior?.status)setRun(prior);}catch{}},[]);
 useEffect(()=>{if(!open)return;const handle=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);},[open]);
 useEffect(()=>{if(!selectedCompanyWork)return;setOpen(true);setObjective(`Investigate this OrPaynter task: ${selectedCompanyWork.title}. Use the current public signals and task metadata; identify the smallest useful next step and missing evidence.`);},[selectedCompanyWork]);
 useEffect(()=>{if(!open||running||captureMode==='frozen')return;void capture();const timer=setInterval(()=>void capture(),60000);return()=>clearInterval(timer);},[open,running,captureMode]);
 async function capture(snapshotId?:string) {
  setLoading(true);setError('');
  try {const response=await fetch('/api/orpaynter/observations'+(snapshotId?'?snapshotId='+encodeURIComponent(snapshotId):''));const data=await response.json();if(!response.ok||!data.id)throw new Error(data.error||'Capture unavailable.');setSnapshot(data);}
  catch(e){setError(e instanceof Error?e.message:'Capture unavailable.');}finally{setLoading(false);}
 }
 function show(){setOpen(true);}
 async function analyze(){if(!snapshot||running)return;setRunning(true);setError('');
  try {const response=await fetch('/api/orpaynter/grok',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({snapshotId:snapshot.id,objective,...(selectedCompanyWork?{companyWorkId:selectedCompanyWork.id}:{})})});
   const data=await response.json();if(data.runId){setRun(data);localStorage.setItem(STORAGE,JSON.stringify(data));}if(!response.ok)throw new Error(data.error||'Grok did not complete.');
  }catch(e){setError(e instanceof Error?e.message:'Grok unavailable.');}finally{setRunning(false);}
 }
 function save(value:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const available=!!snapshot?.feeds.some(f=>f.status==='available'&&f.items.length);
 return <>
  {revealed && <button className="orpa-launch orpa-overlay-launch" aria-label="Open OrPaynter workspace" onClick={show}><Bot size={21}/><span><strong>ORPAYNTER OVERLAY</strong><small>{run?.status==='completed'?'Grok job completed':runtime?.ready?'Grok ready · source-led analysis':runtime?.installed?'Grok installed · check sign-in':'Connecting existing Grok setup'}</small></span><ArrowUpRight size={17}/></button>}
  {open && <section className="orpa-workspace" aria-label="OrPaynter intelligence workspace">
   <header><div><span className="orpa-eyebrow">ORPAYNTER OVERLAY → SOURCED WORK</span><h2>Your world, with memory.</h2></div><button aria-label="Close OrPaynter workspace" onClick={()=>setOpen(false)}><X size={20}/></button></header>
   <div className="orpa-runtime"><Bot size={21}/><div><strong>{runtime?.ready?'Your Grok Bot is available':runtime?.installed?'Grok Bot needs sign-in':'Checking Grok Bot'}</strong><p>{runtime?.version?`v${runtime.version} · `:''}{runtime?.pluginCount||0} configured plugins · analysis only</p></div><span className={runtime?.ready?'ready':'unknown'}>{runtime?.ready?'READY':'CHECK'}</span></div>
   <p className="orpa-copy">Connect real work to public signals. Follow updating sources or freeze a capture to inspect the world as it was recorded. Grok reasons over the exact capture you choose.</p>
   <a className="orpa-cad-link" href="/orpaynter-cad/index.html" target="_blank" rel="noreferrer"><span><strong>Explore the public CAD pilot</strong><small>10 source footprints · DXF exports · stated accuracy</small></span><ArrowUpRight size={18}/></a>
   <div className="orpa-time-modes" role="group" aria-label="Source capture mode"><button aria-pressed={captureMode==='updating'} disabled={running||loading} onClick={()=>setCaptureMode('updating')}>Updating sources</button><button aria-pressed={captureMode==='frozen'} disabled={!snapshot||running||loading} onClick={()=>setCaptureMode('frozen')}>Freeze this capture</button>{run&&<button disabled={running||loading} onClick={()=>{setCaptureMode('frozen');void capture(run.snapshotId);}}>Open saved job capture</button>}</div>
   <p className="orpa-limit" data-capture-mode={captureMode}>{captureMode==='frozen'?'Frozen source capture · original time and identity retained. The globe and company reads continue updating separately.':'Updating capture · refreshes every minute while this panel is open. Provider timestamps and coverage still apply.'}</p>
   <div className="orpa-section-title"><Radio size={17}/><strong>Source snapshot</strong><button aria-label="Refresh source snapshot" disabled={loading||running||captureMode==='frozen'} onClick={()=>void capture()}><RefreshCw size={14}/>{loading?'Capturing…':'Refresh'}</button></div>
   {loading && <p className="orpa-empty" role="status">Asking the public sources. Counts appear when their responses arrive.</p>}
   {!snapshot&&!loading && <p className="orpa-empty">No source snapshot captured yet.</p>}
   {snapshot && <><div className="orpa-feed-grid">{snapshot.feeds.map(f=><div key={f.id}><span>{f.name}</span><strong>{f.status==='unavailable'?'Unavailable':f.total.toLocaleString()}</strong><small>{f.status==='available'?`Returned records · ${f.items.length} sampled` : f.status==='empty'?'Empty response · coverage unknown':f.error}</small></div>)}</div><div className="orpa-capture-meta">Captured {new Date(snapshot.capturedAt).toLocaleTimeString()} · ID {snapshot.id.slice(0,10)}<button aria-label="Export source snapshot" onClick={()=>save(snapshot,'orpaynter-public-source-snapshot.json')}><Download size={13}/></button></div><details className="orpa-records"><summary><FileSearch size={15}/>Inspect observations & provenance</summary>{snapshot.feeds.map(f=><div key={f.id}><a href={f.url} target="_blank" rel="noreferrer">{f.name} <ArrowUpRight size={12}/></a><p>{f.interpretation}</p><small>SHA-256 {f.rawHash?.slice(0,18)||'unavailable'} · fetched {f.fetchedAt}</small>{f.items.map((item,i)=><article key={item.id+'-'+i}><strong>{item.title}</strong><span>{item.detail}</span><small>{item.reportedAt||'Observation time unknown'}</small>{item.link&&<a href={item.link} target="_blank" rel="noreferrer">Source record <ArrowUpRight size={11}/></a>}</article>)}</div>)}</details></>}
   <div className="orpa-section-title"><Bot size={17}/><strong>A real Grok job</strong><span>{selectedCompanyWork?'COMPANY TASK':'PUBLIC SOURCES'}</span></div>
   {selectedCompanyWork&&<div className="orpa-company-context"><a href={selectedCompanyWork.url} target="_blank" rel="noreferrer">{selectedCompanyWork.repo} #{selectedCompanyWork.number}<ArrowUpRight size={12}/></a><p>{selectedCompanyWork.title}</p><small>Open repository record · {selectedCompanyWork.draft?'draft proposal':'work item'} · verified again before each job</small></div>}
   <label htmlFor="orpa-objective">What should Grok investigate?</label><textarea id="orpa-objective" value={objective} maxLength={1200} rows={3} onChange={e=>setObjective(e.target.value)} disabled={running}/>
   <button className="orpa-run" disabled={!available||running||loading||!objective.trim()||!runtime?.installed} onClick={analyze}><Bot size={18}/>{running?'Grok is analyzing this snapshot…':'Run Grok analysis'}<ArrowUpRight size={16}/></button>
   <p className="orpa-limit">One bounded analysis through your configured account. Source text is data. Grok can reason here; no tools or external actions are enabled.</p>
   {error&&<div className="orpa-error" role="alert">{error}</div>}
   {run && <div className="orpa-result"><div className="orpa-section-title"><strong>{run.status==='completed'?'Completed Grok analysis':['starting','running'].includes(run.status)?'Grok job in progress':'Grok run did not complete'}</strong><button onClick={()=>save(run,'orpaynter-grok-run.json')} aria-label="Export Grok run"><Download size={15}/></button></div><p className="orpa-run-meta">Run {run.runId.slice(0,8)} · input {run.snapshotId.slice(0,10)}<br/>{run.completedAt?new Date(run.completedAt).toLocaleString():''} · no external action{run.companyWork&&<><br/>{run.companyWork.repo} #{run.companyWork.number} · source-bound job</>}</p><div className="orpa-analysis">{run.text ? <ReactMarkdown components={{a:props=><a {...props} target="_blank" rel="noreferrer"/>}}>{run.text}</ReactMarkdown> : run.error}</div>{selectedCompanyWork&&run.companyWork?.id!==selectedCompanyWork.id&&<p className="orpa-limit">This saved response belongs to a different task or a public-only investigation. It is not a completed analysis of your selected work.</p>}{snapshot&&snapshot.id!==run.snapshotId&&<p className="orpa-limit">This saved analysis belongs to a previous snapshot. Run Grok again to analyze the new capture.</p>}</div>}
   <footer><ShieldCheck size={17}/><span>AIA retains authority. Observations and proposals do not authorize action.</span></footer>
  </section>}
 </>;
}
