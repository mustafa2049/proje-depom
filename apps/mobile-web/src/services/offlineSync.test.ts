import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { session } from './session';
import { installFakeFetch } from '../test/fakeFetch';
import { syncPendingReviews } from './offlineSync';
import { useStudyStore } from '../store/useStudyStore';

describe('syncPendingReviews', () => {
  beforeEach(() => {
    session.set({ accessToken: 'a', refreshToken: 'r' });
    useStudyStore.setState({ pendingReviews: [] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    session.set(null);
  });

  it('bekleyen yoksa hiçbir istek atmaz', async () => {
    const { requests } = installFakeFetch({});
    const result = await syncPendingReviews();

    expect(result).toEqual({ synced: 0, remaining: 0 });
    expect(requests).toHaveLength(0);
  });

  it('bekleyenleri gönderir, istatistik ve deste sayaçlarını yeniler', async () => {
    useStudyStore.setState({
      pendingReviews: [
        { id: 'p1', cardId: 'c1', quality: 2, durationMs: 1000, reviewedAt: '2026-10-16T10:00:00.000Z' },
        { id: 'p2', cardId: 'c2', quality: 0, durationMs: 800, reviewedAt: '2026-10-16T10:01:00.000Z' },
      ],
    });
    const { requests } = installFakeFetch({
      'POST /api/srs/review': () => ({ body: { cardId: 'x', status: 'REVIEW', repetitions: 1, easeFactor: 2.5, interval: 1, nextReviewDate: new Date().toISOString(), xpEarned: 10, streakCount: 1 } }),
      'GET /api/stats/overview': () => ({ body: { streakCount: 1, heatmap: [], srsBreakdown: { new: 0, learning: 0, review: 0, relearning: 0 }, weeklyTrend: { days: [], totalXp: 0, accuracyPercent: null } } }),
      'GET /api/decks': () => ({ body: { decks: [] } }),
    });

    const result = await syncPendingReviews();

    expect(result).toEqual({ synced: 2, remaining: 0 });
    const paths = requests.map((request) => `${request.method} ${request.path}`);
    expect(paths).toContain('POST /api/srs/review');
    expect(paths).toContain('GET /api/stats/overview');
    expect(paths).toContain('GET /api/decks');
    expect(requests.find((request) => request.path === '/api/srs/review')?.body).toMatchObject({ reviewedAt: '2026-10-16T10:00:00.000Z' });
  });

  it('ağ hâlâ yoksa bekleyenleri korur ve yenileme yapmaz', async () => {
    useStudyStore.setState({
      pendingReviews: [{ id: 'p1', cardId: 'c1', quality: 2, durationMs: 0, reviewedAt: new Date().toISOString() }],
    });
    const { requests } = installFakeFetch({
      'POST /api/srs/review': () => {
        throw new TypeError('offline');
      },
    });

    const result = await syncPendingReviews();

    expect(result).toEqual({ synced: 0, remaining: 1 });
    expect(requests.some((request) => request.path === '/api/stats/overview')).toBe(false);
  });
});
