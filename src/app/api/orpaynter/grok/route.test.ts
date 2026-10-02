import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock=vi.hoisted(()=>({analyze:vi.fn(),company:vi.fn(),snapshot:vi.fn(),write:vi.fn(),sync:vi.fn()}));
vi.mock('@/lib/orpaynter/grok',()=>({analyzeWithGrok:mock.analyze}));
vi.mock('@/lib/orpaynter/company',()=>({getCompanyState:mock.company}));
vi.mock('@/lib/orpaynter/observations',()=>({readSnapshot:mock.snapshot,analysisPrompt:()=> 'Public source data'}));
vi.mock('node:fs/promises',()=>({mkdir:vi.fn().mockResolvedValue(undefined),writeFile:mock.write,readFile:vi.fn(),readdir:vi.fn()}));
vi.mock('node:fs',()=>({writeFileSync:mock.sync}));
import { POST } from './route';
const work={id:'github:orpaynter/AIA:pull_request:126',title:'Actual World Twin foundation',repo:'orpaynter/AIA',number:126,url:'https://github.com/orpaynter/AIA/pull/126',state:'open',kind:'pull_request',draft:true,labels:[],assignees:[],updatedAt:'2026-09-29T23:22:17Z',priority:'normal'};
function request(body:unknown,origin='http://localhost:4180'){return new Request('http://localhost:4180/api/orpaynter/grok',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});}
describe('owner-scoped company job boundary',()=>{
 beforeEach(()=>{vi.clearAllMocks();mock.write.mockResolvedValue(undefined);mock.snapshot.mockResolvedValue({id:'source123',feeds:[{status:'available',items:[{}]}]});mock.company.mockResolvedValue({github:{status:'connected'},work:[work],revision:'company456',checkedAt:'2026-09-30T03:00:00Z'});mock.analyze.mockImplementation(async (_:string,started:()=>void)=>{started();return {text:'Sourced proposal',sessionId:'session789'};});});
 it('rejects nonexistent task identities before a paid model call',async()=>{const r=await POST(request({snapshotId:'source123',objective:'Inspect',companyWorkId:'invented'}));expect(r.status).toBe(409);expect(mock.analyze).not.toHaveBeenCalled();expect(mock.write).not.toHaveBeenCalled();});
 it('rejects tasks when the owner account cannot be verified',async()=>{mock.company.mockResolvedValue({github:{status:'owner_mismatch'},work:[work]});expect((await POST(request({snapshotId:'source123',objective:'Inspect',companyWorkId:work.id}))).status).toBe(409);expect(mock.analyze).not.toHaveBeenCalled();});
 it('freezes server-read task and source identity and journals actual process progress',async()=>{const r=await POST(request({snapshotId:'source123',objective:'Inspect',companyWorkId:work.id,companyWork:{title:'Injected task'}}));expect(r.status).toBe(200);const result=await r.json();expect(result.companyWork).toEqual(work);expect(result.companyRevision).toBe('company456');expect(result.snapshotId).toBe('source123');expect(result.externalAction).toBe(false);expect(mock.analyze.mock.calls[0][0]).toContain('Actual World Twin foundation');expect(mock.analyze.mock.calls[0][0]).not.toContain('Injected task');expect(JSON.parse(mock.write.mock.calls[0][1]).status).toBe('starting');expect(JSON.parse(mock.sync.mock.calls[0][1]).status).toBe('running');expect(JSON.parse(mock.write.mock.calls[1][1]).status).toBe('completed');});
 it('rejects foreign-origin and malformed bodies without provider calls',async()=>{expect((await POST(request(null))).status).toBe(400);expect((await POST(request({objective:'Inspect'},'https://example.com'))).status).toBe(403);expect(mock.analyze).not.toHaveBeenCalled();});
});
