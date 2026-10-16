import { describe, expect, it } from 'vitest';

import { CLOZE_BANK, TRANSLATION_BANK, WORD_ORDER_BANK } from './practiceBank';
import { READING_PASSAGES } from './readingPassages';

describe('okuma parçaları', () => {
  it('en az 6 parça içerir ve A1–C2 seviyelerinin tamamını kapsar', () => {
    expect(READING_PASSAGES.length).toBeGreaterThanOrEqual(6);
    const levels = new Set(READING_PASSAGES.map((passage) => passage.level));
    expect([...levels].sort()).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('kimlikler benzersiz ve her parçanın 3 okuduğunu anlama sorusu vardır', () => {
    const ids = READING_PASSAGES.map((passage) => passage.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const passage of READING_PASSAGES) {
      expect(passage.comprehensionQuestions).toHaveLength(3);
      expect(passage.keyVocabulary.length).toBeGreaterThan(0);
      expect(passage.content.split('\n\n').length).toBeGreaterThan(0);
    }
  });

  it('her sorunun doğru cevap indeksi seçeneklerin içindedir', () => {
    for (const passage of READING_PASSAGES) {
      for (const question of passage.comprehensionQuestions) {
        expect(question.options).toHaveLength(4);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options.length);
      }
    }
  });
});

describe('alıştırma havuzu', () => {
  it('boşluk doldurma sorularında tek bir boşluk ve farklı dört şık vardır', () => {
    for (const item of CLOZE_BANK) {
      expect(item.sentence.split('___').length - 1).toBe(1);
      expect(new Set(item.options).size).toBe(4);
      expect(item.answerIndex).toBeLessThan(4);
    }
  });

  it('kelime sıralama ve çeviri havuzları boş değildir ve her seviyeyi içerir', () => {
    expect(WORD_ORDER_BANK.every((item) => item.sentence.split(' ').length >= 3)).toBe(true);
    expect(TRANSLATION_BANK.every((item) => item.sourceTR.length > 0 && item.referenceEN.length > 0)).toBe(true);
    expect(new Set(WORD_ORDER_BANK.map((item) => item.level)).size).toBeGreaterThanOrEqual(4);
  });
});
