import { describe, expect, it } from 'vitest';

import { buildClozeFromCard, pickByLevel, shuffle, shuffleWords } from './practiceService';

/** Tekrarlanabilir sözde rastgele sayı üreteci (LCG). */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const CARD = {
  id: 'card-1',
  term: 'look after',
  partOfSpeech: 'phrasal verb',
  translationTR: 'ilgilenmek',
  exampleSentence1: 'My grandmother will look after the children on weekdays.',
};

const POOL = [
  CARD,
  { id: 'card-2', term: 'give up', partOfSpeech: 'phrasal verb', translationTR: 'vazgeçmek', exampleSentence1: '' },
  { id: 'card-3', term: 'turn down', partOfSpeech: 'phrasal verb', translationTR: 'reddetmek', exampleSentence1: '' },
  { id: 'card-4', term: 'put off', partOfSpeech: 'phrasal verb', translationTR: 'ertelemek', exampleSentence1: '' },
];

describe('shuffle', () => {
  it('bir permütasyon üretir ve girdiyi değiştirmez', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const output = shuffle(input, seeded(7));

    expect([...output].sort()).toEqual([...input].sort());
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('aynı tohumla aynı sonucu verir', () => {
    expect(shuffle([1, 2, 3, 4], seeded(42))).toEqual(shuffle([1, 2, 3, 4], seeded(42)));
  });
});

describe('shuffleWords', () => {
  it('kelimeleri korur fakat sıralamayı değiştirir', () => {
    const sentence = 'I would like a cup of tea.';
    const words = shuffleWords(sentence, seeded(3));

    expect([...words].sort()).toEqual(sentence.split(' ').sort());
    expect(words.join(' ')).not.toBe(sentence);
  });

  it('tek kelimelik cümlede olduğu gibi döner', () => {
    expect(shuffleWords('Hello', seeded(1))).toEqual(['Hello']);
  });
});

describe('pickByLevel', () => {
  it('önce hedef seviyeyi, sonra komşu seviyeleri seçer', () => {
    const items = [
      { level: 'A1' as const, id: 'a' },
      { level: 'B1' as const, id: 'b' },
      { level: 'B2' as const, id: 'c' },
      { level: 'C2' as const, id: 'd' },
    ];
    const picked = pickByLevel(items, 'B1', 2, seeded(9));

    expect(picked.map((item) => item.id).sort()).toEqual(['b', 'c']);
  });
});

describe('buildClozeFromCard', () => {
  it('kartın terimini boşlukla değiştirir ve doğru cevabı işaret eder', () => {
    const exercise = buildClozeFromCard(CARD, 'B1', POOL, seeded(5));

    expect(exercise).not.toBeNull();
    expect(exercise?.sentence).toBe('My grandmother will ___ the children on weekdays.');
    expect(exercise?.options).toHaveLength(4);
    expect(exercise?.options[exercise.answerIndex]).toBe('look after');
    expect(exercise?.source).toBe('CARD');
    expect(exercise?.level).toBe('B1');
  });

  it('örnek cümlede terim yoksa null döner', () => {
    expect(buildClozeFromCard({ ...CARD, exampleSentence1: 'Nothing relevant here.' }, 'B1', POOL, seeded(5))).toBeNull();
  });

  it('çekimli biçimde geçen terimi (looks after) eşleştirmez; bu durumda soru üretilmez', () => {
    expect(
      buildClozeFromCard({ ...CARD, exampleSentence1: 'She looks after the dog.' }, 'B1', POOL, seeded(5)),
    ).toBeNull();
  });

  it('yeterli çeldirici yoksa null döner', () => {
    expect(buildClozeFromCard(CARD, 'B1', [CARD], seeded(5))).toBeNull();
  });
});
