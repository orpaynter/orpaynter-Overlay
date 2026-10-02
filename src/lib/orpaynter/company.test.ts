import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({ spawn: vi.fn() }));
vi.mock('node:child_process', () => ({ spawn: mocked.spawn }));

function child() {
  return Object.assign(new EventEmitter(), { stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn() });
}

function row(number = 33, overrides = {}) {
  return { number, title: 'DO NOW: Connect the company work', html_url: `https://github.com/orpaynter/AIA/issues/${number}`, state: 'open', updated_at: '2026-09-30T01:00:00Z', labels: ['backlog'], assignees: ['orpaynter'], ...overrides };
}

function provider(overrides: Record<string, unknown> = {}) {
  mocked.spawn.mockImplementation((_path: string, args: string[]) => {
    const process = child();
    const endpoint = args[3];
    queueMicrotask(() => {
      const value = endpoint in overrides ? overrides[endpoint] : endpoint === 'user' ? { login: 'orpaynter', id: 127189622 } : endpoint.includes('/AIA/issues?') ? [row()] : [];
      if (value instanceof Error) {
        process.stderr.emit('data', Buffer.from('PRIVATE TOKEN AND ACCOUNT DETAIL'));
        process.emit('close', 1);
      } else {
        process.stdout.emit('data', Buffer.from(JSON.stringify(value)));
        process.emit('close', 0);
      }
    });
    return process;
  });
}

