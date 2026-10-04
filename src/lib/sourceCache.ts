/**
 * OSIRIS — upstream source cache.
 *
 * Camera *indexes* (where the cameras are) change on the order of weeks, while
 * the frames themselves are pulled live by the client straight from the source.
 * Re-downloading a 500 KB index on every request is pure waste — and some of
 * these upstreams are slow enough to dominate the response (MDOT ~7s, NZTA ~8s),
 * so an uncached `region=all` took ~15s every single time.
 *
 * Three behaviours matter here:
 *   • TTL        — serve from memory until the index is plausibly stale.
 *   • dedup      — concurrent misses share one upstream request instead of
 *                  stampeding it (a `region=all` fan-out hits every source at once).
 *   • stale-on-error — if the upstream fails, keep serving the last good index
 *                  rather than dropping the layer to zero cameras.
 */

interface Entry<T> {
  data: T[];
  expiresAt: number;
  inflight: Promise<T[]> | null;
  fetchedAt: number | null;
  refreshFailed: boolean;
}

const store = new Map<string, Entry<unknown>>();

export const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Cap on distinct keys. Camera sources are a fixed handful, but callers with
 * per-coordinate keys (place lookups) would otherwise grow this map without
 * bound. Map preserves insertion order, so the oldest keys evict first.
 */
const MAX_ENTRIES = 500;

function evictIfNeeded(): void {
  if (store.size <= MAX_ENTRIES) return;
  for (const key of store.keys()) {
    if (store.size <= MAX_ENTRIES) break;
    const entry = store.get(key);
    if (entry?.inflight) continue; // never drop a request in progress
    store.delete(key);
  }
}

/**
 * Wrap a camera fetcher with TTL caching, in-flight dedup and stale fallback.
 * Returns a drop-in replacement with the same signature.
 */
export function cachedSource<T>(
  key: string,
  fetcher: () => Promise<T[]>,
  ttlMs: number = DEFAULT_TTL_MS,
): () => Promise<T[]> {
  return async () => {
    const now = Date.now();
    const entry = store.get(key) as Entry<T> | undefined;

    if (entry && now < entry.expiresAt && entry.data.length > 0) return entry.data;
    if (entry?.inflight) return entry.inflight;

    const inflight = (async () => {
      try {
        const data = await fetcher();
        // An empty result is treated as a failed refresh: keep whatever we had.
        if (data.length === 0 && entry?.data.length) {
          store.set(key, { data: entry.data, expiresAt: now + ttlMs, inflight: null, fetchedAt: entry.fetchedAt, refreshFailed: true });
          return entry.data;
        }
        store.set(key, { data, expiresAt: now + ttlMs, inflight: null, fetchedAt: Date.now(), refreshFailed: false });
        return data;
      } catch (e) {
        if (entry?.data.length) {
          console.warn(`[OSIRIS] ${key} refresh failed — serving ${entry.data.length} cached cameras`);
          // Retry sooner than a full TTL, but don't hammer the failing upstream.
          store.set(key, { data: entry.data, expiresAt: now + 60_000, inflight: null, fetchedAt: entry.fetchedAt, refreshFailed: true });
          return entry.data;
        }
        console.warn(`[OSIRIS] ${key} fetch failed with no cache to fall back on:`, e);
        store.set(key, { data: [], expiresAt: now + 60_000, inflight: null, fetchedAt: null, refreshFailed: true });
        return [];
      }
    })();

    store.set(key, {
      data: entry?.data ?? [],
      expiresAt: entry?.expiresAt ?? 0,
      inflight,
      fetchedAt: entry?.fetchedAt ?? null,
      refreshFailed: entry?.refreshFailed ?? false,
    } as Entry<unknown>);
    evictIfNeeded();

    return inflight;
  };
}

/**
 * Read a source without triggering a fetch.
 *
 * The catalogue route uses this to answer from what it already has and to
 * queue only the regions it is actually missing — otherwise every request
 * enqueues all 48 regions into the pool, and a warm catalogue still pays for a
 * queue it does not need.
 */
export function peekSource<T>(key: string, allowStale = false): T[] | undefined {
  const entry = store.get(key) as Entry<T> | undefined;
  if (!entry || entry.data.length === 0) return undefined;
  if (allowStale || Date.now() < entry.expiresAt) return entry.data;
  return undefined;
}

/** Is what peekSource would return past its TTL? */
export function isStale(key: string): boolean {
  const entry = store.get(key);
  return !entry || Date.now() >= entry.expiresAt;
}

/** Original successful retrieval time; a failed refresh never makes old data fresh. */
export function sourceCacheState(key: string): { status: 'fresh' | 'stale' | 'unavailable'; fetchedAt: string | null } {
  const entry = store.get(key);
  if (!entry || entry.fetchedAt === null) return { status: 'unavailable', fetchedAt: null };
  return {
    status: entry.refreshFailed || Date.now() >= entry.expiresAt ? 'stale' : 'fresh',
    fetchedAt: new Date(entry.fetchedAt).toISOString(),
  };
}

/**
 * Install data the process did not fetch — a catalogue restored from disk.
 * Serving that at boot is the difference between a map that is populated on the
 * first request and one that waits on forty-eight upstreams to answer.
 */
export function seedSource<T>(key: string, data: T[], ttlMs: number = DEFAULT_TTL_MS): void {
  if (!data.length) return;
  const entry = store.get(key);
  if (entry?.inflight) return; // a live fetch already supersedes the snapshot
  store.set(key, { data, expiresAt: Date.now() + ttlMs, inflight: null, fetchedAt: Date.now(), refreshFailed: false } as Entry<unknown>);
  evictIfNeeded();
}

/** Test seam — drops all cached indexes. */
export function clearSourceCache(): void {
  store.clear();
}
