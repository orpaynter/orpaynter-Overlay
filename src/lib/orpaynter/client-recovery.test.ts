import {describe,it,expect} from 'vitest';
import {recoveredReceipt,recoverySourceFor} from './client-recovery';
describe('recovery receipts retain data age',()=>{
 it('does not call retained satellite positions fresh after recovery failure',()=>{const r=recoveredReceipt('/api/satellites',{payload:{satellites:[{}],timestamp:'2026-09-30T01:00:00Z'},recovery:{status:'degraded',receivedAt:'2026-09-30T01:00:00Z'}},Date.parse('2026-09-30T02:00:00Z'))!;expect(r.receivedAt).toBe(Date.parse('2026-09-30T01:00:00Z'));expect(r.state).toBe('unavailable');expect(r.count).toBe(1);});
 it('routes only fixed recovery sources',()=>{expect(recoverySourceFor('/api/satellites')).toBe('satellites');expect(recoverySourceFor('https://earthquake.usgs.gov/feed')).toBe('earthquakes');expect(recoverySourceFor('https://example.com/api/satellites')).toBeNull();expect(recoverySourceFor('/api/osint/sweep')).toBeNull();});
});
