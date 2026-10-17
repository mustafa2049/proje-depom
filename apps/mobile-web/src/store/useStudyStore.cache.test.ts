import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { session } from '../services/session';
import { installFakeFetch } from '../test/fakeFetch';
import type { StudyQueueItem } from '../types/api';

import { useStudyStore } from './useStudyStore';

function item(id: string, term: string): StudyQueueItem {
  return {
    card: {
      id,
      deckId: 'deck-1',
      term,
      phonetic: null,
      partOfSpeech: 'noun',
      translationTR: term,
      definitionEN: 'A test card.',
      exampleSentence1: `This is ${term}.`,
      exampleSentence2: null,
      audioUrl: null,
      synonyms: [],
    },
    srs: null,
    isNew: true,
  };
}

const REVIEW_RESULT = (quality: number) => ({
  cardId: 'x',
  status: quality === 0 ? 'RELEARNING' : 'REVIEW',
  repetitions: 1,
  easeFactor: 2.5,
  interval: 1,
  nextReviewDate: new Date(Date.now() + 86_400_000).toISOString(),
  xpEarned: quality === 2 ? 10 : 1,
  streakCount: 1,
});

function resetStudy() {
  useStudyStore.getState().resetSession();
  useStudyStore.setState({ pendingReviews: [], cachedDueQueue: null, isOffline: false });
}

describe('çevrimdışı kuyruk önbelleği (cachedDueQueue)', () => {
  let online = true;

  beforeEach(() => {
    session.set({ accessToken: 'a', refreshToken: 'r' });
    online = true;
    installFakeFetch({
      'GET /api/srs/due': () => {
        if (!online) throw new TypeError('offline');
        return { body: { items: [item('c1', 'apple'), item('c2', 'bread'), item('c3', 'cat')], summary: {} } };
      },
      'POST /api/srs/review': (request) => {
        if (!online) throw new TypeError('offline');
        return { body: REVIEW_RESULT((request.body as { quality: number }).quality) };
      },
    });
    resetStudy();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    session.set(null);
  });

  it('çevrimiçi yükleme kuyruğu önbelleğe alır', async () => {
    await useStudyStore.getState().loadDueQueue();

    const cache = useStudyStore.getState().cachedDueQueue;
    expect(cache?.items).toHaveLength(3);
    expect(cache?.deckId).toBeNull();
    expect(useStudyStore.getState().isOffline).toBe(false);
  });

  it('ağ yokken önbellekteki kuyruğu kullanır ve çevrimdışı işaretler', async () => {
    await useStudyStore.getState().loadDueQueue();
    online = false;
    await useStudyStore.getState().loadDueQueue();

    const state = useStudyStore.getState();
    expect(state.status).toBe('studying');
    expect(state.queue.map((entry) => entry.card.id)).toEqual(['c1', 'c2', 'c3']);
    expect(state.isOffline).toBe(true);
  });

  it('bekleyen değerlendirmesi olan kartları önbellekten çıkarır (tekrar sorulmaz)', async () => {
    await useStudyStore.getState().loadDueQueue();
    online = false;

    // c1 çevrimdışı değerlendirilir (Good)
    await useStudyStore.getState().loadDueQueue();
    useStudyStore.getState().flipCard();
    await useStudyStore.getState().submitReview(2);
    expect(useStudyStore.getState().pendingReviews).toHaveLength(1);

    // Yeniden yükleme: c1 hem önbellekte değil hem bekleyen listede olmalı
    await useStudyStore.getState().loadDueQueue();
    expect(useStudyStore.getState().queue.map((entry) => entry.card.id)).toEqual(['c2', 'c3']);
  });

  it('farklı deste için önbellek kullanılmaz ve hata gösterilir', async () => {
    await useStudyStore.getState().loadDueQueue();
    online = false;
    await useStudyStore.getState().loadDueQueue('another-deck');

    expect(useStudyStore.getState().status).toBe('error');
  });

  it('önbellekteki tüm kartlar bekliyorsa oturum boş döner', async () => {
    await useStudyStore.getState().loadDueQueue();
    online = false;
    useStudyStore.setState({
      pendingReviews: ['c1', 'c2', 'c3'].map((cardId) => ({
        id: cardId,
        cardId,
        quality: 2 as const,
        durationMs: 0,
        reviewedAt: new Date().toISOString(),
      })),
    });

    await useStudyStore.getState().loadDueQueue();
    expect(useStudyStore.getState().status).toBe('empty');
  });

  it('Again dışında bir değerlendirme kartı önbellekten çıkarır, Again kartı bırakır', async () => {
    await useStudyStore.getState().loadDueQueue();
    online = false;
    await useStudyStore.getState().loadDueQueue();

    useStudyStore.getState().flipCard();
    await useStudyStore.getState().submitReview(0); // c1 Again
    useStudyStore.getState().flipCard();
    await useStudyStore.getState().submitReview(3); // c2 Easy

    const cachedIds = useStudyStore.getState().cachedDueQueue?.items.map((entry) => entry.card.id);
    expect(cachedIds).toEqual(['c1', 'c3']);
  });
});
