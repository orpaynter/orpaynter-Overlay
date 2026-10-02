import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { StringDecoder } from 'node:string_decoder';

export const COMPANY_GH_EXECUTABLE = '/mnt/c/Program Files/GitHub CLI/gh.exe';
export const COMPANY_OWNER = 'orpaynter' as const;
export const COMPANY_ACCOUNT_ID = 127189622;
export const COMPANY_REPOS = ['orpaynter/AIA', 'orpaynter/claimflow'] as const;
export const COMPANY_TIMEOUT_MS = 12_000;
export const COMPANY_OUTPUT_LIMIT = 300_000;
const CACHE_MS = 30_000;

export interface CompanyWork {
  id: string;
  repo: string;
  number: number;
  title: string;
  url: string;
  state: string;
  kind: 'issue' | 'pull_request';
  labels: string[];
  assignees: string[];
  updatedAt: string;
  priority: 'do-now' | 'normal' | 'backlog';
  draft?: boolean;
  head?: string;
}

export interface CompanyState {
  revision: string;
  checkedAt: string;
  github: {
    status: 'connected' | 'unavailable' | 'owner_mismatch';
    owner: typeof COMPANY_OWNER;
    accountId: number | null;
    error?: string;
  };
  work: CompanyWork[];
  repositories?: {
    repo: string;
    issues: 'available' | 'unavailable';
    pullRequests: 'available' | 'unavailable';
  }[];
  scope?: string;
}

type Resource = 'user' | 'issues' | 'pulls';
const USER_QUERY = '{login,id}';
const WORK_QUERY = 'map({number,title,html_url,state,updated_at,labels:[.labels[]?.name],assignees:[.assignees[]?.login],pull_request,draft,head:(.head.sha // null)})';

/** No caller-controlled endpoints, flags, executable, or shell expressions. */
function readGitHub(resource: Resource, repo?: typeof COMPANY_REPOS[number]): Promise<unknown> {
  if (resource !== 'user' && (!repo || !COMPANY_REPOS.includes(repo))) {
    return Promise.reject(new Error('Company repository is outside the read scope.'));
  }
  const endpoint = resource === 'user' ? 'user' : `repos/${repo}/${resource}?state=open&per_page=100`;
  const args = ['api', '--method', 'GET', endpoint, '--jq', resource === 'user' ? USER_QUERY : WORK_QUERY];
  return new Promise((resolve, reject) => {
    let completed = false;
    let bytes = 0;
    let output = '';
    const decoder = new StringDecoder('utf8');
    const child = spawn(COMPANY_GH_EXECUTABLE, args, { shell: false, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const fail = (message: string) => {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      child.kill('SIGKILL');
      reject(new Error(message));
    };
    const timer = setTimeout(() => fail('GitHub company read timed out.'), COMPANY_TIMEOUT_MS);
    child.stdout?.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > COMPANY_OUTPUT_LIMIT) { fail('GitHub company response exceeded the local limit.'); return; }
      output += decoder.write(chunk);
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > COMPANY_OUTPUT_LIMIT) fail('GitHub company response exceeded the local limit.');
    });
    child.on('error', () => fail('GitHub company reader is unavailable.'));
    child.on('close', (code: number | null) => {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      if (code !== 0) { reject(new Error('GitHub company read failed.')); return; }
      try { resolve(JSON.parse(output + decoder.end())); }
      catch { reject(new Error('GitHub company returned an invalid response.')); }
    });
  });
}

function stringValue(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, limit) : '';
}

