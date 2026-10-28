import { describe, expect, it } from 'vitest';
import { SEED_WORDS } from '../data/words';
import { DECKS } from '../data/decks';
import { splitByTerm } from '../lib/text';
import { dayIndex, dayKey } from '../lib/leitner';
import { activityCalendar, activityLevel, allWords, boxCounts, coachStats, dailyPlan, leeches, reviewForecast, wordMap } from '../store/selectors';
import { createInitialState, migrate, reducer } from '../store/state';

const now = new Date(2026, 9, 27, 10, 0).getTime();

describe('tohum sözlük', () => {
  it('kimlikler benzersiz ve tüm kelimelerde anlam + örnek var', () => {
    const ids = SEED_WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of SEED_WORDS) {
      expect(w.meaning.length, w.id).toBeGreaterThan(0);
      expect(w.examples.length, w.id).toBeGreaterThan(0);
      expect(w.ipa.startsWith('/') && w.ipa.endsWith('/'), w.id).toBe(true);
      expect(DECKS.some((d) => d.id === w.deckId), w.id).toBe(true);
    }
  });
  it('her kelimenin ilk örnek cümlesi kelimenin kendisini içerir (quiz için)', () => {
    const missing = SEED_WORDS.filter((w) => !splitByTerm(w.examples[0].en, w.word).some((p) => p.match)).map((w) => w.id);
    expect(missing).toEqual([]);
  });
  it('her örnek cümlenin Türkçe çevirisi var', () => {
    expect(SEED_WORDS.filter((w) => !w.examples[0].tr).map((w) => w.id)).toEqual([]);
  });
});

describe('reducer', () => {
  it('tekrar sonrası kartı, geçmişi ve XP’yi günceller', () => {
    let s = createInitialState(now);
    s = reducer(s, { type: 'review', wordId: 'inevitable', outcome: 'know', now });
    expect(s.cards.inevitable.box).toBe(2);
    expect(s.history[dayKey(now)].reviews).toBe(1);
    expect(s.history[dayKey(now)].newWords).toBe(1);
    expect(s.profile.xp).toBe(5);
  });

  it('kendi kelimesini ekler ve seçilen kutuya göre vade belirler', () => {
    let s = createInitialState(now);
    s = reducer(s, {
      type: 'addWord',
      box: 3,
      now,
      word: { id: 'quokka', word: 'quokka', ipa: '', pos: 'noun', cefr: 'C1', meaning: 'Bir keseli türü', examples: [], deckId: 'personal' },
    });
    expect(s.customWords[0].custom).toBe(true);
    expect(s.cards.quokka.box).toBe(3);
    expect(s.cards.quokka.dueDay).toBe(dayIndex(now) + 5);
    expect(wordMap(s).quokka.meaning).toBe('Bir keseli türü');
  });

  it('tohum kelimeyi düzenlemek onu silinebilir yapmaz', () => {
    let s = createInitialState(now);
    const seed = SEED_WORDS[0];
    s = reducer(s, { type: 'updateWord', word: { ...seed, mnemonic: 'yeni ipucu' } });
    expect(s.customWords[0].custom).toBe(false);
    expect(allWords(s).filter((w) => w.id === seed.id)).toHaveLength(1);
    expect(wordMap(s)[seed.id].mnemonic).toBe('yeni ipucu');
  });

  it('inatçı kelime kurtarılınca Kutu 2’ye gider', () => {
    let s = createInitialState(now);
    for (let i = 0; i < 4; i++) s = reducer(s, { type: 'review', wordId: 'abandon', outcome: 'forgot', now });
    expect(leeches(s).map((c) => c.wordId)).toEqual(['abandon']);
    s = reducer(s, { type: 'rescueLeech', wordId: 'abandon', now });
    expect(s.cards.abandon.box).toBe(2);
    expect(leeches(s)).toHaveLength(0);
    expect(s.rescuedLeeches).toBe(1);
  });

  it('bozuk veya eski kayıtları güvenle yükler', () => {
    expect(migrate(null).version).toBe(1);
    expect(migrate({ version: 99 }).cards).toEqual({});
    const partial = migrate({ version: 1, profile: { name: 'Ayşe' } });
    expect(partial.profile.name).toBe('Ayşe');
    expect(partial.profile.dailyGoal).toBe(20);
  });
});

describe('günlük plan', () => {
  it('önce vadesi gelenleri, sonra günlük kota kadar yeni kelimeyi alır', () => {
    let s = createInitialState(now);
    const plan0 = dailyPlan(s, now);
    expect(plan0.dueIds).toHaveLength(0);
    expect(plan0.newIds).toHaveLength(s.profile.newPerDay);

    s = reducer(s, { type: 'review', wordId: 'thrive', outcome: 'forgot', now });
    const tomorrow = now + 86_400_000;
    const plan1 = dailyPlan(s, tomorrow);
    expect(plan1.dueIds).toEqual(['thrive']);
    expect(plan1.newIds).not.toContain('thrive');
  });

  it('kutu sayıları kartlarla tutarlı', () => {
    let s = createInitialState(now);
    s = reducer(s, { type: 'review', wordId: 'a1', outcome: 'easy', now });
    s = reducer(s, { type: 'review', wordId: 'thrive', outcome: 'forgot', now });
    expect(boxCounts(s)).toEqual({ 1: 1, 2: 0, 3: 0, 4: 0, 5: 1 });
  });
});

