import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRecoveryReader, recoveryHash, validateRecoveryPayload, type RecoverySource } from './recovery';
const directories: string[] = [];
const TIME = Date.parse('2026-09-30T03:00:00.000Z');
const satellite = () => ({ satellites: [{ id: 'public-tle', lat: 32, lng: -97, alt: 415 }], timestamp: new Date(TIME).toISOString(), source: 'public orbital elements' });
const company = () => ({ github: { status: 'connected', owner: 'orpaynter', accountId: 127189622 }, revision: 'a'.repeat(64), checkedAt: new Date(TIME).toISOString(), work: [{ id: 'github:orpaynter/AIA:pull_request:126', repo: 'orpaynter/AIA', number: 126, kind: 'pull_request', title: 'World Twin', url: 'https://github.com/orpaynter/AIA/pull/126', updatedAt: new Date(TIME).toISOString() }] });
async function harness(capture: (source: RecoverySource, origin: string) => Promise<unknown>) {
  const directory = await mkdtemp(path.join(tmpdir(), 'orpa-recovery-')); directories.push(directory);
  let time = TIME;
  const deps = { directory, capture, now: () => time, sleep: async (ms: number) => { time += ms; } };
  return { reader: createRecoveryReader(deps), deps, directory, advance: (ms: number) => { time += ms; } };
}
afterEach(async () => { await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true }))); });
describe('bounded read-only self healing', () => {
  it('retains original last-good receipt through failure, circuit, then recovers from valid provider data', async () => {
    let failed = false;
    const capture = vi.fn(async () => { if (failed) throw new Error('provider offline'); return { events: [{ id: 'warning', lat: 31, lng: -96 }], source: 'NOAA' }; });
    const h = await harness(capture);
    const first = await h.reader.read('weather', 'http://127.0.0.1:4180'); expect(first.recovery.status).toBe('healthy');
    h.advance(60_001); failed = true;
    const fallback = await h.reader.read('weather', 'http://127.0.0.1:4180');
    expect(fallback.recovery.status).toBe('degraded'); expect(fallback.recovery.attempts).toBe(2); expect(fallback.recovery.failures).toBe(2);
    expect(fallback.recovery.receivedAt).toBe(first.recovery.receivedAt); expect(fallback.recovery.lastGoodHash).toBe(first.recovery.lastGoodHash); expect(fallback.payload).toEqual(first.payload);
    await h.reader.read('weather', 'http://127.0.0.1:4180'); expect(capture).toHaveBeenCalledTimes(3);
    h.advance(5_001); failed = false;
    const recovered = await h.reader.read('weather', 'http://127.0.0.1:4180'); expect(recovered.recovery.status).toBe('recovered'); expect(recovered.recovery.failures).toBe(0); expect(recovered.recovery.receivedAt).not.toBe(first.recovery.receivedAt);
    expect(recovered.recovery.events.map(event => event.kind)).toContain('degraded');
  });
  it('exposes retrying and deduplicates concurrent readers without duplicated provider work', async () => {
    let resolve!: (value: unknown) => void;
    const capture = vi.fn(() => new Promise<unknown>(r => { resolve = r; })); const h = await harness(capture);
    const first = h.reader.read('satellites', 'http://localhost:4180'); const second = h.reader.read('satellites', 'http://localhost:4180');
    await vi.waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    const summary = await h.reader.summary(); expect(summary.sources.find(row => row.source === 'satellites')?.status).toBe('retrying');
    resolve(satellite()); expect(await second).toEqual(await first); expect(capture).toHaveBeenCalledTimes(1);
  });
  it('retries malformed positions but never accepts or stores the bad geometry', async () => {
    const h = await harness(async () => ({ ...satellite(), satellites: [{ lat: 95, lng: -97 }] }));
    const result = await h.reader.read('satellites', 'http://localhost:4180'); expect(result.payload).toBe(null); expect(result.recovery.status).toBe('unavailable'); expect(result.recovery.attempts).toBe(2);
    const stored = JSON.parse(await readFile(path.join(h.directory, 'satellites.json'), 'utf8')); expect(stored.payload).toBe(null);
  });
  it('HTTP 200 error-shaped packets and provider stale fallback cannot claim healthy', async () => {
    for (const packet of [{ events: [], error: 'unavailable' }, { events: [], source: 'provider+stale' }, { message: 'upstream failed' }]) {
      const h = await harness(async () => packet); const result = await h.reader.read('weather', 'http://localhost:4180'); expect(result.recovery.status).toBe('unavailable');
    }
  });
  it('allows a valid empty event list without inventing activity', async () => {
    const h = await harness(async () => ({ events: [], total: 0 })); const result = await h.reader.read('weather', 'http://localhost:4180'); expect(result.recovery.status).toBe('healthy'); expect(result.payload?.events).toEqual([]);
  });
  it('blocks identity mismatch immediately and clears previously accepted owner data', async () => {
    let mismatch = false; const capture = vi.fn(async () => mismatch ? { ...company(), github: { status: 'owner_mismatch', owner: 'orpaynter', accountId: 999 } } : company()); const h = await harness(capture);
    expect((await h.reader.read('company', 'http://localhost:4180')).payload?.work).toHaveLength(1); h.advance(30_001); mismatch = true;
    const blocked = await h.reader.read('company', 'http://localhost:4180'); expect(blocked.recovery.status).toBe('blocked'); expect(blocked.payload).toBe(null); expect(blocked.recovery.lastGoodHash).toBe(null); expect(blocked.recovery.attempts).toBe(1);
    const disk = JSON.parse(await readFile(path.join(h.directory, 'company.json'), 'utf8')); expect(disk.payload).toBe(null);
  });
  it('company unavailable is not ready and scoped URL injection is blocked', async () => {
    const h = await harness(async () => ({ ...company(), github: { status: 'unavailable', owner: 'orpaynter', accountId: null } }));
    expect((await h.reader.read('company', 'http://localhost:4180')).recovery.status).toBe('unavailable');
    const bad = company(); bad.work[0].url = 'https://evil.example/capture'; expect(() => validateRecoveryPayload('company', bad)).toThrow('scope');
  });
  it('loads a validated last-good packet after restart and preserves its receipt', async () => {
    const h = await harness(async () => ({ events: [{ lat: 32, lng: -97 }] })); const first = await h.reader.read('weather', 'http://localhost:4180'); h.advance(60_001);
    const restored = createRecoveryReader({ ...h.deps, capture: async () => { throw new Error('offline'); } }); const result = await restored.read('weather', 'http://localhost:4180');
    expect(result.recovery.status).toBe('degraded'); expect(result.recovery.receivedAt).toBe(first.recovery.receivedAt); expect(result.recovery.lastGoodHash).toBe(first.recovery.lastGoodHash);
  });
  it('rejects corrupted persisted hash before it can become a fallback', async () => {
    const h = await harness(async () => ({ events: [{ lat: 32, lng: -97 }] })); await h.reader.read('weather', 'http://localhost:4180');
    const file = path.join(h.directory, 'weather.json'); const disk = JSON.parse(await readFile(file, 'utf8')); disk.payload.events[0].lat = 40; await writeFile(file, JSON.stringify(disk));
    const restored = createRecoveryReader({ ...h.deps, capture: async () => { throw new Error('offline'); } }); const result = await restored.read('weather', 'http://localhost:4180');
    expect(result.payload).toBe(null); expect(result.recovery.status).toBe('unavailable'); expect(result.recovery.events.map(event => event.kind)).toContain('rejected-cache');
  });
  it('retains a persisted failure circuit across restart instead of hammering providers', async () => {
    const h = await harness(async () => { throw new Error('offline'); }); await h.reader.read('weather', 'http://localhost:4180');
    const capture = vi.fn(async () => ({ events: [] })); const restored = createRecoveryReader({ ...h.deps, capture });
    expect((await restored.read('weather', 'http://localhost:4180')).recovery.status).toBe('unavailable'); expect(capture).not.toHaveBeenCalled();
  });
  it('never restores company work across restart before the current owner is authenticated', async () => {
    const h = await harness(async () => company()); await h.reader.read('company', 'http://localhost:4180');
    const capture = vi.fn(async () => ({ ...company(), github: { status: 'unavailable', owner: 'orpaynter', accountId: null } }));
    const restored = createRecoveryReader({ ...h.deps, capture });
    const before = await restored.summary(); expect(before.sources.find(row => row.source === 'company')?.lastGoodHash).toBe(null);
    const result = await restored.read('company', 'http://localhost:4180'); expect(capture).toHaveBeenCalledTimes(2); expect(result.payload).toBe(null); expect(result.recovery.status).toBe('unavailable');
  });
  it('checks a stale modeled epoch and never turns old positions into fresh positions', async () => {
    const h = await harness(async () => satellite()); h.advance(100_000);
    expect((await h.reader.read('satellites', 'http://localhost:4180')).recovery.status).toBe('unavailable');
  });
  it('rejects arbitrary source and nonlocal origins before capture', async () => {
    const capture = vi.fn(async () => ({ events: [] })); const h = await harness(capture);
    await expect(h.reader.read('http://evil.example' as RecoverySource, 'http://localhost:4180')).rejects.toThrow('scope');
    await expect(h.reader.read('weather', 'https://evil.example')).rejects.toThrow('scope');
    await expect(h.reader.read('weather', 'http://localhost:4180/arbitrary')).rejects.toThrow('scope'); expect(capture).not.toHaveBeenCalled();
  });
  it('hashes equivalent objects consistently and removes secret-bearing keys before persistence', () => {
    expect(recoveryHash({ b: 2, a: [1] })).toBe(recoveryHash({ a: [1], b: 2 }));
    const packet = validateRecoveryPayload('weather', { events: [], authorization: 'private', metadata: { access_token: 'private', provider: 'NOAA' } });
    expect(packet.authorization).toBeUndefined(); expect(packet.metadata).toEqual({ provider: 'NOAA' });
  });
});
