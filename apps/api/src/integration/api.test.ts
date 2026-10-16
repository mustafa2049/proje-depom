import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../app';
import { createPrismaClient } from '../lib/prisma';
import { createLlmProvider } from '../services/llmService';

/**
 * Uçtan uca entegrasyon testleri: gerçek PostgreSQL (TEST_DATABASE_URL) ve mock LLM sağlayıcısı
 * ile `fastify.inject()` üzerinden çalışır. TEST_DATABASE_URL tanımlı değilse atlanır.
 */
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

const SYSTEM_DECK_ID = 'it-deck-system';
const SYSTEM_CARD_IDS = ['it-card-1', 'it-card-2', 'it-card-3', 'it-card-4', 'it-card-5'];

const PASSWORD = 'strong-password-123';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

interface TestUser {
  email: string;
  accessToken: string;
  refreshToken: string;
  id: string;
}

describe.skipIf(!TEST_DATABASE_URL)('Phase 2 API (entegrasyon)', () => {
  let db: PrismaClient;
  let app: FastifyInstance;

  beforeAll(async () => {
    db = createPrismaClient(TEST_DATABASE_URL as string);
    app = await buildApp({
      db,
      llm: createLlmProvider({ AI_PROVIDER: 'mock', OPENAI_MODEL: 'x', GEMINI_MODEL: 'x' }),
      jwtSecret: 'integration-test-secret-that-is-long-enough',
      accessTokenTtlSec: 900,
      refreshTokenTtlSec: 3600,
      corsOrigins: ['http://localhost:8081'],
      rateLimitEnabled: false,
    });
    await app.ready();

    await db.deck.upsert({
      where: { id: SYSTEM_DECK_ID },
      create: { id: SYSTEM_DECK_ID, title: 'Integration Deck', level: 'A1', isSystem: true },
      update: {},
    });
    for (const [index, id] of SYSTEM_CARD_IDS.entries()) {
      await db.card.upsert({
        where: { id },
        create: {
          id,
          deckId: SYSTEM_DECK_ID,
          term: `word-${index + 1}`,
          partOfSpeech: 'noun',
          translationTR: `kelime-${index + 1}`,
          definitionEN: 'Test definition.',
          exampleSentence1: 'This is a test.',
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

  async function registerUser(overrides: { currentLevel?: string } = {}): Promise<TestUser> {
    const email = `user-${crypto.randomUUID()}@test.dev`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email, password: PASSWORD, name: 'Test User', ...overrides },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    return { email, accessToken: body.accessToken, refreshToken: body.refreshToken, id: body.user.id };
  }

  function authHeader(user: TestUser) {
    return { authorization: `Bearer ${user.accessToken}` };
  }

  describe('kimlik doğrulama', () => {
    it('kayıt sonrası token ve kullanıcı profili döner', async () => {
      const user = await registerUser({ currentLevel: 'B1' });
      const me = await app.inject({ method: 'GET', url: '/api/auth/me', headers: authHeader(user) });

      expect(me.statusCode).toBe(200);
      expect(me.json().user).toMatchObject({
        email: user.email,
        currentLevel: 'B1',
        streakCount: 0,
        dailyGoalCards: 30,
      });
    });

    it('aynı e-posta ile ikinci kayıt 409 döner', async () => {
      const user = await registerUser();
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: user.email.toUpperCase(), password: PASSWORD, name: 'Again' },
      });
      expect(res.statusCode).toBe(409);
    });

    it('geçersiz kayıt girdisi 400 VALIDATION_ERROR döner', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: 'not-an-email', password: 'short', name: '' },
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe('VALIDATION_ERROR');
    });

    it('yanlış şifre 401 döner, doğru şifre ile giriş yapılabilir', async () => {
      const user = await registerUser();

      const wrong = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: user.email, password: 'wrong-password' },
      });
      expect(wrong.statusCode).toBe(401);

      const right = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: user.email, password: PASSWORD },
      });
      expect(right.statusCode).toBe(200);
      expect(right.json().accessToken).toBeTypeOf('string');
    });

    it('token olmadan korumalı uç nokta 401 döner', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/srs/due' });
      expect(res.statusCode).toBe(401);
    });

    it('refresh token access olarak kullanılamaz, refresh ile yeni token alınır', async () => {
      const user = await registerUser();

      const asAccess = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: { authorization: `Bearer ${user.refreshToken}` },
      });
      expect(asAccess.statusCode).toBe(401);

      const refreshed = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        payload: { refreshToken: user.refreshToken },
      });
      expect(refreshed.statusCode).toBe(200);

      const me = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: { authorization: `Bearer ${refreshed.json().accessToken}` },
      });
      expect(me.statusCode).toBe(200);
    });
  });

  describe('desteler ve kartlar', () => {
    it('sistem destesini ilerleme özetiyle listeler', async () => {
      const user = await registerUser();
      const res = await app.inject({ method: 'GET', url: '/api/decks', headers: authHeader(user) });

      expect(res.statusCode).toBe(200);
      const deck = res.json().decks.find((item: { id: string }) => item.id === SYSTEM_DECK_ID);
      expect(deck).toMatchObject({ isSystem: true, cardCount: 5 });
      expect(deck.progress.new).toBe(5);
    });

    it('deste kartlarını kullanıcının SRS durumuyla döner', async () => {
      const user = await registerUser();
      const res = await app.inject({
        method: 'GET',
        url: `/api/decks/${SYSTEM_DECK_ID}/cards`,
        headers: authHeader(user),
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().total).toBe(5);
      expect(res.json().items[0].srs).toBeNull();
    });

    it('kullanıcı başkasının özel destesini göremez (404)', async () => {
      const owner = await registerUser();
      const created = await app.inject({
        method: 'POST',
        url: '/api/cards',
        headers: authHeader(owner),
        payload: {
          term: `secret-${crypto.randomUUID()}`,
          partOfSpeech: 'noun',
          translationTR: 'gizli',
          definitionEN: 'Private.',
          exampleSentence1: 'Private card.',
        },
      });
      expect(created.statusCode).toBe(201);

      const other = await registerUser();
      const res = await app.inject({
        method: 'GET',
        url: `/api/decks/${created.json().deckId}/cards`,
        headers: authHeader(other),
      });
      expect(res.statusCode).toBe(404);
    });

    it('özel kart eklenir, aynı kelime tekrar eklenemez, sistem destesine eklenemez', async () => {
      const user = await registerUser();
      const term = `Apple-${crypto.randomUUID().slice(0, 8)}`;
      const payload = {
        term,
        partOfSpeech: 'noun',
        translationTR: 'elma',
        definitionEN: 'A round fruit.',
        exampleSentence1: 'I ate an apple.',
        synonyms: ['fruit'],
      };

      const first = await app.inject({ method: 'POST', url: '/api/cards', headers: authHeader(user), payload });
      expect(first.statusCode).toBe(201);

      const duplicate = await app.inject({
        method: 'POST',
        url: '/api/cards',
        headers: authHeader(user),
        payload: { ...payload, term: term.toLowerCase() },
      });
      expect(duplicate.statusCode).toBe(409);

      const forbidden = await app.inject({
        method: 'POST',
        url: '/api/cards',
        headers: authHeader(user),
        payload: { ...payload, term: 'other', deckId: SYSTEM_DECK_ID },
      });
      expect(forbidden.statusCode).toBe(403);
    });
  });

  describe('SRS kuyruğu ve değerlendirme', () => {
    it('yeni kartları kuyrukta döner ve dailyGoal kotasını bildirir', async () => {
      const user = await registerUser();
      const res = await app.inject({
        method: 'GET',
        url: `/api/srs/due?limit=3&deckId=${SYSTEM_DECK_ID}`,
        headers: authHeader(user),
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.items).toHaveLength(3);
      expect(body.items.every((item: { isNew: boolean }) => item.isNew)).toBe(true);
      expect(body.summary).toMatchObject({ dailyGoal: 30, newRemainingToday: 30, newIntroducedToday: 0 });
    });

    it('değerlendirme SM-2 sonucunu, XP\'yi ve seriyi kaydeder', async () => {
      const user = await registerUser();
      const cardId = SYSTEM_CARD_IDS[0] as string;

      const res = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId, quality: 2, durationMs: 4200 },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({
        cardId,
        status: 'REVIEW',
        repetitions: 1,
        interval: 1,
        xpEarned: 10,
        streakCount: 1,
      });
      expect(new Date(res.json().nextReviewDate).getTime()).toBeGreaterThan(Date.now());

      const session = await db.studySession.findFirst({ where: { userId: user.id } });
      expect(session).toMatchObject({ cardsReviewed: 1, correctCount: 1, durationSec: 4 });
    });

    it('değerlendirilen kart aynı gün tekrar kuyruğa girmez, yeni kartlar listesinden çıkar', async () => {
      const user = await registerUser();
      const cardId = SYSTEM_CARD_IDS[1] as string;
      await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId, quality: 2 },
      });

      const res = await app.inject({
        method: 'GET',
        url: `/api/srs/due?limit=20&deckId=${SYSTEM_DECK_ID}`,
        headers: authHeader(user),
      });
      const ids = res.json().items.map((item: { card: { id: string } }) => item.card.id);
      expect(ids).not.toContain(cardId);
    });

    it('vadesi gelmiş tekrar kartları yeni kartlardan önce gelir', async () => {
      const user = await registerUser();
      const cardId = SYSTEM_CARD_IDS[2] as string;
      await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId, quality: 3 },
      });
      await db.userCardSRS.updateMany({
        where: { userId: user.id, cardId },
        data: { nextReviewDate: new Date(Date.now() - HOUR_MS) },
      });

      const res = await app.inject({
        method: 'GET',
        url: `/api/srs/due?limit=5&deckId=${SYSTEM_DECK_ID}`,
        headers: authHeader(user),
      });
      const first = res.json().items[0];
      expect(first.card.id).toBe(cardId);
      expect(first.isNew).toBe(false);
      expect(first.srs.status).toBe('REVIEW');
    });

    it('Again başarısız kartı RELEARNING yapar ve 10 dakika sonrasına koyar', async () => {
      const user = await registerUser();
      const cardId = SYSTEM_CARD_IDS[3] as string;

      const res = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId, quality: 0 },
      });

      expect(res.json()).toMatchObject({ status: 'RELEARNING', repetitions: 0, interval: 1 });
      const delayMs = new Date(res.json().nextReviewDate).getTime() - Date.now();
      expect(delayMs).toBeGreaterThan(9 * 60 * 1000);
      expect(delayMs).toBeLessThanOrEqual(10 * 60 * 1000);
    });

    it('geçersiz puan 400, bilinmeyen kart 404 döner', async () => {
      const user = await registerUser();

      const invalid = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId: SYSTEM_CARD_IDS[0], quality: 5 },
      });
      expect(invalid.statusCode).toBe(400);

      const missing = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId: 'does-not-exist', quality: 2 },
      });
      expect(missing.statusCode).toBe(404);
    });

    it('günlük yeni kart kotası dolunca yeni kart kuyruğa girmez', async () => {
      const user = await registerUser();
      await db.user.update({ where: { id: user.id }, data: { dailyGoalCards: 2 } });

      for (const cardId of [SYSTEM_CARD_IDS[0], SYSTEM_CARD_IDS[1]] as string[]) {
        await app.inject({
          method: 'POST',
          url: '/api/srs/review',
          headers: authHeader(user),
          payload: { cardId, quality: 2 },
        });
      }

      const res = await app.inject({
        method: 'GET',
        url: `/api/srs/due?limit=20&deckId=${SYSTEM_DECK_ID}`,
        headers: authHeader(user),
      });
      expect(res.json().summary).toMatchObject({ newIntroducedToday: 2, newRemainingToday: 0 });
      expect(res.json().items.filter((item: { isNew: boolean }) => item.isNew)).toHaveLength(0);
    });
    it('reviewedAt geçmiş bir zamanı kullanır (çevrimdışı tekrar), aşırı eski değeri reddeder', async () => {
      const user = await registerUser();
      const cardId = SYSTEM_CARD_IDS[0] as string;
      const reviewedAt = new Date(Date.now() - 2 * DAY_MS).toISOString();

      const ok = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId, quality: 2, reviewedAt },
      });
      expect(ok.statusCode).toBe(200);

      const record = await db.userCardSRS.findFirst({ where: { userId: user.id, cardId } });
      expect(record?.lastReviewedAt?.toISOString()).toBe(reviewedAt);
      // Aralık 1 gün ve gerçek yapılma gününden hesaplanır: yarın değil, 1 gün sonrası (2 gün önceki + 1 → dün)
      expect(record?.nextReviewDate.getTime()).toBeLessThan(Date.now());

      const tooOld = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId: SYSTEM_CARD_IDS[1], quality: 2, reviewedAt: new Date(Date.now() - 30 * DAY_MS).toISOString() },
      });
      expect(tooOld.statusCode).toBe(400);
    });

    it('kayıtta günlük hedef kart sayısı seçilebilir', async () => {
      const email = `goal-${crypto.randomUUID()}@test.dev`;
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email, password: PASSWORD, name: 'Goal', currentLevel: 'B2', dailyGoalCards: 50 },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json().user).toMatchObject({ currentLevel: 'B2', dailyGoalCards: 50 });
    });
  });

  describe('seri (streak) kuralları', () => {
    it('dün çalışılmışsa seri 1 artar', async () => {
      const user = await registerUser();
      await db.user.update({
        where: { id: user.id },
        data: { streakCount: 4, lastStudyDate: new Date(Date.now() - DAY_MS) },
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId: SYSTEM_CARD_IDS[4], quality: 2 },
      });
      expect(res.json().streakCount).toBe(5);
    });

    it('bugün zaten çalışılmışsa seri korunur', async () => {
      const user = await registerUser();
      await db.user.update({
        where: { id: user.id },
        data: { streakCount: 7, lastStudyDate: new Date() },
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId: SYSTEM_CARD_IDS[4], quality: 2 },
      });
      expect(res.json().streakCount).toBe(7);
    });

    it('1 günden fazla ara verilmişse seri 1 olur', async () => {
      const user = await registerUser();
      await db.user.update({
        where: { id: user.id },
        data: { streakCount: 9, lastStudyDate: new Date(Date.now() - 3 * DAY_MS) },
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId: SYSTEM_CARD_IDS[4], quality: 2 },
      });
      expect(res.json().streakCount).toBe(1);
    });
  });

  describe('yapay zeka sohbeti ve cümle analizi', () => {
    it('yeni oturum açar, düzeltmeyi ve AI yanıtını kaydeder', async () => {
      const user = await registerUser({ currentLevel: 'A2' });
      const res = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        headers: authHeader(user),
        payload: { scenario: 'cafe-order', message: 'i want a coffee' },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.sessionId).toBeTypeOf('string');
      expect(body.userMessage).toMatchObject({ sender: 'USER', correctedContent: 'I want a coffee.' });
      expect(body.aiMessage.sender).toBe('AI');
      expect(body.aiMessage.replyTranslationTR).toBeTypeOf('string');
      expect(Array.isArray(body.aiMessage.extractedVocabulary)).toBe(true);
    });

    it('doğru cümlede düzeltme alanı null döner', async () => {
      const user = await registerUser();
      const res = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        headers: authHeader(user),
        payload: { message: 'I like music.' },
      });
      expect(res.json().userMessage.correctedContent).toBeNull();
    });

    it('aynı oturumda devam eder, geçmiş sıralı döner, başkasının oturumu 404 olur', async () => {
      const owner = await registerUser();
      const first = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        headers: authHeader(owner),
        payload: { scenario: 'job-interview', message: 'hello there' },
      });
      const sessionId = first.json().sessionId;

      const second = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        headers: authHeader(owner),
        payload: { sessionId, message: 'I have five years experience.' },
      });
      expect(second.json().sessionId).toBe(sessionId);

      const session = await app.inject({
        method: 'GET',
        url: `/api/ai/sessions/${sessionId}`,
        headers: authHeader(owner),
      });
      const senders = session.json().session.messages.map((message: { sender: string }) => message.sender);
      expect(senders).toEqual(['USER', 'AI', 'USER', 'AI']);
      expect(session.json().session.scenario).toBe('Job Interview');

      const other = await registerUser();
      const forbidden = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        headers: authHeader(other),
        payload: { sessionId, message: 'sneaky' },
      });
      expect(forbidden.statusCode).toBe(404);

      const list = await app.inject({ method: 'GET', url: '/api/ai/sessions', headers: authHeader(owner) });
      expect(list.json().sessions[0]).toMatchObject({ id: sessionId, messageCount: 4 });
    });

    it('boş mesaj ve bilinmeyen senaryo 400 döner', async () => {
      const user = await registerUser();
      const empty = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        headers: authHeader(user),
        payload: { message: '   ' },
      });
      expect(empty.statusCode).toBe(400);

      const unknown = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        headers: authHeader(user),
        payload: { scenario: 'space-station', message: 'hi' },
      });
      expect(unknown.statusCode).toBe(400);
    });

    it('cümle analizi analiz şemasına uygun sonuç döner', async () => {
      const user = await registerUser();
      const res = await app.inject({
        method: 'POST',
        url: '/api/ai/analyze-sentence',
        headers: authHeader(user),
        payload: { sentence: 'i go to school yesterday', sourceTR: 'Dün okula gittim' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().analysis).toMatchObject({ isCorrect: false });
      expect(res.json().analysis.correctedSentence).toBe('I go to school yesterday.');
      expect(res.json().analysis.score).toBeTypeOf('number');
    });
  });

  describe('istatistikler', () => {
    it('doğruluk oranı, öğrenilen kart sayısı ve ısı haritası döner', async () => {
      const user = await registerUser();
      await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId: SYSTEM_CARD_IDS[0], quality: 0 },
      });
      await app.inject({
        method: 'POST',
        url: '/api/srs/review',
        headers: authHeader(user),
        payload: { cardId: SYSTEM_CARD_IDS[1], quality: 3 },
      });

      const res = await app.inject({ method: 'GET', url: '/api/stats/overview', headers: authHeader(user) });
      expect(res.statusCode).toBe(200);

      const body = res.json();
      expect(body.retentionRate).toBe(50);
      expect(body.trackedCards).toBe(2);
      expect(body.heatmap).toHaveLength(30);
      expect(body.heatmap[29].cardsReviewed).toBe(2);
      expect(body.totalXp).toBe(13);
    });
  });
});
