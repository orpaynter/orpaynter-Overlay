import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getCompanyState, COMPANY_ACCOUNT_ID, COMPANY_OWNER, COMPANY_REPOS } from './company';

export const RECOVERY_SOURCES = ['satellites', 'weather', 'earthquakes', 'news', 'flights', 'maritime', 'gdelt', 'cyber-attacks', 'company'] as const;
export type RecoverySource = typeof RECOVERY_SOURCES[number];
export type RecoveryStatus = 'healthy' | 'retrying' | 'recovered' | 'degraded' | 'unavailable' | 'blocked';
export interface RecoveryEvent { id: string; at: string; source: RecoverySource; kind: string; detail: string; }
export interface RecoveryMeta {
  source: RecoverySource;
  status: RecoveryStatus;
  attempts: number;
  checkedAt: string;
  receivedAt: string | null;
  lastGoodHash: string | null;
  failures: number;
  nextRetryAt: string | null;
  events: RecoveryEvent[];
}
export interface RecoveryEnvelope { payload: Record<string, unknown> | null; recovery: RecoveryMeta; }
const CADENCE: Record<RecoverySource, number> = { satellites: 30_000, weather: 60_000, earthquakes: 60_000, news: 300_000, flights: 60_000, maritime: 30_000, gdelt: 300_000, 'cyber-attacks': 300_000, company: 30_000 };
const MAX_BYTES = 12_000_000;
const MAX_ATTEMPTS = 2;
const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
const SECRET_KEY = /(?:password|passwd|secret|authorization|access[_-]?token|refresh[_-]?token|api[_-]?key|cookie|credential)/i;
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const validDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
const coordinates = (row: unknown) => isRecord(row) && typeof row.lat === 'number' && Number.isFinite(row.lat) && Math.abs(row.lat) <= 90 && typeof row.lng === 'number' && Number.isFinite(row.lng) && Math.abs(row.lng) <= 180;

class BlockedSource extends Error {}

/** Only allowlisted provider packets reach storage; credentials are never retained. */
function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 12) throw new Error('Packet exceeds the nesting limit.');
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') { if (!Number.isFinite(value)) throw new Error('Packet contains a non-finite value.'); return value; }
  if (typeof value === 'string') return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, 24_000);
  if (Array.isArray(value)) { if (value.length > 50_000) throw new Error('Packet exceeds the record limit.'); return value.map(item => sanitize(item, depth + 1)); }
  if (!isRecord(value)) throw new Error('Packet contains an unsupported value.');
  return Object.fromEntries(Object.entries(value).filter(([key]) => !SECRET_KEY.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key)).map(([key, child]) => [key.slice(0, 120), sanitize(child, depth + 1)]));
}
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function recoveryHash(value: Record<string, unknown>): string { return createHash('sha256').update(stableJson(value)).digest('hex'); }

