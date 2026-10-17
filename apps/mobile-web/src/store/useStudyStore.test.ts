import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { session } from '../services/session';
import type { CardView, ReviewRequest, StudyQueueItem } from '../types/api';

import { selectCurrentItem, selectRemaining, useStudyStore } from './useStudyStore';

const BASE_CARD = {
  deckId: 'deck-1',
  phonetic: null,
  partOfSpeech: 'noun',
  definitionEN: 'A test definition.',
  exampleSentence1: 'This is a test.',
  exampleSentence2: null,
  audioUrl: null,
  synonyms: [],
};

function makeCard(id: string, term: string): CardView {
  return { ...BASE_CARD, id, term, translationTR: `${term}-tr` };
}

function makeQueueItem(id: string, term: string): StudyQueueItem {
  return { card: makeCard(id, term), srs: null, isNew: true };
}

const XP: Record<number, number> = { 0: 1, 1: 5, 2: 10, 3: 12 };

interface FakeServer {
  dueItems: StudyQueueItem[];
  reviewRequests: ReviewRequest[];
  failReviewWith?: 'network' | 'server' | 'not-found';
}

/**
 * Sunucu davranışını taklit eden fetch stub'ı.
 * Değerlendirme yanıtı kaliteye göre sabit XP ve gerçekçi bir SRS durumu döner.
 */
function installFakeServer(server: FakeServer) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';

    if (url.pathname === '/api/srs/due' && method === 'GET') {
      return json(200, { items: server.dueItems, summary: {} });
    }

    if (url.pathname === '/api/srs/review' && method === 'POST') {
      const body = JSON.parse(String(init?.body)) as ReviewRequest;
      if (server.failReviewWith === 'network') {
        throw new TypeError('Failed to fetch');
      }
      if (server.failReviewWith === 'server') {
        return json(500, { error: { code: 'INTERNAL_ERROR', message: 'Sunucu hatası' } });
      }
      if (server.failReviewWith === 'not-found') {
        return json(404, { error: { code: 'NOT_FOUND', message: 'Kart bulunamadı' } });
      }
      server.reviewRequests.push(body);
      return json(200, {
        cardId: body.cardId,
        status: body.quality === 0 ? 'RELEARNING' : 'REVIEW',
        repetitions: body.quality === 0 ? 0 : 1,
        easeFactor: 2.5,
        interval: body.quality === 0 ? 1 : 1,
        nextReviewDate: new Date(Date.now() + 86_400_000).toISOString(),
        xpEarned: XP[body.quality] ?? 0,
        streakCount: 1,
      });
    }

    return json(404, { error: { code: 'NOT_FOUND', message: 'unknown' } });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function resetStore() {
  useStudyStore.getState().resetSession();
  useStudyStore.setState({ pendingReviews: [] });
}

async function answer(quality: 0 | 1 | 2 | 3) {
  useStudyStore.getState().flipCard();
  await useStudyStore.getState().submitReview(quality);
}

