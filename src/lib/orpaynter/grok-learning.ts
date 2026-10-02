import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

const home = process.platform === 'win32' ? 'C:\\Users\\OrPay' : '/mnt/c/Users/OrPay';
const root = path.join(home, '.grok', 'learn');
const allowedTargets: Record<string, string> = {
  'orpaynter-command-stack': path.join(home, '.agents', 'skills', 'orpaynter-command-stack', 'SKILL.md'),
  'research-loop': path.join(home, '.grok', 'skills', 'research-loop', 'SKILL.md'),
};
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
export interface GrokLearningStatus {
  checkedAt: string;
  status: 'verified' | 'incomplete' | 'unavailable';
  completedAt: string | null;
  runId: string | null;
  sessionsKept: number | null;
  appliedUpdates: number;
  verifiedUpdates: number;
  deferredActions: number;
  updates: { id: string; target: string; verified: boolean; currentHash: string | null }[];
  provenance: Record<string, string>;
  meaning: string;
}
async function boundedRead(file: string) {
  const bytes = await readFile(file);
  if (bytes.length > 1_000_000) throw new Error('Oversized learning record.');
  return bytes.toString('utf8');
}
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const runIdentity = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const match = value.replaceAll('\\', '/').match(/(?:^|\/)\.grok\/learn\/runs\/(\d{8}-\d{6})$/);
  return match?.[1] ?? null;
};

/** Read existing local learning evidence. Never launches a model or applies edits. */
export async function getGrokLearningStatus(): Promise<GrokLearningStatus> {
  const result: GrokLearningStatus = {
    checkedAt: new Date().toISOString(), status: 'unavailable', completedAt: null,
    runId: null, sessionsKept: null, appliedUpdates: 0, verifiedUpdates: 0,
    deferredActions: 0, updates: [], provenance: {},
    meaning: 'Verified instruction updates from session history; fresh-task performance is not measured here.',
  };
  try {
    const stateText = await boundedRead(path.join(root, 'state.json'));
    const state: unknown = JSON.parse(stateText);
    if (!isObject(state)) return result;
    const runId = runIdentity(state.last_completed_dir);
    if (!runId || !isObject(state.pending) || state.pending.status !== 'done' || runIdentity(state.pending.run_dir) !== runId) return result;
    const runsRoot = await realpath(path.join(root, 'runs'));
    const directory = await realpath(path.join(runsRoot, runId));
    if (path.dirname(directory) !== runsRoot) return result;
    const manifestText = await boundedRead(path.join(directory, 'manifest.json'));
    const actionsText = await boundedRead(path.join(directory, 'actions.json'));
    const decisionsText = await boundedRead(path.join(root, 'decisions.jsonl'));
    const manifest: unknown = JSON.parse(manifestText), actions: unknown = JSON.parse(actionsText);
    if (!isObject(manifest) || !isObject(actions) || runIdentity(manifest.run_dir) !== runId || runIdentity(actions.run_dir) !== runId || !Array.isArray(actions.actions)) return result;
    const count = manifest.sessions_kept;
    if (typeof count !== 'number' || !Number.isInteger(count) || count <= 0 || state.sessions_kept !== count) return result;
    const decisions = new Map<string, Record<string, unknown>>();
    for (const line of decisionsText.split(/\r?\n/).filter(Boolean)) {
      const record: unknown = JSON.parse(line);
      if (isObject(record) && runIdentity(record.run_dir) === runId && typeof record.id === 'string') decisions.set(record.id, record);
    }
    for (const action of actions.actions) {
      if (!isObject(action) || typeof action.id !== 'string' || typeof action.target !== 'string') continue;
      const decision = decisions.get(action.id);
      if (!decision || decision.target !== action.target || decision.kind !== action.kind) continue;
      if (decision.decision === 'deferred') result.deferredActions++;
      if (decision.decision !== 'applied' || action.kind !== 'skill' || action.action !== 'edit') continue;
      result.appliedUpdates++;
      const target = allowedTargets[action.target];
      let verified = false, currentHash: string | null = null;
      if (target && isObject(action.edit) && typeof action.edit.replacement === 'string' && action.edit.replacement.trim()) {
        try {
          // Target comes from a fixed allowlist, never the reported action path.
          const current = await boundedRead(target);
          currentHash = hash(current);
          verified = current.includes(action.edit.replacement.trim());
        } catch { /* Missing or changed instruction remains unverified. */ }
      }
      result.updates.push({ id: action.id, target: action.target, verified, currentHash });
      if (verified) result.verifiedUpdates++;
    }
    result.runId = runId;
    result.sessionsKept = count;
    result.completedAt = typeof state.last_completed_at === 'string' && Number.isFinite(Date.parse(state.last_completed_at)) ? state.last_completed_at : null;
    result.provenance = { state: hash(stateText), manifest: hash(manifestText), actions: hash(actionsText), decisions: hash(decisionsText) };
    result.status = result.completedAt && result.appliedUpdates > 0 && result.verifiedUpdates === result.appliedUpdates ? 'verified' : 'incomplete';
    return result;
  } catch { return { ...result, status: 'unavailable', meaning: 'Existing learning evidence is missing or unreadable; no completed learning claim is made.' }; }
}