/** Reject HTTP 200 error documents and malformed geometry before a re-render. */
export function validateRecoveryPayload(source: RecoverySource, input: unknown): Record<string, unknown> {
  if (!isRecord(input)) throw new Error('Provider packet is not an object.');
  if (source === 'company') {
    const github = input.github;
    if (!isRecord(github) || github.status === 'owner_mismatch' || github.owner !== COMPANY_OWNER || (github.status === 'connected' && github.accountId !== COMPANY_ACCOUNT_ID)) throw new BlockedSource('Company owner verification failed.');
    if (github.status !== 'connected') throw new Error('Company reader is unavailable.');
    if (!Array.isArray(input.work) || !validDate(input.checkedAt) || typeof input.revision !== 'string' || !/^[a-f0-9]{64}$/.test(input.revision)) throw new Error('Company packet is malformed.');
    for (const row of input.work) {
      if (!isRecord(row) || !COMPANY_REPOS.includes(row.repo as typeof COMPANY_REPOS[number]) || !Number.isSafeInteger(row.number) || Number(row.number) < 1 || !['issue', 'pull_request'].includes(String(row.kind)) || typeof row.title !== 'string' || !validDate(row.updatedAt)) throw new BlockedSource('Company work is outside the verified read scope.');
      const expected = `https://github.com/${row.repo}/${row.kind === 'issue' ? 'issues' : 'pull'}/${row.number}`;
      if (row.url !== expected || row.id !== `github:${row.repo}:${row.kind}:${row.number}`) throw new BlockedSource('Company work identity is outside the verified read scope.');
    }
  } else {
    if (input.error || (typeof input.source === 'string' && /unavailable|\+stale/i.test(input.source))) throw new Error('Provider reported an unavailable or stale packet.');
    const fields: Record<Exclude<RecoverySource, 'company'>, string[]> = { satellites: ['satellites'], weather: ['events'], earthquakes: ['features'], news: ['news'], flights: ['commercial_flights', 'private_flights', 'private_jets', 'military_flights'], maritime: ['ships'], gdelt: ['events'], 'cyber-attacks': ['indicators'] };
    for (const field of fields[source]) {
      const rows = input[field];
      if (!Array.isArray(rows) || rows.some(row => !isRecord(row))) throw new Error('Provider packet has no valid record list.');
      if (['satellites', 'weather', 'flights', 'maritime', 'gdelt'].includes(source) && !rows.every(coordinates)) throw new Error('Provider packet has invalid coordinates.');
      if (source === 'earthquakes' && !rows.every(row => {
        const geometry = (row as Record<string, unknown>).geometry;
        return isRecord(geometry) && geometry.type === 'Point' && Array.isArray(geometry.coordinates) && coordinates({ lng: geometry.coordinates[0], lat: geometry.coordinates[1] });
      })) throw new Error('Earthquake packet has invalid geometry.');
    }
    if (source === 'satellites' && (!validDate(input.timestamp) || !(input.satellites as unknown[]).length)) throw new Error('Orbital packet has no position epoch or positions.');
    if (source === 'news' && Array.isArray(input.sources) && input.sources.length && input.sources.every(row => isRecord(row) && row.status === 'unavailable')) throw new Error('All news providers are unavailable.');
  }
  const sanitized = sanitize(input) as Record<string, unknown>;
  if (Buffer.byteLength(JSON.stringify(sanitized)) > MAX_BYTES) throw new Error('Provider packet exceeds the storage limit.');
  return sanitized;
}

