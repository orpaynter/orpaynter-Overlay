import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('property pilot readiness boundary', () => {
  it('is local-only and reports the pilot as blocked without accepting records or enabling authority', async () => {
    const remote = await GET(new Request('https://public.example/api/orpaynter/pilot/readiness'));
    expect(remote.status).toBe(403);

    const local = await GET(new Request('http://localhost:4180/api/orpaynter/pilot/readiness', {
      headers: { host: 'localhost:4180', origin: 'http://localhost:4180' },
    }));
    const readiness = await local.json();
    expect(local.headers.get('cache-control')).toBe('no-store');
    expect(readiness).toMatchObject({
      state: 'blocked',
      liveIntakeEnabled: false,
      aiaIntegration: 'not-available-in-checkout',
      executionEnabled: false,
      pilotPaidProviderEnabled: false,
    });
    expect(readiness.missingCapabilities).toContain('tenant-scoped AIA pilot storage and authentication');
  });
});