function parseWork(data: unknown, repo: string, kind: CompanyWork['kind']): CompanyWork[] {
  if (!Array.isArray(data)) throw new Error('GitHub company returned an invalid response.');
  return data.slice(0, 100).flatMap((row: Record<string, unknown>) => {
    if (!row || typeof row !== 'object' || (kind === 'issue' && row.pull_request)) return [];
    if (!Number.isSafeInteger(row.number) || Number(row.number) < 1) return [];
    const number = Number(row.number);
    const title = stringValue(row.title, 1024);
    const expectedUrl = `https://github.com/${repo}/${kind === 'issue' ? 'issues' : 'pull'}/${number}`;
    const updatedAt = stringValue(row.updated_at, 64);
    if (!title || row.html_url !== expectedUrl || !Number.isFinite(Date.parse(updatedAt))) return [];
    const labels = (Array.isArray(row.labels) ? row.labels : []).slice(0, 30).map(label => stringValue(label, 80)).filter(Boolean);
    const assignees = (Array.isArray(row.assignees) ? row.assignees : []).slice(0, 20).filter((value): value is string => typeof value === 'string' && /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value));
    const doNow = /\bdo[\s_-]*now\b/i.test(title) || labels.some(label => /^(do[\s_-]*now|urgent|p0([\s_-]*critical)?|p1([\s_-]*high)?|priority[\s:_-]*(high|critical|0|1))$/i.test(label));
    const backlog = /\bbacklog\b/i.test(title) || labels.some(label => /backlog/i.test(label));
    const priority = doNow ? 'do-now' : backlog ? 'backlog' : 'normal';
    const item: CompanyWork = { id: `github:${repo}:${kind}:${number}`, repo, number, title, url: expectedUrl, state: stringValue(row.state, 24), kind, labels, assignees, updatedAt, priority };
    if (kind === 'pull_request') {
      item.draft = row.draft === true;
      if (typeof row.head === 'string' && /^[a-f\d]{40}$/i.test(row.head)) item.head = row.head;
    }
    return [item];
  });
}

let cached: { at: number; state: CompanyState } | undefined;
let inFlight: Promise<CompanyState> | undefined;

function finishState(github: CompanyState['github'], work: CompanyWork[], repositories?: CompanyState['repositories']): CompanyState {
  const scope = 'Open issues and pull requests from two fixed OrPaynter repositories; at most 100 per resource. Repository work, not an exhaustive workforce or customer-job inventory.';
  const revision = createHash('sha256').update(JSON.stringify({ github, work, repositories })).digest('hex');
  return { revision, checkedAt: new Date().toISOString(), github, work, repositories, scope };
}

async function captureCompany(): Promise<CompanyState> {
  let account: unknown;
  try { account = await readGitHub('user'); }
  catch { return finishState({ status: 'unavailable', owner: COMPANY_OWNER, accountId: null, error: 'GitHub company reader is unavailable or not authenticated.' }, []); }
  const user = account as { login?: unknown; id?: unknown } | null;
  const accountId = typeof user?.id === 'number' && Number.isSafeInteger(user.id) ? user.id : null;
  if (user?.login !== COMPANY_OWNER || accountId !== COMPANY_ACCOUNT_ID) {
    return finishState({ status: 'owner_mismatch', owner: COMPANY_OWNER, accountId, error: 'The authenticated GitHub account does not match the configured OrPaynter owner.' }, []);
  }
  const repositories: NonNullable<CompanyState['repositories']> = [];
  const work: CompanyWork[] = [];
  for (const repo of COMPANY_REPOS) {
    const values = await Promise.allSettled([
      readGitHub('issues', repo).then(data => parseWork(data, repo, 'issue')),
      readGitHub('pulls', repo).then(data => parseWork(data, repo, 'pull_request')),
    ]);
    repositories.push({ repo, issues: values[0].status === 'fulfilled' ? 'available' : 'unavailable', pullRequests: values[1].status === 'fulfilled' ? 'available' : 'unavailable' });
    for (const value of values) if (value.status === 'fulfilled') work.push(...value.value);
  }
  work.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const failures = repositories.some(repo => repo.issues === 'unavailable' || repo.pullRequests === 'unavailable');
  const allFailed = repositories.every(repo => repo.issues === 'unavailable' && repo.pullRequests === 'unavailable');
  return finishState({ status: allFailed ? 'unavailable' : 'connected', owner: COMPANY_OWNER, accountId, ...(failures ? { error: 'Some scoped repository reads are unavailable; the displayed work is partial.' } : {}) }, work, repositories);
}

export function getCompanyState(): Promise<CompanyState> {
  if (cached && Date.now() - cached.at < CACHE_MS) return Promise.resolve(cached.state);
  if (inFlight) return inFlight;
  inFlight = captureCompany().then(state => {
    cached = { at: Date.now(), state };
    return state;
  }).finally(() => { inFlight = undefined; });
  return inFlight;
}
