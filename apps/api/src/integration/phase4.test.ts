import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../app';
import { createPrismaClient } from '../lib/prisma';
import { createLlmProvider } from '../services/llmService';

/** Faz 4 uç noktaları (okuyucu, sözlük, alıştırmalar) — gerçek PostgreSQL ve mock LLM ile. */
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const PASSWORD = 'strong-password-123';

interface TestUser {
  id: string;
  accessToken: string;
}

describe.skipIf(!TEST_DATABASE_URL)('Faz 4 API (entegrasyon)', () => {
  let db: PrismaClient;
  let app: FastifyInstance;
  let owner: TestUser;
  const SYSTEM_DECK_ID = 'p4-deck-system';

  beforeAll(async () => {
    db = createPrismaClient(TEST_DATABASE_URL as string);
    app = await buildApp({
      db,
      llm: createLlmProvider({ AI_PROVIDER: 'mock', OPENAI_MODEL: 'x', GEMINI_MODEL: 'x' }),
      jwtSecret: 'phase4-integration-secret-that-is-long-enough',
      accessTokenTtlSec: 900,
      refreshTokenTtlSec: 3600,
      corsOrigins: ['http://localhost:8081'],
      rateLimitEnabled: false,
    });
    await app.ready();

    await db.deck.upsert({
      where: { id: SYSTEM_DECK_ID },
      create: { id: SYSTEM_DECK_ID, title: 'Phase 4 Deck', level: 'B1', isSystem: true },
      update: {},
    });
    await db.card.upsert({
      where: { id: 'p4-card-system-umbrella' },
      create: {
        id: 'p4-card-system-umbrella',
        deckId: SYSTEM_DECK_ID,
        term: 'Umbrella',
        partOfSpeech: 'noun',
        translationTR: 'şemsiye',
        definitionEN: 'A device used to protect yourself from rain.',
        exampleSentence1: 'She opened her umbrella.',
        synonyms: ['parasol'],
      },
      update: {},
    });

    owner = await registerUser('B1');
  });

  afterAll(async () => {
    await app?.close();
    await db?.$disconnect();
  });

  async function registerUser(level: string): Promise<TestUser> {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: `p4-${crypto.randomUUID()}@test.dev`,
        password: PASSWORD,
        name: 'Phase Four',
        currentLevel: level,
      },
    });
    expect(res.statusCode).toBe(201);
    return { id: res.json().user.id, accessToken: res.json().accessToken };
  }

  const auth = (user: TestUser) => ({ authorization: `Bearer ${user.accessToken}` });

  describe('okuma kütüphanesi', () => {
    it('parçaları içeriksiz özet olarak listeler, seviye filtresi uygular', async () => {
      const all = await app.inject({ method: 'GET', url: '/api/reader/passages', headers: auth(owner) });
      expect(all.statusCode).toBe(200);
      expect(all.json().passages.length).toBeGreaterThanOrEqual(6);
      expect(all.json().passages[0]).not.toHaveProperty('content');

      const b1 = await app.inject({ method: 'GET', url: '/api/reader/passages?level=B1', headers: auth(owner) });
      expect(b1.json().passages.every((passage: { level: string }) => passage.level === 'B1')).toBe(true);
    });

    it('tek parçayı içerik, anahtar kelimeler ve sorularla döner', async () => {
      const list = await app.inject({ method: 'GET', url: '/api/reader/passages', headers: auth(owner) });
      const id = list.json().passages[0].id as string;

      const res = await app.inject({ method: 'GET', url: `/api/reader/passages/${id}`, headers: auth(owner) });
      expect(res.statusCode).toBe(200);
      const passage = res.json().passage;
      expect(passage.content.length).toBeGreaterThan(100);
      expect(passage.keyVocabulary.length).toBeGreaterThan(0);
      expect(passage.comprehensionQuestions).toHaveLength(3);
    });

    it('geçersiz seviye 400, bilinmeyen parça 404 döner', async () => {
      const badLevel = await app.inject({ method: 'GET', url: '/api/reader/passages?level=Z9', headers: auth(owner) });
      expect(badLevel.statusCode).toBe(400);

      const missing = await app.inject({ method: 'GET', url: '/api/reader/passages/nope', headers: auth(owner) });
      expect(missing.statusCode).toBe(404);
    });
  });

  describe('bağlamsal sözlük', () => {
    it('kullanıcının erişebildiği bir kart varsa DECK kaynağıyla döner', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/reader/lookup',
        headers: auth(owner),
        payload: { word: ' Umbrella, ', contextSentence: 'She forgot her umbrella at home.' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({
        source: 'DECK',
        word: 'umbrella',
        translationTR: 'şemsiye',
        existingCardId: 'p4-card-system-umbrella',
      });
    });

    it('kart yoksa LLM ile bağlamsal çözümleme yapar (AI kaynağı, existingCardId null)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/reader/lookup',
        headers: auth(owner),
        payload: { word: 'bank', contextSentence: 'He walked along the river bank.' },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.source).toBe('AI');
      expect(body.existingCardId).toBeNull();
      expect(body.translationTR).toBeTypeOf('string');
      expect(body.definitionEN).toBeTypeOf('string');
      expect(Array.isArray(body.synonyms)).toBe(true);
    });

    it('yalnızca noktalamadan oluşan kelime 400, eksik gövde 400 döner', async () => {
      const punct = await app.inject({
        method: 'POST',
        url: '/api/reader/lookup',
        headers: auth(owner),
        payload: { word: '...', contextSentence: 'Wait...' },
      });
      expect(punct.statusCode).toBe(400);

      const missing = await app.inject({
        method: 'POST',
        url: '/api/reader/lookup',
        headers: auth(owner),
        payload: { word: 'x' },
      });
      expect(missing.statusCode).toBe(400);
    });

    it('oturum yoksa 401 döner', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/reader/lookup',
        payload: { word: 'x', contextSentence: 'y' },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('alıştırma üretici', () => {
    it('üç tipten dengeli, istenen sayıda soru döner', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/practice/exercises?level=B1&count=9',
        headers: auth(owner),
      });

      expect(res.statusCode).toBe(200);
      const { exercises, level } = res.json();
      expect(level).toBe('B1');
      expect(exercises).toHaveLength(9);
      const counts = (type: string) => exercises.filter((item: { type: string }) => item.type === type).length;
      expect([counts('WORD_ORDER'), counts('CLOZE'), counts('TRANSLATION')]).toEqual([3, 3, 3]);
    });

    it('kelime sıralama sorusu, karışık kelimelerin doğru cümlenin kelimeleriyle aynı olduğunu garanti eder', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/practice/exercises?level=A2&count=6',
        headers: auth(owner),
      });
      const wordOrder = res.json().exercises.filter((item: { type: string }) => item.type === 'WORD_ORDER');
      expect(wordOrder.length).toBeGreaterThan(0);

      for (const item of wordOrder) {
        expect([...item.words].sort()).toEqual([...item.answer.split(' ')].sort());
        expect(item.words.join(' ')).not.toBe(item.answer);
      }
    });

    it('boşluk doldurma sorularında doğru şık, seçenekler arasında yer alır', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/practice/exercises?level=B2&count=6',
        headers: auth(owner),
      });
      const cloze = res.json().exercises.filter((item: { type: string }) => item.type === 'CLOZE');

      for (const item of cloze) {
        expect(item.options).toHaveLength(4);
        expect(item.sentence).toContain('___');
        expect(item.options[item.answerIndex]).toBeTypeOf('string');
      }
    });

    it('kullanıcının kendi kartlarından boşluk doldurma sorusu üretir', async () => {
      const learner = await registerUser('B1');
      const terms = [
        ['Cabinet', 'A piece of furniture with shelves.', 'noun'],
        ['Blanket', 'She pulled the blanket over her legs.', 'noun'],
        ['Carpet', 'The carpet was soft under our feet.', 'noun'],
        ['Curtain', 'He opened the curtain to see the sun.', 'noun'],
      ] as const;

      for (const [term, example, partOfSpeech] of terms) {
        const created = await app.inject({
          method: 'POST',
          url: '/api/cards',
          headers: auth(learner),
          payload: {
            term,
            partOfSpeech,
            translationTR: term.toLowerCase(),
            definitionEN: `A ${term.toLowerCase()} in a room.`,
            exampleSentence1: example,
            synonyms: [],
          },
        });
        expect(created.statusCode).toBe(201);
      }

      const res = await app.inject({
        method: 'GET',
        url: '/api/practice/exercises?level=B1&count=9',
        headers: auth(learner),
      });
      const cardCloze = res
        .json()
        .exercises.filter((item: { type: string; source?: string }) => item.type === 'CLOZE' && item.source === 'CARD');

      expect(cardCloze.length).toBeGreaterThan(0);
      // Test veritabanı E2E ile paylaşılır ve seed kartları da B1 havuzuna girebilir; bu yüzden
      // kullanıcının kendi kelimelerinden en az birinin soruda kullanıldığını doğrularız.
      const learnerTerms = ['Cabinet', 'Blanket', 'Carpet', 'Curtain'];
      expect(cardCloze.every((item: { sentence: string }) => item.sentence.includes('___'))).toBe(true);
      expect(cardCloze.some((item: { options: string[]; answerIndex: number }) => learnerTerms.includes(item.options[item.answerIndex] ?? ''))).toBe(true);
    });

    it('geçersiz sayı için 400 döner', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/practice/exercises?count=1',
        headers: auth(owner),
      });
      expect(res.statusCode).toBe(400);
    });
  });
});
