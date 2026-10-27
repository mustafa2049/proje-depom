import { describe, expect, it } from 'vitest';
import { SEED_WORDS } from '../data/words';
import { dayIndex, dayKey } from '../lib/leitner';
import { allWords, boxCounts, dailyPlan, leeches, wordMap } from '../store/selectors';
import { createInitialState, migrate, reducer } from '../store/state';

const now = new Date(2026, 9, 27, 10, 0).getTime();

describe('tohum sözlük', () => {
  it('kimlikler benzersiz ve tüm kelimelerde anlam + örnek var', () => {
    const ids = SEED_WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of SEED_WORDS) {
      expect(w.meaning.length, w.id).toBeGreaterThan(0);
      expect(w.examples.length, w.id).toBeGreaterThan(0);
      expect(w.ipa.startsWith('/'), w.id).toBe(true);
    }
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
