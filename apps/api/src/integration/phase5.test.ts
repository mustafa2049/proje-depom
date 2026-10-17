import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../app';
import { createPrismaClient } from '../lib/prisma';
import { createLlmProvider } from '../services/llmService';

/** Faz 5 uç noktaları: profil güncelleme ve genişletilmiş istatistikler (gerçek PostgreSQL). */
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const PASSWORD = 'strong-password-123';
const SYSTEM_DECK_ID = 'p5-deck-system';
const CARD_IDS = ['p5-card-1', 'p5-card-2', 'p5-card-3', 'p5-card-4', 'p5-card-5', 'p5-card-6'];

describe.skipIf(!TEST_DATABASE_URL)('Faz 5 API (entegrasyon)', () => {
  let db: PrismaClient;
  let app: FastifyInstance;

  beforeAll(async () => {
    db = createPrismaClient(TEST_DATABASE_URL as string);
    app = await buildApp({
      db,
      llm: createLlmProvider({ AI_PROVIDER: 'mock', OPENAI_MODEL: 'x', GEMINI_MODEL: 'x' }),
      jwtSecret: 'phase5-integration-secret-that-is-long-enough',
      accessTokenTtlSec: 900,
      refreshTokenTtlSec: 3600,
      corsOrigins: ['http://localhost:8081'],
      rateLimitEnabled: false,
    });
    await app.ready();

    await db.deck.upsert({
      where: { id: SYSTEM_DECK_ID },
      create: { id: SYSTEM_DECK_ID, title: 'Phase 5 Deck', level: 'B1', isSystem: true },
      update: {},
    });
    for (const [index, id] of CARD_IDS.entries()) {
      await db.card.upsert({
        where: { id },
        create: {
          id,
          deckId: SYSTEM_DECK_ID,
          term: `p5-word-${index + 1}`,
          partOfSpeech: 'noun',
          translationTR: `p5-kelime-${index + 1}`,
          definitionEN: 'Phase five test card.',
          exampleSentence1: 'A phase five example.',
          synonyms: [],
        },
        update: {},
      });
    }
  });

  afterAll(async () => {
    await app?.close();
    await db?.$disconnect();
  });

  async function registerUser(): Promise<{ accessToken: string; id: string }> {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: `p5-${crypto.randomUUID()}@test.dev`, password: PASSWORD, name: 'Phase Five', currentLevel: 'A2' },
    });
    expect(res.statusCode).toBe(201);
    return { accessToken: res.json().accessToken, id: res.json().user.id };
  }

  const auth = (user: { accessToken: string }) => ({ authorization: `Bearer ${user.accessToken}` });

  describe('profil güncelleme (PATCH /api/auth/me)', () => {
    it('ad, seviye ve günlük hedefi günceller ve güncel profili döner', async () => {
      const user = await registerUser();
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/auth/me',
        headers: auth(user),
        payload: { name: 'Yeni Ad', currentLevel: 'C1', dailyGoalCards: 25 },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().user).toMatchObject({ name: 'Yeni Ad', currentLevel: 'C1', dailyGoalCards: 25 });

      const me = await app.inject({ method: 'GET', url: '/api/auth/me', headers: auth(user) });
      expect(me.json().user.dailyGoalCards).toBe(25);
    });

    it('yalnızca verilen alanları değiştirir', async () => {
      const user = await registerUser();
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/auth/me',
        headers: auth(user),
        payload: { dailyGoalCards: 50 },
      });

      expect(res.json().user).toMatchObject({ name: 'Phase Five', currentLevel: 'A2', dailyGoalCards: 50 });
    });

    it('boş gövde, geçersiz hedef ve geçersiz seviye 400 döner', async () => {
      const user = await registerUser();

      const empty = await app.inject({ method: 'PATCH', url: '/api/auth/me', headers: auth(user), payload: {} });
      expect(empty.statusCode).toBe(400);

      for (const dailyGoalCards of [0, 201]) {
        const res = await app.inject({
          method: 'PATCH',
          url: '/api/auth/me',
          headers: auth(user),
          payload: { dailyGoalCards },
        });
        expect(res.statusCode).toBe(400);
      }

      const badLevel = await app.inject({
        method: 'PATCH',
        url: '/api/auth/me',
        headers: auth(user),
        payload: { currentLevel: 'Z9' },
      });
      expect(badLevel.statusCode).toBe(400);
    });

    it('oturum yoksa 401 döner', async () => {
      const res = await app.inject({ method: 'PATCH', url: '/api/auth/me', payload: { name: 'x' } });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('CORS', () => {
    it('web kökeni için PATCH ön uçuş isteğine izin verir', async () => {
      const res = await app.inject({
        method: 'OPTIONS',
        url: '/api/auth/me',
        headers: {
          origin: 'http://localhost:8081',
          'access-control-request-method': 'PATCH',
          'access-control-request-headers': 'authorization,content-type',
        },
      });

      expect(res.statusCode).toBe(204);
      expect(res.headers['access-control-allow-methods']).toContain('PATCH');
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:8081');
    });
  });

  describe('genişletilmiş istatistikler', () => {
    it('SRS dağılımı, 90 günlük ısı haritası, yoğunluk ve 7 günlük trend bugünkü aktiviteyi yansıtır', async () => {
      const user = await registerUser();
      const before = (await app.inject({ method: 'GET', url: '/api/stats/overview', headers: auth(user) })).json();
      expect(before.heatmap).toHaveLength(90);
      expect(before.weeklyTrend.days).toHaveLength(7);

      // Kalite dağılımı: 2,2,2,0,3,1 → toplam XP 10+10+10+1+12+5 = 48, doğru (≥2): 4 / 6
      const qualities = [2, 2, 2, 0, 3, 1] as const;
      for (const [index, quality] of qualities.entries()) {
        const res = await app.inject({
          method: 'POST',
          url: '/api/srs/review',
          headers: auth(user),
          payload: { cardId: CARD_IDS[index], quality, durationMs: 3000 },
        });
        expect(res.statusCode).toBe(200);
      }

      const after = (await app.inject({ method: 'GET', url: '/api/stats/overview', headers: auth(user) })).json();

      // Beş kart REVIEW (0 hariç her puan), bir kart RELEARNING (Again); yeni kartlar 6 eksilir.
      expect(after.srsBreakdown.review).toBe(before.srsBreakdown.review + 5);
      expect(after.srsBreakdown.relearning).toBe(1);
      expect(after.srsBreakdown.new).toBe(before.srsBreakdown.new - 6);
      expect(after.srsBreakdown.learning).toBe(0);

      const todayKey = new Date().toISOString().slice(0, 10);
      const today = after.heatmap[89];
      expect(today.date).toBe(todayKey);
      expect(today).toMatchObject({ cardsReviewed: 6, intensity: 2, xpEarned: 48 });
      expect(after.heatmap.slice(0, 89).every((day: { cardsReviewed: number }) => day.cardsReviewed === 0)).toBe(true);

      expect(after.weeklyTrend.days[6]).toMatchObject({ date: todayKey, cardsReviewed: 6, accuracyPercent: 66.7 });
      expect(after.weeklyTrend.totalXp).toBe(48);
      expect(after.weeklyTrend.accuracyPercent).toBe(66.7);
      expect(after.retentionRate).toBe(66.7);
    });
  });
});