interface StoredRecord { version: 1; payload: Record<string, unknown> | null; recovery: RecoveryMeta; nextCheckAt: number; }
interface RecoveryDependencies {
  capture: (source: RecoverySource, origin: string) => Promise<unknown>;
  directory: string;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

export function createRecoveryReader(deps: RecoveryDependencies) {
  const now = deps.now ?? Date.now;
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)));
  const records = new Map<RecoverySource, StoredRecord>();
  const pending = new Map<RecoverySource, Promise<RecoveryEnvelope>>();
  const loads = new Map<RecoverySource, Promise<StoredRecord>>();
  function empty(source: RecoverySource): StoredRecord {
    return { version: 1, payload: null, nextCheckAt: 0, recovery: { source, status: 'unavailable', attempts: 0, checkedAt: new Date(now()).toISOString(), receivedAt: null, lastGoodHash: null, failures: 0, nextRetryAt: null, events: [] } };
  }
  function event(record: StoredRecord, kind: string, detail: string) {
    record.recovery.events = [...record.recovery.events, { id: randomUUID(), at: new Date(now()).toISOString(), source: record.recovery.source, kind, detail }].slice(-12);
  }
  async function load(source: RecoverySource): Promise<StoredRecord> {
    if (records.has(source)) return records.get(source)!;
    if (loads.has(source)) return loads.get(source)!;
    const loading = (async () => {
      const initial = empty(source);
      try {
        const raw = await readFile(path.join(deps.directory, `${source}.json`), 'utf8');
        if (Buffer.byteLength(raw) > MAX_BYTES + 40_000) throw new Error('Stored packet is too large.');
        const disk = JSON.parse(raw) as StoredRecord;
        if (disk.version !== 1 || disk.recovery?.source !== source || !validDate(disk.recovery.checkedAt)) throw new Error('Stored packet identity is invalid.');
        if (!['healthy', 'retrying', 'recovered', 'degraded', 'unavailable', 'blocked'].includes(disk.recovery.status) || !Number.isInteger(disk.recovery.failures) || disk.recovery.failures < 0 || disk.recovery.failures > 1000 || !Number.isInteger(disk.recovery.attempts) || disk.recovery.attempts < 0 || disk.recovery.attempts > MAX_ATTEMPTS) throw new Error('Stored recovery metadata is invalid.');
        initial.recovery.checkedAt = disk.recovery.checkedAt;
        initial.recovery.failures = disk.recovery.failures;
        initial.recovery.attempts = disk.recovery.attempts;
        initial.recovery.status = disk.recovery.status === 'blocked' ? 'blocked' : 'unavailable';
        initial.recovery.events = Array.isArray(disk.recovery.events) ? disk.recovery.events.filter(item => item && item.source === source && validDate(item.at) && typeof item.id === 'string' && typeof item.kind === 'string' && typeof item.detail === 'string').slice(-12).map(item => ({ id: item.id.slice(0, 64), at: item.at, source, kind: item.kind.slice(0, 64), detail: item.detail.slice(0, 300) })) : [];
        if (disk.recovery.nextRetryAt && validDate(disk.recovery.nextRetryAt) && Date.parse(disk.recovery.nextRetryAt) > now() && Date.parse(disk.recovery.nextRetryAt) <= now() + 300_000) {
          initial.nextCheckAt = Date.parse(disk.recovery.nextRetryAt);
          initial.recovery.nextRetryAt = disk.recovery.nextRetryAt;
        }
        if (disk.recovery.status === 'blocked' && disk.payload) throw new Error('Blocked packet cannot contain company data.');
        if (disk.payload) {
          const valid = validateRecoveryPayload(source, disk.payload);
          if (recoveryHash(valid) !== disk.recovery.lastGoodHash || !validDate(disk.recovery.receivedAt)) throw new Error('Stored packet hash or receipt is invalid.');
          if (source === 'company') {
            event(initial, 'owner-check-required', 'Company packet was not restored; the current authenticated owner must be verified again.');
          } else {
            initial.payload = valid;
            initial.recovery.lastGoodHash = disk.recovery.lastGoodHash;
            initial.recovery.receivedAt = disk.recovery.receivedAt;
            initial.recovery.status = 'degraded';
            event(initial, 'restored', 'Validated last-good packet restored; current provider check is required.');
          }
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') event(initial, 'rejected-cache', 'Stored packet could not be validated; no cached data was used.');
      }
      if (source === 'company') {
        // A disk hash proves integrity, not that today's CLI account owns these records.
        initial.payload = null;
        initial.recovery.receivedAt = null;
        initial.recovery.lastGoodHash = null;
        initial.recovery.status = 'unavailable';
        initial.recovery.nextRetryAt = null;
        initial.nextCheckAt = 0;
      }
      records.set(source, initial);
      return initial;
    })().finally(() => loads.delete(source));
    loads.set(source, loading);
    return loading;
  }
  async function persist(record: StoredRecord) {
    const destination = path.join(deps.directory, `${record.recovery.source}.json`);
    const temporary = `${destination}.${randomUUID()}.tmp`;
    try {
      await mkdir(deps.directory, { recursive: true });
      await writeFile(temporary, JSON.stringify(record), { mode: 0o600 });
      await rename(temporary, destination);
    } catch { await rm(temporary, { force: true }).catch(() => undefined); event(record, 'storage-unavailable', 'Recovery journal could not be saved; this check is retained in memory only.'); }
  }
  const envelope = (record: StoredRecord): RecoveryEnvelope => ({ payload: record.payload, recovery: { ...record.recovery, events: [...record.recovery.events] } });
  async function run(source: RecoverySource, origin: string): Promise<RecoveryEnvelope> {
    const record = await load(source);
    if (record.nextCheckAt > now()) return envelope(record);
    const wasDegraded = record.recovery.failures > 0 || record.recovery.status === 'degraded' || record.recovery.status === 'blocked';
    record.recovery.attempts = 0;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      record.recovery.attempts = attempt;
      record.recovery.checkedAt = new Date(now()).toISOString();
      record.recovery.status = 'retrying';
      record.recovery.nextRetryAt = null;
      event(record, 'check', `Read-only provider check ${attempt}/${MAX_ATTEMPTS}.`);
      try {
        const payload = validateRecoveryPayload(source, await deps.capture(source, origin));
        // checkedAt on company captures is the actual reader time, not this wrapper time.
        if (source === 'satellites' && Math.abs(now() - Date.parse(String(payload.timestamp))) > 90_000) throw new Error('Orbital position epoch is stale.');
        const receivedAt = source === 'company' ? String(payload.checkedAt) : new Date(now()).toISOString();
        record.payload = payload;
        record.recovery.receivedAt = receivedAt;
        record.recovery.lastGoodHash = recoveryHash(payload);
        record.recovery.status = wasDegraded || attempt > 1 ? 'recovered' : 'healthy';
        record.recovery.failures = 0;
        record.recovery.nextRetryAt = null;
        record.recovery.checkedAt = new Date(now()).toISOString();
        record.nextCheckAt = now() + CADENCE[source];
        event(record, record.recovery.status, 'Validated provider packet accepted; no external action was executed.');
        await persist(record);
        return envelope(record);
      } catch (error) {
        record.recovery.failures++;
        if (error instanceof BlockedSource) {
          record.payload = null;
          record.recovery.receivedAt = null;
          record.recovery.lastGoodHash = null;
          record.recovery.status = 'blocked';
          record.nextCheckAt = now() + CADENCE[source];
          record.recovery.nextRetryAt = new Date(record.nextCheckAt).toISOString();
          event(record, 'blocked', 'Owner or company scope verification failed; cached company data was cleared.');
          await persist(record);
          return envelope(record);
        }
        event(record, 'failed', 'Provider failed availability, freshness, or schema validation.');
        if (attempt < MAX_ATTEMPTS) {
          record.recovery.nextRetryAt = new Date(now() + 500).toISOString();
          await sleep(500);
        }
      }
    }
    record.recovery.status = record.payload ? 'degraded' : 'unavailable';
    record.recovery.checkedAt = new Date(now()).toISOString();
    const delay = Math.min(300_000, 5_000 * 2 ** Math.min(6, Math.max(0, record.recovery.failures - MAX_ATTEMPTS)));
    record.nextCheckAt = now() + delay;
    record.recovery.nextRetryAt = new Date(record.nextCheckAt).toISOString();
    event(record, record.recovery.status, record.payload ? 'Using validated last-good packet with its original receipt time; provider recovery is pending.' : 'No validated packet is available; source remains unavailable.');
    await persist(record);
    return envelope(record);
  }
  return {
    read(source: RecoverySource, origin: string): Promise<RecoveryEnvelope> {
      if (!RECOVERY_SOURCES.includes(source)) return Promise.reject(new Error('Recovery source is outside the read scope.'));
      const originUrl = new URL(origin);
      if (!['localhost', '127.0.0.1', '[::1]'].includes(originUrl.hostname) || !['http:', 'https:'].includes(originUrl.protocol) || originUrl.username || originUrl.password || originUrl.pathname !== '/' || originUrl.search || originUrl.hash) return Promise.reject(new Error('Recovery origin is outside the local scope.'));
      if (pending.has(source)) return pending.get(source)!;
      const operation = run(source, originUrl.origin).finally(() => pending.delete(source));
      pending.set(source, operation);
      return operation;
    },
    async summary(): Promise<{ sources: RecoveryMeta[]; events: RecoveryEvent[] }> {
      const values = await Promise.all(RECOVERY_SOURCES.map(load));
      const sources = values.map(record => {
        const meta = envelope(record).recovery;
        if (['healthy', 'recovered'].includes(meta.status) && meta.receivedAt && now() - Date.parse(meta.receivedAt) > CADENCE[meta.source] * 2 + 15_000) meta.status = 'degraded';
        return meta;
      });
      return { sources, events: sources.flatMap(meta => meta.events).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40) };
    },
  };
}

async function capture(source: RecoverySource, origin: string): Promise<unknown> {
  if (source === 'company') {
    // The underlying fixed CLI reader keeps its own process deadline and shared flight.
    // This wrapper limits the HTTP recovery wait without dispatching a duplicate reader.
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Company recovery check timed out.')), 9_000);
      getCompanyState().then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
    });
  }
  const url = source === 'earthquakes' ? USGS_URL : `${origin}/api/${source}`;
  const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(9_000), headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Provider read failed.');
  if (Number(response.headers.get('content-length')) > MAX_BYTES) throw new Error('Provider packet exceeds the read limit.');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Provider response has no body.');
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytes += chunk.value.byteLength;
    if (bytes > MAX_BYTES) { await reader.cancel(); throw new Error('Provider packet exceeds the read limit.'); }
    chunks.push(chunk.value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
const reader = createRecoveryReader({ capture, directory: path.join(process.cwd(), '.local-runs', 'recovery') });
export const getRecoveredSource = reader.read;
export const getRecoverySummary = reader.summary;
