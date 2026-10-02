export type FeedReceipt = {
  id: string;
  name: string;
  state: 'available' | 'empty' | 'unavailable';
  receivedAt: number | null;
  attemptedAt: number;
  sourceAt: number | null;
  cadenceMs: number;
  mode: 'model' | 'provider' | 'reference';
  count: number | null;
  providerStale?: boolean;
};
const SPECS: Record<string, {name:string;cadenceMs:number;mode:FeedReceipt['mode'];fields:string[]}> = {
  '/api/satellites': {name:'Satellite positions',cadenceMs:30000,mode:'model',fields:['satellites']},
  '/api/weather': {name:'Weather warnings',cadenceMs:60000,mode:'provider',fields:['events']},
  '/api/earthquakes': {name:'Reported earthquakes',cadenceMs:60000,mode:'provider',fields:['earthquakes']},
  '/api/news': {name:'World news',cadenceMs:300000,mode:'provider',fields:['news']},
  '/api/flights': {name:'Aircraft feed',cadenceMs:60000,mode:'provider',fields:['commercial_flights','private_flights','private_jets','military_flights']},
  '/api/maritime': {name:'Maritime feed',cadenceMs:300000,mode:'provider',fields:['ships']},
  '/api/gdelt': {name:'Incident reports',cadenceMs:300000,mode:'provider',fields:['events']},
  '/api/cyber-attacks': {name:'Cyber indicators',cadenceMs:300000,mode:'provider',fields:['indicators']},
  '/api/cctv': {name:'Camera catalogue',cadenceMs:3600000,mode:'reference',fields:['cameras']},
  '/api/infrastructure': {name:'Infrastructure catalogue',cadenceMs:3600000,mode:'reference',fields:['infrastructure']},
};
export function feedReceipt(url:string,body:unknown,ok:boolean,now:number,prior?:FeedReceipt):FeedReceipt|null {
  const id=url.includes('earthquake.usgs.gov')?'/api/earthquakes':url.split('?')[0];
  const spec=SPECS[id];if(!spec)return null;
  const d=body&&typeof body==='object'?body as Record<string,unknown>:{};
  if(!ok||typeof d.error==='string')return {id,...spec,state:'unavailable',receivedAt:prior?.receivedAt??null,attemptedAt:now,sourceAt:prior?.sourceAt??null,count:prior?.count??null};
  const counts=spec.fields.map(key=>Array.isArray(d[key])?(d[key] as unknown[]).length:null);
  if(Array.isArray(d.features))counts.push(d.features.length);
  const count=id==='/api/flights'?counts.filter((v):v is number=>v!==null).reduce((a,b)=>a+b,0):counts.find(v=>v!==null)??null;
  const metadata=d.metadata&&typeof d.metadata==='object'?d.metadata as Record<string,unknown>:{};
  const stamp=d.timestamp??d.fetchedAt??metadata.generated;
  const sourceAt=typeof stamp==='number'?stamp:typeof stamp==='string'?Date.parse(stamp):NaN;
  return {id,...spec,state:count===0?'empty':'available',receivedAt:now,attemptedAt:now,sourceAt:Number.isFinite(sourceAt)?sourceAt:null,count,providerStale:typeof d.source==='string'&&d.source.includes('+stale')};
}
export function receiptState(receipt:FeedReceipt,now:number) {
  if(receipt.state==='unavailable')return 'unavailable';
  if(receipt.receivedAt===null)return 'unknown';
  if(receipt.providerStale)return 'stale';
  if(now-receipt.receivedAt>receipt.cadenceMs*2+15000)return 'stale';
  if(receipt.mode==='reference')return 'reference';
  return receipt.state==='empty'?'empty':receipt.mode==='model'?'modeled':'updated';
}
export function elapsed(when:number|string|null|undefined,now:number) {
  const time=typeof when==='string'?Date.parse(when):when;
  if(typeof time!=='number'||!Number.isFinite(time))return 'time unknown';
  const seconds=Math.max(0,Math.floor((now-time)/1000));
  return seconds<60?`${seconds}s ago`:seconds<3600?`${Math.floor(seconds/60)}m ago`:`${Math.floor(seconds/3600)}h ago`;
}
