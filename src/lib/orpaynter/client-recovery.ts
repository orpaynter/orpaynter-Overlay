import { feedReceipt,type FeedReceipt } from './live';
const SOURCES=new Set(['satellites','weather','news','flights','maritime','gdelt','cyber-attacks']);
export function recoverySourceFor(url:string):string|null {if(url.startsWith('https://earthquake.usgs.gov/'))return 'earthquakes';const name=url.split('?')[0].replace('/api/','');return SOURCES.has(name)?name:null;}
export function recoveredReceipt(url:string,envelope:{payload:unknown;recovery:{status:string;receivedAt:string|null}},now:number,prior?:FeedReceipt):FeedReceipt|null {
 const receivedAt=envelope.recovery.receivedAt?Date.parse(envelope.recovery.receivedAt):NaN;
 if(!envelope.payload||!Number.isFinite(receivedAt))return feedReceipt(url,null,false,now,prior);
 const receipt=feedReceipt(url,envelope.payload,true,receivedAt);
 if(!receipt)return null;
 return {...receipt,attemptedAt:now,...(!['healthy','recovered'].includes(envelope.recovery.status)?{state:'unavailable' as const}:{})};
}
