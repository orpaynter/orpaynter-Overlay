import { beforeEach, describe, expect, it, vi } from 'vitest';
const fs = vi.hoisted(() => ({readFile: vi.fn(), realpath: vi.fn()}));
vi.mock('node:fs/promises', () => fs);
import { getGrokLearningStatus } from './grok-learning';
const id = '20261002-035932';
const run = `C:\\Users\\OrPay\\.grok\\learn\\runs\\${id}`;
let state: Record<string, unknown>, manifest: Record<string, unknown>, actions: Record<string, unknown>[], decisions: Record<string, unknown>[], current: string;
describe('existing Grok learning evidence', () => {
 beforeEach(() => {
  vi.clearAllMocks();state={last_completed_dir:run,last_completed_at:'2026-10-02T04:47:06Z',sessions_kept:25,pending:{status:'done',run_dir:run}};
  manifest={run_dir:run,sessions_kept:25};
  actions=[{id:'A1',kind:'skill',action:'edit',target:'orpaynter-command-stack',path:'NEVER_READ_THIS',edit:{replacement:'Oliver is the only human GO.'}},{id:'A2',kind:'plugin',target:'supabase'}];
  decisions=[{id:'A1',run_dir:run,kind:'skill',target:'orpaynter-command-stack',decision:'applied'},{id:'A2',run_dir:run,kind:'plugin',target:'supabase',decision:'deferred'}];
  current='Private context omitted. Oliver is the only human GO.';
  fs.realpath.mockImplementation(async (value: string) => value);
  fs.readFile.mockImplementation(async (file: string) => Buffer.from(file.endsWith('state.json')?JSON.stringify(state):file.endsWith('manifest.json')?JSON.stringify(manifest):file.endsWith('actions.json')?JSON.stringify({run_dir:run,actions}):file.endsWith('decisions.jsonl')?decisions.map(d=>JSON.stringify(d)).join('\n'):current));
 });
 it('checks applied edits against current instructions without returning private text or paths',async()=>{
  const r=await getGrokLearningStatus();expect(r).toMatchObject({status:'verified',sessionsKept:25,appliedUpdates:1,verifiedUpdates:1,deferredActions:1});
  expect(JSON.stringify(r)).not.toContain('Private context');expect(JSON.stringify(r)).not.toContain('C:');
  expect(r.provenance.actions).toMatch(/^[0-9a-f]{64}$/);expect(fs.readFile.mock.calls.some(([p])=>p==='NEVER_READ_THIS')).toBe(false);
 });
 it('marks a changed applied instruction incomplete',async()=>{current='Rule removed';expect(await getGrokLearningStatus()).toMatchObject({status:'incomplete',verifiedUpdates:0,appliedUpdates:1});});
 it('does not promote an unfinished or mismatched run',async()=>{state.pending={status:'curating',run_dir:run};expect((await getGrokLearningStatus()).status).toBe('unavailable');expect(fs.readFile).toHaveBeenCalledTimes(1);});
 it('refuses inconsistent session counts and run directory traversal',async()=>{manifest.sessions_kept=26;expect((await getGrokLearningStatus()).status).toBe('unavailable');state.last_completed_dir=run+'/../secret';expect((await getGrokLearningStatus()).status).toBe('unavailable');});
 it('never reads action-supplied targets and obeys the latest decision',async()=>{actions[0].target='unknown';decisions[0].target='unknown';const r=await getGrokLearningStatus();expect(r.verifiedUpdates).toBe(0);expect(fs.readFile.mock.calls).toHaveLength(4);actions[0].target='orpaynter-command-stack';decisions[0].target='orpaynter-command-stack';decisions.push({...decisions[0],decision:'deferred'});expect((await getGrokLearningStatus()).appliedUpdates).toBe(0);});
 it('returns unavailable for missing files or a symlink outside the run root',async()=>{fs.readFile.mockRejectedValueOnce(new Error('missing'));expect((await getGrokLearningStatus()).status).toBe('unavailable');fs.realpath.mockImplementation(async (p:string)=>p.endsWith(id)?'/outside':p);expect((await getGrokLearningStatus()).status).toBe('unavailable');});
});