describe('useStudyStore', () => {
  let server: FakeServer;

  beforeEach(() => {
    session.set({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    server = { dueItems: [makeQueueItem('c1', 'apple'), makeQueueItem('c2', 'bread')], reviewRequests: [] };
    installFakeServer(server);
    resetStore();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    session.set(null);
  });

  it('kuyruğu yükler ve ilk kartı aktif yapar', async () => {
    await useStudyStore.getState().loadDueQueue('deck-1');

    const state = useStudyStore.getState();
    expect(state.status).toBe('studying');
    expect(state.queue).toHaveLength(2);
    expect(state.currentIndex).toBe(0);
    expect(state.isFlipped).toBe(false);
    expect(selectCurrentItem(state)?.card.term).toBe('apple');
    expect(state.sessionStats.startedAt).not.toBeNull();
  });

  it('kuyruk boşsa empty durumuna geçer', async () => {
    server.dueItems = [];
    await useStudyStore.getState().loadDueQueue();
    expect(useStudyStore.getState().status).toBe('empty');
  });

  it('kart çevrilmeden değerlendirme kabul edilmez', async () => {
    await useStudyStore.getState().loadDueQueue();
    await useStudyStore.getState().submitReview(2);

    expect(server.reviewRequests).toHaveLength(0);
    expect(useStudyStore.getState().currentIndex).toBe(0);
  });

  it('Good değerlendirmesi API\'ye gider, sonraki karta geçer ve istatistikleri günceller', async () => {
    await useStudyStore.getState().loadDueQueue();
    await answer(2);

    const state = useStudyStore.getState();
    expect(server.reviewRequests[0]).toMatchObject({ cardId: 'c1', quality: 2 });
    expect(server.reviewRequests[0]?.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof server.reviewRequests[0]?.reviewedAt).toBe('string');
    expect(state.currentIndex).toBe(1);
    expect(state.isFlipped).toBe(false);
    expect(state.lastXpGain).toBe(10);
    expect(state.sessionStats).toMatchObject({ reviewedCount: 1, correctCount: 1, xpEarned: 10 });
  });

  it('Again (0) kartı oturum sonuna yeniden ekler ve oturum bitmez', async () => {
    await useStudyStore.getState().loadDueQueue();
    await answer(0);

    let state = useStudyStore.getState();
    expect(state.queue).toHaveLength(3);
    expect(state.queue[2]?.card.id).toBe('c1');
    expect(state.queue[2]?.srs?.status).toBe('RELEARNING');
    expect(state.status).toBe('studying');
    expect(selectRemaining(state)).toBe(2);

    await answer(2);
    state = useStudyStore.getState();
    expect(state.status).toBe('studying');
    expect(selectCurrentItem(state)?.card.id).toBe('c1');

    await answer(3);
    state = useStudyStore.getState();
    expect(state.status).toBe('finished');
    expect(state.sessionStats).toMatchObject({
      reviewedCount: 3,
      correctCount: 2,
      xpEarned: XP[0]! + XP[2]! + XP[3]!,
    });
    expect(state.sessionStats.finishedAt).not.toBeNull();
  });

  it('ağ hatasında değerlendirme pendingReviews kuyruğuna yazılır ve kart yerel SRS ile ilerler', async () => {
    await useStudyStore.getState().loadDueQueue();
    server.failReviewWith = 'network';
    await answer(2);

    const state = useStudyStore.getState();
    expect(state.pendingReviews).toHaveLength(1);
    expect(state.pendingReviews[0]).toMatchObject({ cardId: 'c1', quality: 2 });
    expect(state.currentIndex).toBe(1);
    expect(state.lastXpGain).toBe(10);
    expect(state.isSubmitting).toBe(false);
  });

  it('çevrimdışı Again, kartı yerel SRS sonucuyla (RELEARNING, 10 dk) oturum sonuna koyar', async () => {
    await useStudyStore.getState().loadDueQueue();
    server.failReviewWith = 'network';
    await answer(0);

    const requeued = useStudyStore.getState().queue[2];
    expect(requeued?.card.id).toBe('c1');
    expect(requeued?.srs?.status).toBe('RELEARNING');
    expect(requeued?.srs?.interval).toBe(1);
    const delayMs = new Date(requeued?.srs?.nextReviewDate ?? 0).getTime() - Date.now();
    expect(delayMs).toBeGreaterThan(9 * 60_000);
    expect(delayMs).toBeLessThanOrEqual(10 * 60_000);
  });

  it('flushPendingReviews bekleyenleri sırayla gönderir ve kuyruğu boşaltır', async () => {
    await useStudyStore.getState().loadDueQueue();
    server.failReviewWith = 'network';
    await answer(2);
    const pending = useStudyStore.getState().pendingReviews[0];
    expect(pending).toBeDefined();

    server.failReviewWith = undefined;
    await useStudyStore.getState().flushPendingReviews();

    expect(useStudyStore.getState().pendingReviews).toHaveLength(0);
    expect(server.reviewRequests).toHaveLength(1);
    expect(server.reviewRequests[0]).toMatchObject({
      cardId: pending?.cardId,
      quality: pending?.quality,
      reviewedAt: pending?.reviewedAt,
    });
  });

  it('hâlâ çevrimdışıyken flush bekleyenleri korur', async () => {
    await useStudyStore.getState().loadDueQueue();
    server.failReviewWith = 'network';
    await answer(2);

    await useStudyStore.getState().flushPendingReviews();

    expect(useStudyStore.getState().pendingReviews).toHaveLength(1);
  });

  it('kalıcı reddedilen (404) değerlendirme kuyruktan düşürülür', async () => {
    await useStudyStore.getState().loadDueQueue();
    server.failReviewWith = 'network';
    await answer(2);

    server.failReviewWith = 'not-found';
    await useStudyStore.getState().flushPendingReviews();

    expect(useStudyStore.getState().pendingReviews).toHaveLength(0);
  });

  it('sunucu hatasında ilerlemez, hata mesajı gösterir ve yeniden denenebilir', async () => {
    await useStudyStore.getState().loadDueQueue();
    server.failReviewWith = 'server';
    await answer(2);

    const state = useStudyStore.getState();
    expect(state.currentIndex).toBe(0);
    expect(state.errorMessage).toBe('Sunucu hatası');
    expect(state.isSubmitting).toBe(false);
    expect(state.pendingReviews).toHaveLength(0);
  });
});
