import { beforeEach, describe, expect, it, vi } from 'vitest';
const read=vi.hoisted(()=>vi.fn());
vi.mock('@/lib/orpaynter/grok-learning',()=>({getGrokLearningStatus:read}));
import { GET } from './route';
describe('learning read boundary',()=>{
 beforeEach(()=>{vi.clearAllMocks();read.mockResolvedValue({status:'verified',sessionsKept:25});});
 it('returns only read metadata without caching',async()=>{const r=await GET(new Request('http://localhost:4180/api/orpaynter/learning'));expect(r.status).toBe(200);expect(r.headers.get('cache-control')).toBe('no-store');expect(await r.json()).toEqual({status:'verified',sessionsKept:25});});
 it('rejects nonlocal and foreign-origin reads before file access',async()=>{for(const request of [new Request('https://public.example/api/orpaynter/learning'),new Request('http://localhost:4180/api/orpaynter/learning',{headers:{origin:'https://evil.example'}})])expect((await GET(request)).status).toBe(403);expect(read).not.toHaveBeenCalled();});
});
