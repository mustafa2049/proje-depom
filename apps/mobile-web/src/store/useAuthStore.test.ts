import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { session } from '../services/session';
import { installFakeFetch } from '../test/fakeFetch';

import { useAuthStore } from './useAuthStore';

const USER = {
  id: 'u1',
  email: 'a@test.dev',
  name: 'Ayşe',
  currentLevel: 'B1' as const,
  dailyGoalCards: 30,
  streakCount: 2,
  lastStudyDate: null,
  createdAt: '2026-10-01T00:00:00.000Z',
};

describe('useAuthStore.updateProfile', () => {
  beforeEach(() => {
    session.set({ accessToken: 'a', refreshToken: 'r' });
    useAuthStore.setState({ user: USER, errorMessage: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    session.set(null);
  });

  it('PATCH isteğiyle profili günceller ve kullanıcı durumunu yeniler', async () => {
    const { requests } = installFakeFetch({
      'PATCH /api/auth/me': (request) => ({
        body: { user: { ...USER, ...(request.body as object), dailyGoalCards: 25 } },
      }),
    });

    await useAuthStore.getState().updateProfile({ name: 'Yeni Ad', dailyGoalCards: 25 });

    expect(requests[0]?.body).toEqual({ name: 'Yeni Ad', dailyGoalCards: 25 });
    expect(useAuthStore.getState().user).toMatchObject({ name: 'Yeni Ad', dailyGoalCards: 25 });
  });

  it('sunucu hatasında kullanıcıyı değiştirmez, hata mesajı tutar ve hatayı yukarı fırlatır', async () => {
    installFakeFetch({
      'PATCH /api/auth/me': () => ({ status: 400, body: { error: { code: 'VALIDATION_ERROR', message: 'İstek doğrulanamadı' } } }),
    });

    await expect(useAuthStore.getState().updateProfile({ dailyGoalCards: 0 })).rejects.toThrow('İstek doğrulanamadı');
    expect(useAuthStore.getState().user).toEqual(USER);
    expect(useAuthStore.getState().errorMessage).toBe('İstek doğrulanamadı');
  });
});
