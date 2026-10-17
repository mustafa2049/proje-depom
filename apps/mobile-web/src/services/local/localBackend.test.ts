import { TRANSLATION_BANK, VOCABULARY_DECKS } from '@proje-depom/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { ApiError } from '../api';
import { createMemoryStorage, type KeyValueStorage } from '../keyValueStorage';

import { createLocalBackend, DEFAULT_LOCAL_DECK_ID, type LocalBackend } from './localBackend';
import { createLocalDb } from './localDb';

/** Deterministik sözde rastgele üretici (mulberry32). */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TOTAL_SYSTEM_CARDS = VOCABULARY_DECKS.reduce((sum, deck) => sum + deck.cards.length, 0);

describe('yerel (sunucusuz) arka uç', () => {
  let storage: KeyValueStorage;
  let clock: Date;
  let backend: LocalBackend;

  function create(): LocalBackend {
    return createLocalBackend(createLocalDb(storage, 'test.db'), { now: () => clock, random: seeded(42) });
  }

  async function expectApiError(promise: Promise<unknown>, status: number): Promise<ApiError> {
    const error = await promise.then(
      () => null,
      (reason: unknown) => reason,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(status);
    return error as ApiError;
  }

  beforeEach(async () => {
    storage = createMemoryStorage();
    clock = new Date('2026-10-10T09:00:00.000Z');
    backend = create();
    await backend.ensureUser();
  });

  describe('profil', () => {
    it('ensureUser varsayılan profili bir kez oluşturur ve sonra aynısını döner', async () => {
      const first = await backend.endpoints.auth.me();
      expect(first.user).toMatchObject({ name: 'Öğrenci', currentLevel: 'A2', dailyGoalCards: 30, streakCount: 0 });
      expect((await backend.ensureUser()).id).toBe(first.user.id);
    });

    it('profil güncellemesi sunucuyla aynı doğrulama kurallarını uygular', async () => {
      const { user } = await backend.endpoints.auth.updateProfile({ name: '  Ayşe ', currentLevel: 'B1', dailyGoalCards: 15 });
      expect(user).toMatchObject({ name: 'Ayşe', currentLevel: 'B1', dailyGoalCards: 15 });

      await expectApiError(backend.endpoints.auth.updateProfile({ dailyGoalCards: 0 }), 400);
      await expectApiError(backend.endpoints.auth.updateProfile({ dailyGoalCards: 201 }), 400);
      await expectApiError(backend.endpoints.auth.updateProfile({}), 400);
    });

    it('e-posta ile giriş sunucusuz modda reddedilir', async () => {
      const error = await expectApiError(backend.endpoints.auth.login('a@b.c', 'x'), 400);
      expect(error.code).toBe('LOCAL_MODE');
    });
  });

  describe('desteler ve SRS', () => {
    it('gömülü altı sistem destesini 50\'şer kartla listeler', async () => {
      const { decks } = await backend.endpoints.decks.list();
      expect(decks).toHaveLength(6);
      expect(decks.every((deck) => deck.isSystem && deck.cardCount === 50)).toBe(true);
      expect(decks[0]).toMatchObject({ id: 'seed-deck-a1', level: 'A1', progress: { new: 50, learning: 0, review: 0 } });
    });

    it('günlük hedef kadar yeni kart verir; önce düşük seviye, sonra alfabetik', async () => {
      await backend.endpoints.auth.updateProfile({ dailyGoalCards: 5 });
      const queue = await backend.endpoints.srs.due({ limit: 30 });

      expect(queue.items).toHaveLength(5);
      expect(queue.items.every((item) => item.isNew && item.srs === null)).toBe(true);
      expect(queue.items.every((item) => item.card.deckId === 'seed-deck-a1')).toBe(true);
      const terms = queue.items.map((item) => item.card.term);
      expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b, 'en')));
      expect(queue.summary).toMatchObject({ dueTotal: 0, dailyGoal: 5, newIntroducedToday: 0, newRemainingToday: 5 });
    });

    it('değerlendirme SM-2 sonucunu kaydeder; Good kartı bugünden çıkar, Again kartı tekrar sorulur', async () => {
      await backend.endpoints.auth.updateProfile({ dailyGoalCards: 2 });
      const [first, second] = (await backend.endpoints.srs.due({ limit: 30 })).items;

      const good = await backend.endpoints.srs.review({ cardId: first!.card.id, quality: 2, durationMs: 4000 });
      expect(good).toMatchObject({ status: 'REVIEW', repetitions: 1, interval: 1, xpEarned: 10, streakCount: 1 });
      expect(good.nextReviewDate).toBe('2026-10-11T00:00:00.000Z');

      const again = await backend.endpoints.srs.review({ cardId: second!.card.id, quality: 0, durationMs: 2000 });
      expect(again).toMatchObject({ status: 'RELEARNING', xpEarned: 1 });

      const queue = await backend.endpoints.srs.due({ limit: 30 });
      expect(queue.items.map((item) => item.card.id)).toEqual([second!.card.id]);
      expect(queue.summary).toMatchObject({ dueTotal: 1, newIntroducedToday: 2, newRemainingToday: 0 });

      clock = new Date('2026-10-11T08:00:00.000Z');
      const nextDay = await backend.endpoints.srs.due({ limit: 30 });
      expect(nextDay.items.slice(0, 2).map((item) => item.card.id).sort()).toEqual([first!.card.id, second!.card.id].sort());
      expect(nextDay.items.filter((item) => item.isNew)).toHaveLength(2);
    });

    it('deste filtresi yalnızca o destenin kartlarını getirir', async () => {
      const queue = await backend.endpoints.srs.due({ limit: 10, deckId: 'seed-deck-tech' });
      expect(queue.items).toHaveLength(10);
      expect(queue.items.every((item) => item.card.deckId === 'seed-deck-tech')).toBe(true);
    });

    it('7 günden eski veya gelecekteki reviewedAt değerini, bilinmeyen kartı reddeder', async () => {
      await expectApiError(
        backend.endpoints.srs.review({ cardId: 'seed-card-book', quality: 2, durationMs: 0, reviewedAt: '2026-10-01T00:00:00.000Z' }),
        400,
      );
      await expectApiError(
        backend.endpoints.srs.review({ cardId: 'seed-card-book', quality: 2, durationMs: 0, reviewedAt: '2026-10-10T10:00:00.000Z' }),
        400,
      );
      await expectApiError(backend.endpoints.srs.review({ cardId: 'yok', quality: 2, durationMs: 0 }), 404);
    });

    it('çevrimdışı kaydedilen geçmiş tarihli değerlendirme o günün etkinliğine yazılır', async () => {
      await backend.endpoints.srs.review({ cardId: 'seed-card-book', quality: 3, durationMs: 1000, reviewedAt: '2026-10-09T20:00:00.000Z' });
      const stats = await backend.endpoints.stats.overview();
      expect(stats.heatmap.find((day) => day.date === '2026-10-09')).toMatchObject({ cardsReviewed: 1, xpEarned: 12 });
    });
  });

  describe('seri ve istatistikler', () => {
    it('ardışık günlerde seri artar, bir gün atlanınca 1\'e döner', async () => {
      expect((await backend.endpoints.srs.review({ cardId: 'seed-card-book', quality: 2, durationMs: 0 })).streakCount).toBe(1);
      clock = new Date('2026-10-11T09:00:00.000Z');
      expect((await backend.endpoints.srs.review({ cardId: 'seed-card-go', quality: 2, durationMs: 0 })).streakCount).toBe(2);
      clock = new Date('2026-10-13T09:00:00.000Z');
      expect((await backend.endpoints.srs.review({ cardId: 'seed-card-eat', quality: 2, durationMs: 0 })).streakCount).toBe(1);
    });

    it('özet, ısı haritası, haftalık trend ve tutma oranını hesaplar', async () => {
      await backend.endpoints.srs.review({ cardId: 'seed-card-book', quality: 2, durationMs: 3000 });
      await backend.endpoints.srs.review({ cardId: 'seed-card-go', quality: 0, durationMs: 3000 });
      await backend.endpoints.srs.review({ cardId: 'seed-card-eat', quality: 3, durationMs: 3000 });

      const stats = await backend.endpoints.stats.overview();
      expect(stats.heatmap).toHaveLength(90);
      expect(stats.heatmap.at(-1)).toMatchObject({ date: '2026-10-10', cardsReviewed: 3, correctCount: 2, xpEarned: 23, intensity: 1 });
      expect(stats.weeklyTrend.days).toHaveLength(7);
      expect(stats.weeklyTrend.totalXp).toBe(23);
      expect(stats.retentionRate).toBeCloseTo(66.7);
      expect(stats.totalXp).toBe(23);
      expect(stats.streakCount).toBe(1);
      expect(stats.srsBreakdown).toEqual({ new: TOTAL_SYSTEM_CARDS - 3, learning: 0, review: 2, relearning: 1 });
      expect(stats.learnedCards).toBe(2);
      expect(stats.trackedCards).toBe(3);
    });

    it('hiç çalışma yoksa tutma oranı null döner', async () => {
      const stats = await backend.endpoints.stats.overview();
      expect(stats.retentionRate).toBeNull();
      expect(stats.weeklyTrend.accuracyPercent).toBeNull();
    });
  });

  describe('kişisel kartlar', () => {
    const card = {
      term: 'serendipity',
      partOfSpeech: 'noun',
      translationTR: 'mutlu tesadüf',
      definitionEN: 'A pleasant surprise.',
      exampleSentence1: 'Meeting her was pure serendipity.',
      synonyms: ['luck'],
    };

    it('deste verilmezse "Kelimelerim" destesini oluşturur; aynı kelime ikinci kez eklenemez', async () => {
      const created = await backend.endpoints.cards.create(card);
      expect(created.deckId).toBe(DEFAULT_LOCAL_DECK_ID);
      expect(created.card).toMatchObject({ term: 'serendipity', exampleSentence2: null, phonetic: null });

      await expectApiError(backend.endpoints.cards.create({ ...card, term: 'SERENDIPITY' }), 409);

      const { decks } = await backend.endpoints.decks.list();
      expect(decks.at(-1)).toMatchObject({ id: DEFAULT_LOCAL_DECK_ID, title: 'Kelimelerim', isSystem: false, cardCount: 1 });
    });

    it('sistem destesine kart eklenemez, olmayan deste 404 döner, boş alan reddedilir', async () => {
      await expectApiError(backend.endpoints.cards.create({ ...card, deckId: 'seed-deck-a1' }), 403);
      await expectApiError(backend.endpoints.cards.create({ ...card, deckId: 'yok' }), 404);
      await expectApiError(backend.endpoints.cards.create({ ...card, term: '   ' }), 400);
    });

    it('kişisel kart çalışma kuyruğuna ve sözlüğe girer', async () => {
      const { card: created } = await backend.endpoints.cards.create(card);
      const queue = await backend.endpoints.srs.due({ limit: 5, deckId: DEFAULT_LOCAL_DECK_ID });
      expect(queue.items.map((item) => item.card.id)).toEqual([created.id]);

      const lookup = await backend.endpoints.reader.lookup('Serendipity!', 'It was serendipity.');
      expect(lookup).toMatchObject({ source: 'DECK', existingCardId: created.id });
    });
  });

  it('veriler uygulama yeniden açıldığında (yeni örnek) korunur', async () => {
    await backend.endpoints.srs.review({ cardId: 'seed-card-book', quality: 2, durationMs: 0 });
    await backend.endpoints.auth.updateProfile({ name: 'Kalıcı' });

    const reopened = create();
    expect((await reopened.endpoints.auth.me()).user.name).toBe('Kalıcı');
    const { decks } = await reopened.endpoints.decks.list();
    expect(decks[0]?.progress).toEqual({ new: 49, learning: 0, review: 1 });
  });

  describe('okuyucu', () => {
    it('parçaları seviyeye göre listeler ve tam metni döner', async () => {
      const all = await backend.endpoints.reader.passages();
      expect(all.passages.length).toBeGreaterThanOrEqual(6);
      const b1 = await backend.endpoints.reader.passages('B1');
      expect(b1.passages.every((passage) => passage.level === 'B1')).toBe(true);

      const { passage } = await backend.endpoints.reader.passage(all.passages[0]!.id);
      expect(passage.comprehensionQuestions).toHaveLength(3);
      await expectApiError(backend.endpoints.reader.passage('yok'), 404);
    });

    it('sözlük: kart kelimesi, çekimli hâli, okuma parçası kelimesi ve bulunamayan kelime', async () => {
      expect(await backend.endpoints.reader.lookup('book', 'A good book.')).toMatchObject({ source: 'DECK', existingCardId: 'seed-card-book' });
      expect(await backend.endpoints.reader.lookup('Books,', 'I like books.')).toMatchObject({ source: 'DECK', word: 'books', translationTR: 'kitap' });
      expect(await backend.endpoints.reader.lookup('decided', 'She decided.')).toMatchObject({ source: 'DECK', existingCardId: 'seed-card-decide' });

      const { passage } = await backend.endpoints.reader.passage((await backend.endpoints.reader.passages()).passages[0]!.id);
      const keyword = passage.keyVocabulary.find(
        (item) => !VOCABULARY_DECKS.some((deck) => deck.cards.some((card) => card.term.toLowerCase() === item.term.toLowerCase())),
      );
      expect(keyword).toBeDefined();
      expect(await backend.endpoints.reader.lookup(keyword!.term, 'context')).toMatchObject({ source: 'OFFLINE', translationTR: keyword!.translationTR });

      expect(await backend.endpoints.reader.lookup('wake', "Every day I wake up at seven o'clock.")).toMatchObject({
        source: 'OFFLINE',
        word: 'wake up',
        translationTR: 'uyanmak',
      });
      expect(await backend.endpoints.reader.lookup('look', 'My grandmother will look after the children.')).toMatchObject({
        source: 'DECK',
        word: 'look after',
        existingCardId: 'seed-card-look-after',
      });

      await expectApiError(backend.endpoints.reader.lookup('zzzqqq', ''), 404);
      await expectApiError(backend.endpoints.reader.lookup('  !!  ', ''), 400);
    });
  });

  describe('alıştırmalar', () => {
    it('seviye verilmezse kullanıcının seviyesinde, üç tipten dengeli soru üretir', async () => {
      const result = await backend.endpoints.practice.exercises({ count: 9 });
      expect(result.level).toBe('A2');
      expect(result.exercises).toHaveLength(9);
      for (const type of ['WORD_ORDER', 'CLOZE', 'TRANSLATION'] as const) {
        expect(result.exercises.filter((exercise) => exercise.type === type)).toHaveLength(3);
      }
      const cardCloze = result.exercises.filter((exercise) => exercise.type === 'CLOZE' && exercise.source === 'CARD');
      expect(cardCloze.length).toBeGreaterThan(0);
    });

    it('istenen seviyeyi ve sayı sınırlarını uygular', async () => {
      const result = await backend.endpoints.practice.exercises({ level: 'B2', count: 100 });
      expect(result.level).toBe('B2');
      expect(result.exercises.length).toBeLessThanOrEqual(30);
    });
  });

  describe('eğitmen (AI Tutor)', () => {
    it('ilk mesaj yeni oturum açar, sonraki mesajlar aynı oturuma eklenir', async () => {
      const first = await backend.endpoints.ai.chat({ scenario: 'job-interview', message: 'i want this job' });
      expect(first.userMessage).toMatchObject({ sender: 'USER', content: 'i want this job', correctedContent: 'I want this job.' });
      expect(first.aiMessage.sender).toBe('AI');
      expect(first.aiMessage.replyTranslationTR).toBeTruthy();
      expect(Array.isArray(first.aiMessage.extractedVocabulary)).toBe(true);

      const second = await backend.endpoints.ai.chat({ sessionId: first.sessionId, scenario: 'job-interview', message: 'I have experience in sales.' });
      expect(second.sessionId).toBe(first.sessionId);
      expect(second.userMessage.correctedContent).toBeNull();
      expect(second.aiMessage.content).not.toBe(first.aiMessage.content);

      const { sessions } = await backend.endpoints.ai.sessions();
      expect(sessions).toEqual([expect.objectContaining({ id: first.sessionId, scenario: 'Job Interview', messageCount: 4 })]);

      const { session } = await backend.endpoints.ai.session(first.sessionId);
      expect(session.messages.map((message) => message.sender)).toEqual(['USER', 'AI', 'USER', 'AI']);
    });

    it('bilinmeyen oturum ve boş mesaj reddedilir', async () => {
      await expectApiError(backend.endpoints.ai.chat({ sessionId: 'yok', scenario: 'free-talk', message: 'Hi.' }), 404);
      await expectApiError(backend.endpoints.ai.chat({ scenario: 'free-talk', message: '   ' }), 400);
      await expectApiError(backend.endpoints.ai.session('yok'), 404);
    });

    it('çeviri değerlendirmesi hazır havuzdaki referans çeviriyle karşılaştırır', async () => {
      const item = TRANSLATION_BANK[0]!;
      const exact = await backend.endpoints.ai.analyzeSentence({ sentence: item.referenceEN, sourceTR: item.sourceTR });
      expect(exact.provider).toBe('local');
      expect(exact.analysis).toMatchObject({ isCorrect: true, nativeAlternative: item.referenceEN });

      const wrong = await backend.endpoints.ai.analyzeSentence({ sentence: 'banana', sourceTR: item.sourceTR });
      expect(wrong.analysis.isCorrect).toBe(false);
      expect(wrong.analysis.score).toBeLessThan(50);
    });
  });

  it('profil yoksa korumalı uç noktalar 401 döner', async () => {
    const fresh = createLocalBackend(createLocalDb(createMemoryStorage(), 'empty'), { now: () => clock });
    await expectApiError(fresh.endpoints.auth.me(), 401);
    await expectApiError(fresh.endpoints.decks.list(), 401);
  });
});
