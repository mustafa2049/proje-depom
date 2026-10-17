import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '../services/appStorageKeys';
import { LOCAL_SESSION_TOKENS } from '../services/local/localBackend';
import { secureStorage } from '../services/secureStorage';
import { session } from '../services/session';
import { installFakeFetch } from '../test/fakeFetch';

import { useAuthStore } from './useAuthStore';
import { useConnectionStore } from './useConnectionStore';
import { useDeckStore } from './useDeckStore';
import { usePracticeStore } from './usePracticeStore';
import { useReaderStore } from './useReaderStore';
import { useStatsStore } from './useStatsStore';
import { useStudyStore } from './useStudyStore';
import { useTutorStore } from './useTutorStore';

const REMOTE_USER = {
  id: 'u1',
  email: 'a@test.dev',
  name: 'Ayşe',
  currentLevel: 'B1' as const,
  dailyGoalCards: 30,
  streakCount: 0,
  lastStudyDate: null,
  createdAt: '2026-10-01T00:00:00.000Z',
};

/** Ağ isteği yapılırsa testi başarısız kılar: sunucusuz modda hiçbir istek gitmemeli. */
function forbidNetwork() {
  const fetchMock = vi.fn(() => Promise.reject(new Error('Sunucusuz modda ağ isteği yapılmamalı')));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('sunucusuz mod: store akışı', () => {
  beforeEach(() => {
    session.set(null);
    useConnectionStore.setState({ mode: 'remote', apiUrl: 'http://localhost:3000' });
    useStudyStore.setState({ pendingReviews: [], cachedDueQueue: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    session.set(null);
  });

  it('ağ olmadan oturum açar; desteler, çalışma, istatistik, okuyucu, alıştırma ve eğitmen çalışır', async () => {
    const fetchMock = forbidNetwork();

    await useAuthStore.getState().startOfflineMode();
    expect(useConnectionStore.getState().mode).toBe('local');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Öğrenci');

    await useDeckStore.getState().loadDecks();
    expect(useDeckStore.getState().decks).toHaveLength(6);

    await useStudyStore.getState().loadDueQueue();
    expect(useStudyStore.getState().status).toBe('studying');
    useStudyStore.getState().flipCard();
    await useStudyStore.getState().submitReview(2);
    expect(useStudyStore.getState()).toMatchObject({ isOffline: false, pendingReviews: [] });
    expect(useStudyStore.getState().sessionStats).toMatchObject({ reviewedCount: 1, xpEarned: 10 });

    await useStatsStore.getState().loadOverview();
    expect(useStatsStore.getState().overview?.totalXp).toBeGreaterThanOrEqual(10);

    await useReaderStore.getState().loadPassages();
    expect(useReaderStore.getState().passages.length).toBeGreaterThan(0);

    await usePracticeStore.getState().loadExercises();
    expect(usePracticeStore.getState()).toMatchObject({ status: 'ready', level: 'A2' });

    useTutorStore.getState().startNewSession('cafe-order');
    expect(await useTutorStore.getState().sendMessage('a latte please')).toBe(true);
    expect(useTutorStore.getState().messages).toHaveLength(2);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sunucu modundan kalan bekleyen değerlendirmeler yerel veriye yazılmaz, sunucuya dönünce gönderilir', async () => {
    forbidNetwork();
    const pending = { id: 'p1', cardId: 'seed-card-book', quality: 2 as const, durationMs: 1000, reviewedAt: new Date().toISOString() };
    useStudyStore.setState({ pendingReviews: [pending] });

    await useAuthStore.getState().startOfflineMode();
    await useStudyStore.getState().flushPendingReviews();
    expect(useStudyStore.getState().pendingReviews).toEqual([pending]);

    const { requests } = installFakeFetch({
      'POST /api/auth/login': () => ({ body: { accessToken: 'a', refreshToken: 'r', expiresIn: 900, user: REMOTE_USER } }),
      'POST /api/srs/review': () => ({ body: {} }),
    });
    await useAuthStore.getState().login('a@test.dev', 'secret123');
    await useStudyStore.getState().flushPendingReviews();

    expect(useStudyStore.getState().pendingReviews).toEqual([]);
    expect(requests.map((request) => request.path)).toEqual(['/api/auth/login', '/api/srs/review']);
  });

  it('giriş yapınca sunucu moduna geçer ve kaydedilen sunucu adresini kullanır', async () => {
    await useAuthStore.getState().startOfflineMode();
    useConnectionStore.getState().setApiUrl('http://192.168.1.20:3000');

    const { fetchMock } = installFakeFetch({
      'POST /api/auth/login': () => ({ body: { accessToken: 'a', refreshToken: 'r', expiresIn: 900, user: REMOTE_USER } }),
    });
    await useAuthStore.getState().login('a@test.dev', 'secret123');

    expect(useConnectionStore.getState().mode).toBe('remote');
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('http://192.168.1.20:3000/api/auth/login');
    expect(useAuthStore.getState().user).toEqual(REMOTE_USER);
  });

  it('açılışta yerel oturum yalnızca sunucusuz modda geri yüklenir', async () => {
    forbidNetwork();
    await secureStorage.setItem(STORAGE_KEYS.authTokens, JSON.stringify(LOCAL_SESSION_TOKENS));

    useConnectionStore.setState({ mode: 'local' });
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.name).toBeTruthy();

    session.set(null);
    await secureStorage.setItem(STORAGE_KEYS.authTokens, JSON.stringify(LOCAL_SESSION_TOKENS));
    useConnectionStore.setState({ mode: 'remote' });
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(await secureStorage.getItem(STORAGE_KEYS.authTokens)).toBeNull();
  });
});