describe('fixed OrPaynter owner repository work reader', () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); provider(); });
  afterEach(() => vi.useRealTimers());

  it('verifies owner before fixed read-only repository calls and returns metadata only', async () => {
    const { getCompanyState, COMPANY_GH_EXECUTABLE } = await import('./company');
    const result = await getCompanyState();
    expect(result.github).toEqual({ status: 'connected', owner: 'orpaynter', accountId: 127189622 });
    expect(result.work[0]).toMatchObject({ id: 'github:orpaynter/AIA:issue:33', priority: 'do-now', kind: 'issue', labels: ['backlog'] });
    expect(result.revision).toMatch(/^[a-f\d]{64}$/);
    expect(result.scope).toContain('not an exhaustive workforce');
    expect(mocked.spawn).toHaveBeenCalledTimes(5);
    for (const [executable, args, options] of mocked.spawn.mock.calls) {
      expect(executable).toBe(COMPANY_GH_EXECUTABLE);
      expect(options).toMatchObject({ shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
      expect(args.slice(0, 3)).toEqual(['api', '--method', 'GET']);
      expect(args[3]).toMatch(/^(user|repos\/orpaynter\/(AIA|claimflow)\/(issues|pulls)\?state=open&per_page=100)$/);
      expect(args[4]).toBe('--jq');
      expect(args.join(' ')).not.toMatch(/token|auth|POST|--paginate/);
    }
  });

  it('rejects mismatched login or numeric owner identity without repository reads', async () => {
    for (const identity of [{ login: 'somebody', id: 127189622 }, { login: 'orpaynter', id: 999 }]) {
      vi.resetModules(); vi.clearAllMocks(); provider({ user: identity });
      const { getCompanyState } = await import('./company');
      const result = await getCompanyState();
      expect(result.github.status).toBe('owner_mismatch');
      expect(result.work).toEqual([]);
      expect(mocked.spawn).toHaveBeenCalledOnce();
    }
  });

  it('expires the cache and removes earlier work when authentication changes owner', async () => {
    vi.useFakeTimers();
    const { getCompanyState } = await import('./company');
    expect((await getCompanyState()).work).toHaveLength(1);
    provider({ user: { login: 'another-owner', id: 42 } });
    vi.setSystemTime(Date.now() + 30_001);
    const changed = await getCompanyState();
    expect(changed.github.status).toBe('owner_mismatch');
    expect(changed.work).toEqual([]);
  });

  it('deduplicates in-flight requests and caches a verified snapshot for thirty seconds', async () => {
    const { getCompanyState } = await import('./company');
    const first = getCompanyState();
    expect(getCompanyState()).toBe(first);
    const state = await first;
    expect(await getCompanyState()).toBe(state);
    expect(mocked.spawn).toHaveBeenCalledTimes(5);
  });

  it('drops PR entries from issues and rejects links outside the fixed repository', async () => {
    provider({ 'repos/orpaynter/AIA/issues?state=open&per_page=100': [row(), row(34, { pull_request: {} }), row(35, { html_url: 'https://evil.example/issues/35' }), row(36, { updated_at: 'invalid' })] });
    const { getCompanyState } = await import('./company');
    expect((await getCompanyState()).work.map(item => item.number)).toEqual([33]);
  });

  it('retains backlog labels and actual draft/head metadata without response bodies', async () => {
    provider({
      'repos/orpaynter/AIA/issues?state=open&per_page=100': [row(12, { title: 'Future investigation', body: 'PRIVATE BODY', labels: ['backlog'], assignees: ['orpaynter', 'bad login'] })],
      'repos/orpaynter/AIA/pulls?state=open&per_page=100': [row(99, { html_url: 'https://github.com/orpaynter/AIA/pull/99', title: 'Bounded feature', labels: [], head: 'a'.repeat(40), draft: true, body: 'PRIVATE BODY' })],
    });
    const { getCompanyState } = await import('./company');
    const state = await getCompanyState();
    expect(state.work.find(item => item.number === 12)).toMatchObject({ priority: 'backlog', assignees: ['orpaynter'] });
    expect(state.work.find(item => item.number === 99)).toMatchObject({ kind: 'pull_request', draft: true, head: 'a'.repeat(40), priority: 'normal' });
    expect(JSON.stringify(state)).not.toContain('PRIVATE BODY');
  });

  it('uses source backlog titles and actual P0/P1 labels for priority', async () => {
    provider({ 'repos/orpaynter/AIA/issues?state=open&per_page=100': [
      row(1, { title: 'GB-02 BACKLOG — inspection', labels: [] }),
      row(2, { title: 'Release authority', labels: ['P0-CRITICAL'] }),
      row(3, { title: 'Evidence controls', labels: ['P1-HIGH', 'P3-LOW'] }),
    ] });
    const { getCompanyState } = await import('./company');
    expect((await getCompanyState()).work.map(item => item.priority)).toEqual(['backlog', 'do-now', 'do-now']);
  });

  it('labels partial provider failures without returning stderr or stale unavailable resources', async () => {
    provider({ 'repos/orpaynter/claimflow/issues?state=open&per_page=100': new Error('provider credentials') });
    const { getCompanyState } = await import('./company');
    const state = await getCompanyState();
    expect(state.github.status).toBe('connected');
    expect(state.github.error).toContain('partial');
    expect(state.repositories?.find(repo => repo.repo.endsWith('/claimflow'))?.issues).toBe('unavailable');
    expect(JSON.stringify(state)).not.toContain('PRIVATE');
  });

  it('fails closed on account-reader errors or malformed account envelopes', async () => {
    provider({ user: new Error('SECRET') });
    const { getCompanyState } = await import('./company');
    const state = await getCompanyState();
    expect(state.github.status).toBe('unavailable');
    expect(state.work).toEqual([]);
    expect(JSON.stringify(state)).not.toContain('SECRET');
  });

  it('kills a stalled reader within the bounded timeout', async () => {
    vi.useFakeTimers();
    const process = child(); mocked.spawn.mockReturnValue(process);
    const { getCompanyState, COMPANY_TIMEOUT_MS } = await import('./company');
    const pending = getCompanyState();
    await vi.advanceTimersByTimeAsync(COMPANY_TIMEOUT_MS);
    expect((await pending).github.status).toBe('unavailable');
    expect(process.kill).toHaveBeenCalledWith('SIGKILL');
  });

  it('kills oversized output and exposes only sanitized failure metadata', async () => {
    const process = child(); mocked.spawn.mockReturnValue(process);
    const { getCompanyState, COMPANY_OUTPUT_LIMIT } = await import('./company');
    const pending = getCompanyState();
    process.stderr.emit('data', Buffer.alloc(COMPANY_OUTPUT_LIMIT + 1, 'x'));
    expect((await pending).work).toEqual([]);
    expect(process.kill).toHaveBeenCalledWith('SIGKILL');
  });
});
