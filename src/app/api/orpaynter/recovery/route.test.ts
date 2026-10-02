import { beforeEach, describe, expect, it, vi } from 'vitest';
const read = vi.hoisted(() => vi.fn(async () => ({ payload: { events: [] }, recovery: { status: 'healthy' } })));
const summary = vi.hoisted(() => vi.fn(async () => ({ sources: [], events: [] })));
vi.mock('@/lib/orpaynter/recovery', () => ({ getRecoveredSource: read, getRecoverySummary: summary, RECOVERY_SOURCES: ['satellites', 'weather', 'earthquakes', 'news', 'flights', 'maritime', 'gdelt', 'cyber-attacks', 'company'] }));
import { GET } from './route';
beforeEach(() => { read.mockClear(); summary.mockClear(); });
describe('local fixed-source recovery route', () => {
  it('rejects nonlocal and cross-origin access before any provider read', async () => {
    expect((await GET(new Request('https://public.example/api/orpaynter/recovery?source=company'))).status).toBe(403);
    expect((await GET(new Request('http://localhost:4180/api/orpaynter/recovery?source=company', { headers: { origin: 'https://evil.example' } }))).status).toBe(403);
    expect(read).not.toHaveBeenCalled(); expect(summary).not.toHaveBeenCalled();
  });
  it('rejects URLs, extra query controls and duplicate source before capture', async () => {
    for (const query of ['source=https://evil.example', 'source=weather&url=https://evil.example', 'source=weather&source=company', 'source=weather&force=1']) expect((await GET(new Request(`http://localhost:4180/api/orpaynter/recovery?${query}`))).status).toBe(400);
    expect(read).not.toHaveBeenCalled();
  });
  it('serves only the selected fixed reader using the local request origin', async () => {
    const result = await GET(new Request('http://localhost:4180/api/orpaynter/recovery?source=weather')); expect(result.status).toBe(200); expect(result.headers.get('Cache-Control')).toBe('no-store'); expect(read).toHaveBeenCalledWith('weather', 'http://localhost:4180');
  });
  it('summary is read-only metadata and does not dispatch a source read', async () => {
    expect((await GET(new Request('http://localhost:4180/api/orpaynter/recovery'))).status).toBe(200); expect(summary).toHaveBeenCalledTimes(1); expect(read).not.toHaveBeenCalled();
  });
});