describe('yapay zekâ koçu', () => {
  it('istatistik özeti son 7 günü, kutuları ve en çok unutulanları içerir', () => {
    let s = createInitialState(now);
    for (const outcome of ['forgot', 'forgot', 'know'] as const) s = reducer(s, { type: 'review', wordId: 'inevitable', outcome, now });
    s = reducer(s, { type: 'review', wordId: 'thrive', outcome: 'easy', now });
    const text = coachStats(s, wordMap(s), (pos) => pos, now);
    expect(text).toContain('Son 7 gün: 4 tekrar, doğruluk %50, 1/7 gün');
    expect(text).toContain('inevitable (adjective, 2 kez unutuldu, şu an Kutu 2)');
    expect(text).toContain('K5 1');
  });
  it('rapor kaydedilir ve eski yedeklerde boş başlar', () => {
    const report = { headline: 'h', summary: 's', strengths: [], focus: [], plan: [], createdAt: now };
    expect(reducer(createInitialState(now), { type: 'setCoachReport', report }).coachReport).toEqual(report);
    const old = { ...createInitialState(now) } as Partial<ReturnType<typeof createInitialState>>;
    delete old.coachReport;
    expect(migrate(old).coachReport).toBeNull();
  });
});

describe('geri alma', () => {
  it('yeni kartın değerlendirmesini geri alınca kart ve günlük sayaçlar eski haline döner', () => {
    const before = createInitialState(now);
    const after = reducer(before, { type: 'review', wordId: 'inevitable', outcome: 'know', now });
    expect(after.cards.inevitable).toBeDefined();
    const undone = reducer(after, { type: 'undoReview', wordId: 'inevitable', prev: undefined, outcome: 'know', at: now });
    expect(undone.cards.inevitable).toBeUndefined();
    expect(undone.profile.xp).toBe(before.profile.xp);
    const day = undone.history[dayKey(now)];
    expect(day.reviews).toBe(0);
    expect(day.correct).toBe(0);
    expect(day.newWords).toBe(0);
    expect(day.xp).toBe(0);
  });
  it('kutudaki kartı önceki kutusuna ve vadesine döndürür', () => {
    let s = reducer(createInitialState(now), { type: 'review', wordId: 'thrive', outcome: 'know', now });
    const prev = s.cards.thrive;
    s = reducer(s, { type: 'review', wordId: 'thrive', outcome: 'forgot', now: now + 1000 });
    expect(s.cards.thrive.box).toBe(1);
    s = reducer(s, { type: 'undoReview', wordId: 'thrive', prev, outcome: 'forgot', at: now + 1000 });
    expect(s.cards.thrive).toEqual(prev);
    expect(s.history[dayKey(now)].reviews).toBe(1);
  });
});

describe('istatistik takvimleri', () => {
  it('7 günlük tahmin gecikmiş kartları bugüne sayar', () => {
    const s = createInitialState(now);
    const today = dayIndex(now);
    s.cards = {
      a: { ...s.cards.a, wordId: 'a', box: 1, dueDay: today - 3, lapses: 0, failStreak: 0, reviews: 1, correct: 1, lastReviewed: 0, addedAt: 0 },
      b: { wordId: 'b', box: 2, dueDay: today, lapses: 0, failStreak: 0, reviews: 1, correct: 1, lastReviewed: 0, addedAt: 0 },
      c: { wordId: 'c', box: 3, dueDay: today + 2, lapses: 0, failStreak: 0, reviews: 1, correct: 1, lastReviewed: 0, addedAt: 0 },
      d: { wordId: 'd', box: 5, dueDay: today + 30, lapses: 0, failStreak: 0, reviews: 1, correct: 1, lastReviewed: 0, addedAt: 0 },
    };
    const f = reviewForecast(s, 7, now);
    expect(f.map((d) => d.count)).toEqual([2, 0, 1, 0, 0, 0, 0]);
    expect(f[0].label).toBe('Bugün');
    expect(f[1].label).toBe('Yarın');
  });
  it('takvim seviyeleri günlük hedefe göre hesaplanır, gelecek günler boş kalır', () => {
    expect([0, 5, 12, 20, 39, 40].map((n) => activityLevel(n, 20))).toEqual([0, 1, 2, 3, 3, 4]);
    const s = createInitialState(now);
    s.history[dayKey(now)] = { reviews: 25, correct: 20, xp: 0, newWords: 0, studyMs: 0, lateNight: false };
    const cal = activityCalendar(s, 12, now);
    expect(cal.columns).toHaveLength(12);
    expect(cal.columns.every((c) => c.length === 7)).toBe(true);
    const cells = cal.columns.flat();
    expect(cells.find((c) => c.key === dayKey(now))?.level).toBe(3);
    expect(cal.total).toBe(25);
    expect(cal.activeDays).toBe(1);
    // Takvim bu haftanın Pazar gününde biter; bugünden sonraki günler "gelecek" işaretlidir
    const todayPos = cells.findIndex((c) => c.key === dayKey(now));
    expect(cells.slice(todayPos + 1).every((c) => c.future)).toBe(true);
    expect(cells.slice(0, todayPos + 1).some((c) => c.future)).toBe(false);
  });
});
