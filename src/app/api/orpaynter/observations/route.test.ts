import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ read: vi.fn(), collect: vi.fn(), save: vi.fn() }));
vi.mock('@/lib/orpaynter/observations', () => ({
  readSnapshot: mock.read, collectSnapshot: mock.collect, saveSnapshot: mock.save,
  validSnapshotId: (id: string) => /^[a-f0-9]{64}$/.test(id),
}));
import { GET } from './route';

describe('frozen capture retrieval', () => {
  beforeEach(() => vi.clearAllMocks());
  it('returns the original capture without collecting or overwriting a new one', async () => {
    const snapshot = { id: 'a'.repeat(64), capturedAt: '2026-09-29T00:00:00Z', feeds: [] };
    mock.read.mockResolvedValue(snapshot);
    const response = await GET(new Request('http://localhost:4180/api/orpaynter/observations?snapshotId=' + snapshot.id));
    expect(await response.json()).toEqual(snapshot);
    expect(mock.collect).not.toHaveBeenCalled();
    expect(mock.save).not.toHaveBeenCalled();
  });
  it('rejects traversal and corrupted or missing stored captures without a fresh replacement', async () => {
    expect((await GET(new Request('http://localhost:4180/api/orpaynter/observations?snapshotId=../secret'))).status).toBe(400);
    expect(mock.read).not.toHaveBeenCalled();
    mock.read.mockRejectedValue(new Error('Snapshot integrity check failed.'));
    expect((await GET(new Request('http://localhost:4180/api/orpaynter/observations?snapshotId=' + 'b'.repeat(64)))).status).toBe(404);
    expect(mock.collect).not.toHaveBeenCalled();
  });
  it('keeps captured company context behind the local request boundary', async () => {
    const response = await GET(new Request('http://localhost:4180/api/orpaynter/observations?snapshotId=' + 'a'.repeat(64), { headers: { origin: 'https://outside.example' } }));
    expect(response.status).toBe(403);
    expect(mock.read).not.toHaveBeenCalled();
  });
});
