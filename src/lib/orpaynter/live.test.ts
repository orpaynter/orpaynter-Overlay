import { describe, expect, it } from 'vitest';
import { feedReceipt, receiptState, elapsed } from './live';
describe('source freshness receipts',()=>{
 it('distinguishes calculated orbital positions from observations',()=>{const r=feedReceipt('/api/satellites',{satellites:[{}],timestamp:new Date(100000).toISOString()},true,100000)!;expect(receiptState(r,100001)).toBe('modeled');expect(r.sourceAt).toBe(100000);expect(receiptState(r,180001)).toBe('stale');});
 it('does not make old markers fresh after a failed refresh',()=>{const a=feedReceipt('/api/weather',{events:[{}]},true,100000)!;const b=feedReceipt('/api/weather',null,false,200000,a)!;expect(b.receivedAt).toBe(100000);expect(b.count).toBe(1);expect(b.attemptedAt).toBe(200000);expect(receiptState(b,200000)).toBe('unavailable');});
 it('detects provider error documents returned with HTTP 200',()=>{expect(feedReceipt('/api/gdelt',{events:[],error:'unavailable'},true,100000)?.state).toBe('unavailable');});
 it('separates reference catalogues and empty responses',()=>{expect(receiptState(feedReceipt('/api/cctv',{cameras:[{}]},true,100000)!,100000)).toBe('reference');expect(receiptState(feedReceipt('/api/maritime',{ships:[]},true,100000)!,100000)).toBe('empty');});
 it('keeps explicitly stale provider payloads stale after a successful fetch',()=>{expect(receiptState(feedReceipt('/api/flights',{commercial_flights:[{},{}],source:'adsb+stale'},true,100000)!,100000)).toBe('stale');});
 it('counts the actual flight categories without double counting totals',()=>{expect(feedReceipt('/api/flights',{commercial_flights:[{},{}],private_flights:[{}],private_jets:[],military_flights:[{}],total:4},true,100000)?.count).toBe(4);});
 it('maps USGS metadata timestamp and leaves absent timestamps unknown',()=>{expect(feedReceipt('https://earthquake.usgs.gov/feed',{features:[{}],metadata:{generated:5000}},true,100000)?.sourceAt).toBe(5000);expect(feedReceipt('/api/weather',{events:[]},true,100000)?.sourceAt).toBeNull();expect(elapsed(null,100000)).toBe('time unknown');});
});
