import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSourceCache } from '@/lib/sourceCache';
import { validateRecoveryPayload } from '@/lib/orpaynter/recovery';
import { GET } from './route';

vi.mock('@/lib/stealthFetch', () => ({ stealthFetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args) }));

const eonet = { events: [{ id: 'observed-storm', title: 'Observed storm', categories: [{ id: 'severeStorms' }], geometry: [{ type: 'Point', coordinates: [-70, 41], date: '2026-10-04T09:00:00Z' }] }] };
function workingProvider(url: string | URL | Request) {
  if (String(url).includes('eonet')) return Promise.resolve(Response.json(eonet));
  if (String(url).includes('weather.gov')) return Promise.resolve(Response.json({ features: [] }));
  return Promise.resolve(new Response('<rss><channel></channel></rss>'));
}

beforeEach(() => {
  clearSourceCache();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-04T10:00:00Z'));
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('bounded weather reads', () => {
  it('clears a stuck shared refresh and allows a later provider recovery', async () => {
    const signals: AbortSignal[] = [];
    const upstream = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
      signals.push(init?.signal as AbortSignal);
      return new Promise<Response>(() => {});
    });
    vi.stubGlobal('fetch', upstream);
    const pending = [GET(), GET()];
    await vi.advanceTimersByTimeAsync(6_001);
    const responses = await Promise.all(pending);
    for (const response of responses) {
      const body = await response.json();
      expect(body).toMatchObject({ events: [], timestamp: null, source: 'weather+unavailable', cacheStatus: 'unavailable' });
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(() => validateRecoveryPayload('weather', body)).toThrow('unavailable');
    }
    expect(upstream).toHaveBeenCalledTimes(3);
    expect(signals.every(signal => signal.aborted)).toBe(true);
    upstream.mockImplementation(workingProvider);
    const recovered = await (await GET()).json();
    expect(recovered.cacheStatus).toBe('fresh');
    expect(recovered.events).toHaveLength(1);
  });

  it('bounds an unresponsive response body while retaining the working provider', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string | URL | Request) => {
      if (String(url).includes('eonet')) return Promise.resolve({ ok: true, json: () => new Promise(() => {}) } as Response);
      if (String(url).includes('weather.gov')) return Promise.resolve(Response.json({ features: [{ geometry: { type: 'Point', coordinates: [-70, 41] }, properties: { id: 'nws-observation', event: 'Storm warning' } }] }));
      return Promise.reject(new Error('GDACS offline'));
    }));
    const pending = GET();
    await vi.advanceTimersByTimeAsync(6_001);
    const body = await (await pending).json();
    expect(body.cacheStatus).toBe('fresh');
    expect(body.events).toHaveLength(1);
    expect(body.events[0].provider).toBe('NOAA/NWS');
  });

  it('preserves old observation time and prevents a stale cache from claiming healthy', async () => {
    const upstream = vi.fn(workingProvider);
    vi.stubGlobal('fetch', upstream);
    const first = await (await GET()).json();
    await vi.advanceTimersByTimeAsync(180_001);
    upstream.mockRejectedValue(new Error('all providers offline'));
    const response = await GET();
    const retained = await response.json();
    expect(retained.events).toEqual(first.events);
    expect(retained.timestamp).toBe(first.timestamp);
    expect(retained.checkedAt).not.toBe(first.checkedAt);
    expect(retained.source).toBe('weather+stale');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(() => validateRecoveryPayload('weather', retained)).toThrow('stale');
  });

  it('does not let a late response replace a completed newer refresh', async () => {
    let finishOld!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finishOld = resolve; })));
    const timedOut = GET();
    await vi.advanceTimersByTimeAsync(6_001);
    await timedOut;
    vi.stubGlobal('fetch', vi.fn(workingProvider));
    const fresh = await (await GET()).json();
    finishOld(Response.json({ events: [] }));
    await vi.advanceTimersByTimeAsync(1);
    const afterLateResponse = await (await GET()).json();
    expect(afterLateResponse.events).toEqual(fresh.events);
    expect(afterLateResponse.timestamp).toBe(fresh.timestamp);
  });
});
