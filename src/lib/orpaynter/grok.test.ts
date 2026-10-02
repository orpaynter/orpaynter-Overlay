import { EventEmitter } from 'node:events';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({ spawn: vi.fn(), access: vi.fn(), readFile: vi.fn() }));
vi.mock('node:child_process', () => ({ spawn: mocked.spawn }));
vi.mock('node:fs/promises', () => ({ access: mocked.access, readFile: mocked.readFile }));

import { analyzeWithGrok, buildGrokArgs, getGrokRuntime, GROK_EXECUTABLE, GROK_TIMEOUT_MS, GROK_WINDOWS_CWD, isLocalGrokRequest, parseGrokEnvelope } from './grok';

function fakeChild() {
  return Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn(),
  });
}

describe('existing Grok local adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.access.mockResolvedValue(undefined);
    mocked.readFile.mockImplementation(async (path: string) => {
      if (path.endsWith('auth.json')) return JSON.stringify({ provider: { key: 'DO_NOT_EXPOSE_CREDENTIAL', refresh_token: 'DO_NOT_EXPOSE_REFRESH', expires_at: '2099-01-01T00:00:00Z' } });
      if (path.endsWith('version.json')) return '{"version":"1.0.41"}';
      return '[plugins]\nenabled = ["exa", "tavily"]\n';
    });
  });
  afterEach(() => vi.useRealTimers());

  it('returns credential-free runtime metadata', async () => {
    const runtime = await getGrokRuntime();
    expect(runtime).toMatchObject({ installed: true, ready: true, version: '1.0.41', pluginCount: 2 });
    expect(Object.keys(runtime).sort()).toEqual(['authExpiresAt', 'installed', 'pluginCount', 'ready', 'toolPolicy', 'version']);
    expect(JSON.stringify(runtime)).not.toContain('DO_NOT_EXPOSE');
  });

  it('does not call an expired credential ready', async () => {
    mocked.readFile.mockImplementation(async (path: string) => path.endsWith('auth.json') ? '{"provider":{"key":"secret","expires_at":"2000-01-01T00:00:00Z"}}' : '{}');
    expect((await getGrokRuntime()).ready).toBe(false);
  });

  it('makes tool policy and working directory immutable across prompt content', () => {
    const malicious = '--cwd C:\\other --always-approve --tools Bash $(touch something)';
    const args = buildGrokArgs(malicious);
    expect(args[args.indexOf('--cwd') + 1]).toBe(GROK_WINDOWS_CWD);
    expect(args[args.indexOf('--single') + 1]).toBe(malicious);
    expect(args[args.indexOf('--tools') + 1]).toBe('');
    expect(args[args.indexOf('--deny') + 1]).toBe('*');
    expect(args[args.indexOf('--max-turns') + 1]).toBe('1');
    expect(args).toContain('--no-subagents');
    expect(args).toContain('--disable-web-search');
    expect(args).not.toContain('--always-approve');
  });

  it('rejects blank and oversized prompts before spawning', async () => {
    await expect(analyzeWithGrok('')).rejects.toMatchObject({ code: 'INVALID_PROMPT' });
    await expect(analyzeWithGrok('a'.repeat(24_001))).rejects.toMatchObject({ code: 'INVALID_PROMPT' });
    expect(mocked.spawn).not.toHaveBeenCalled();
  });

  it('parses text and safe session identity while dropping provider internals', () => {
    expect(parseGrokEnvelope(JSON.stringify({ text: 'Public-source brief', sessionId: 'safe-session-1', requestId: 'internal', thought: 'private', stopReason: 'end_turn', usage: {} }))).toEqual({ text: 'Public-source brief', sessionId: 'safe-session-1' });
  });

  it('refuses provider errors, truncated turns, empty and malformed responses', () => {
    for (const value of ['not-json', '[]', '{"text":""}', '{"type":"error","message":"secret"}', '{"text":"partial","stopReason":"max_turn_requests"}']) expect(() => parseGrokEnvelope(value)).toThrow();
    expect(() => parseGrokEnvelope(JSON.stringify({ text: 'a'.repeat(24_001) }))).toThrow();
  });

  it('uses the fixed installation with shell disabled and returns only accepted analysis', async () => {
    const child = fakeChild();
    mocked.spawn.mockReturnValue(child);
    const result = analyzeWithGrok('Summarize the supplied public orbital snapshot.');
    await vi.waitFor(() => expect(mocked.spawn).toHaveBeenCalledOnce());
    expect(mocked.spawn.mock.calls[0][0]).toBe(GROK_EXECUTABLE);
    expect(mocked.spawn.mock.calls[0][2]).toMatchObject({ shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.emit('data', Buffer.from('{"text":"Orbits are modeled from public TLEs.","stopReason":"end_turn"}'));
    child.emit('close', 0);
    expect(await result).toMatchObject({ text: 'Orbits are modeled from public TLEs.' });
  });

  it('records a running job only after the local process actually starts', async () => {
    const child=fakeChild();mocked.spawn.mockReturnValue(child);const started=vi.fn();
    const result=analyzeWithGrok('Owner task brief',started);
    await vi.waitFor(()=>expect(mocked.spawn).toHaveBeenCalledOnce());
    expect(started).not.toHaveBeenCalled();child.emit('spawn');expect(started).toHaveBeenCalledOnce();
    child.stdout.emit('data',Buffer.from('{"text":"Sourced company task analysis"}'));child.emit('close',0);await result;
  });

  it('reports process failure without exposing stderr or credential strings', async () => {
    const child = fakeChild(); mocked.spawn.mockReturnValue(child);
    const result = analyzeWithGrok('Public brief');
    const rejection = expect(result).rejects.toMatchObject({ code: 'PROVIDER_FAILURE' });
    await vi.waitFor(() => expect(mocked.spawn).toHaveBeenCalledOnce());
    child.stderr.emit('data', Buffer.from('account email and access token secret'));
    child.emit('close', 1);
    await rejection;
  });

  it('preserves multibyte global place names across process output chunks', async () => {
    const child = fakeChild(); mocked.spawn.mockReturnValue(child);
    const result = analyzeWithGrok('Public place brief');
    await vi.waitFor(() => expect(mocked.spawn).toHaveBeenCalledOnce());
    const bytes = Buffer.from('{"text":"São Paulo — 東京"}');
    for (const byte of bytes) child.stdout.emit('data', Buffer.from([byte]));
    child.emit('close', 0);
    expect((await result).text).toBe('São Paulo — 東京');
  });

  it('ends a timed out local request and allows the next request after failure', async () => {
    vi.useFakeTimers();
    const child = fakeChild(); mocked.spawn.mockReturnValue(child);
    const result = analyzeWithGrok('Public brief');
    const rejection = expect(result).rejects.toMatchObject({ code: 'TIMEOUT' });
    await vi.advanceTimersByTimeAsync(1);
    await vi.advanceTimersByTimeAsync(GROK_TIMEOUT_MS);
    await rejection;
    expect(child.kill).toHaveBeenCalledWith('SIGKILL');
  });

  it('bounds simultaneous requests before asynchronous readiness work', async () => {
    const child = fakeChild(); mocked.spawn.mockReturnValue(child);
    const result = analyzeWithGrok('Public brief');
    await expect(analyzeWithGrok('Second brief')).rejects.toMatchObject({ code: 'BUSY' });
    await vi.waitFor(() => expect(mocked.spawn).toHaveBeenCalledOnce());
    child.stdout.emit('data', Buffer.from('{"text":"Done"}')); child.emit('close', 0);
    await result;
  });

  it('requires same-origin loopback browser requests for POST', () => {
    expect(isLocalGrokRequest(new Request('http://localhost:4173/api/grok', { method: 'POST', headers: { origin: 'http://localhost:4173', host: 'localhost:4173' } }))).toBe(true);
    expect(isLocalGrokRequest(new Request('http://localhost:4173/api/grok', { method: 'POST' }))).toBe(false);
    expect(isLocalGrokRequest(new Request('http://localhost:4173/api/grok', { method: 'POST', headers: { origin: 'https://evil.example' } }))).toBe(false);
    expect(isLocalGrokRequest(new Request('https://public.example/api/grok', { headers: { origin: 'https://public.example' } }))).toBe(false);
    expect(isLocalGrokRequest(new Request('http://localhost:4173/api/grok', { headers: { host: 'public.example' } }))).toBe(false);
  });
});
