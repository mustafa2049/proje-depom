import { describe, expect, it } from 'vitest';

import { formatDuration, accuracyPercent } from './format';
import { mapKeyToAction } from './keyboard';
import { splitHighlight } from './highlight';
import { parseSynonyms, validateCardForm } from './validation';
import { todayActivity } from './stats';

describe('mapKeyToAction', () => {
  it('Space ve Enter kartı çevirir, çevrilmişse işlem yapmaz', () => {
    expect(mapKeyToAction(' ', false)).toEqual({ type: 'flip' });
    expect(mapKeyToAction('Enter', false)).toEqual({ type: 'flip' });
    expect(mapKeyToAction(' ', true)).toEqual({ type: 'none' });
  });

  it('1-4 tuşları yalnızca kart çevrilmişken Again/Hard/Good/Easy verir', () => {
    expect(mapKeyToAction('1', true)).toEqual({ type: 'review', quality: 0 });
    expect(mapKeyToAction('2', true)).toEqual({ type: 'review', quality: 1 });
    expect(mapKeyToAction('3', true)).toEqual({ type: 'review', quality: 2 });
    expect(mapKeyToAction('4', true)).toEqual({ type: 'review', quality: 3 });
    expect(mapKeyToAction('1', false)).toEqual({ type: 'none' });
  });

  it('R telaffuzu tekrar oynatır, bilinmeyen tuşlar yok sayılır', () => {
    expect(mapKeyToAction('r', false)).toEqual({ type: 'speak' });
    expect(mapKeyToAction('R', true)).toEqual({ type: 'speak' });
    expect(mapKeyToAction('x', true)).toEqual({ type: 'none' });
  });
});

describe('splitHighlight', () => {
  it('hedef kelimeyi büyük-küçük harf duyarsız vurgular', () => {
    expect(splitHighlight('I like the Apple a lot.', 'apple')).toEqual([
      { text: 'I like the ', highlighted: false },
      { text: 'Apple', highlighted: true },
      { text: ' a lot.', highlighted: false },
    ]);
  });

  it('regex karakterlerini literal olarak ele alır (phrasal verb noktalı olabilir)', () => {
    const segments = splitHighlight('Please look (after) it.', 'look (after)');
    expect(segments.find((segment) => segment.highlighted)?.text).toBe('look (after)');
  });

  it('kelime yoksa tek parça döner', () => {
    expect(splitHighlight('Nothing here', 'apple')).toEqual([{ text: 'Nothing here', highlighted: false }]);
  });
});

describe('formatDuration ve accuracyPercent', () => {
  it('süreyi okunabilir biçime çevirir', () => {
    expect(formatDuration(4_200)).toBe('4 sn');
    expect(formatDuration(125_000)).toBe('2 dk 05 sn');
  });

  it('doğruluk yüzdesini yuvarlar, sıfır değerlendirmede 0 döner', () => {
    expect(accuracyPercent(2, 3)).toBe(67);
    expect(accuracyPercent(0, 0)).toBe(0);
  });
});

describe('validateCardForm ve parseSynonyms', () => {
  const valid = {
    term: 'apple',
    partOfSpeech: 'noun',
    translationTR: 'elma',
    definitionEN: 'A fruit.',
    exampleSentence1: 'I ate an apple.',
    exampleSentence2: '',
    phonetic: '',
    synonyms: '',
  };

  it('geçerli formda hata döndürmez', () => {
    expect(validateCardForm(valid)).toEqual({});
  });

  it('zorunlu alanlar eksikse hata üretir', () => {
    const errors = validateCardForm({ ...valid, term: '  ', translationTR: '' });
    expect(errors.term).toBeDefined();
    expect(errors.translationTR).toBeDefined();
  });

  it('eş anlamlıları virgüle göre temizler', () => {
    expect(parseSynonyms(' fruit, , pome ,')).toEqual(['fruit', 'pome']);
  });
});

describe('todayActivity', () => {
  const overview = {
    streakCount: 2,
    dailyGoalCards: 30,
    lastStudyDate: null,
    learnedCards: 0,
    trackedCards: 0,
    retentionRate: null,
    totalXp: 0,
    heatmap: [
      { date: '2026-10-15', cardsReviewed: 9, correctCount: 5, durationSec: 0, xpEarned: 40 },
      { date: '2026-10-16', cardsReviewed: 12, correctCount: 8, durationSec: 0, xpEarned: 90 },
    ],
  };

  it('bugünün (UTC) kartını ve XP toplamını döner', () => {
    expect(todayActivity(overview, new Date('2026-10-16T12:00:00Z'))).toEqual({ cardsReviewed: 12, xpEarned: 90 });
  });

  it('bugün kayıt yoksa sıfır döner', () => {
    expect(todayActivity(overview, new Date('2026-10-18T12:00:00Z'))).toEqual({ cardsReviewed: 0, xpEarned: 0 });
    expect(todayActivity(null)).toEqual({ cardsReviewed: 0, xpEarned: 0 });
  });
});
