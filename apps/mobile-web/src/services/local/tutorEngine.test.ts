import { describe, expect, it } from 'vitest';

import { analyzeSentenceLocally, checkGrammar, extractVocabulary, runTutorTurn, tokenOverlap, tokensOf } from './tutorEngine';

describe('checkGrammar', () => {
  it.each([
    ['i like coffee', 'I like coffee.'],
    ['she don\'t like tea.', "She doesn't like tea."],
    ['He go to school every day.', 'He goes to school every day.'],
    ['she watch films on weekends.', 'She watches films on weekends.'],
    ['It have a big garden.', 'It has a big garden.'],
    ['I didn\'t went to work yesterday.', "I didn't go to work yesterday."],
    ['I am a engineer.', 'I am an engineer.'],
    ['This is an book.', 'This is a book.'],
    ['They is very happy.', 'They are very happy.'],
    ['This one is more better.', 'This one is better.'],
    ['where is the station', 'Where is the station?'],
  ])('"%s" → "%s"', (input, expected) => {
    const result = checkGrammar(input);
    expect(result.corrected).toBe(expected);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it.each([
    'I work in a small company.',
    'Can he go to the party?',
    'Does she like coffee?',
    'I waited for an hour.',
    'She studies at a university.',
    'He has a European passport.',
  ])('doğru cümleye dokunmaz: "%s"', (sentence) => {
    expect(checkGrammar(sentence)).toEqual({ corrected: sentence, issues: [] });
  });

  it('aynı kural birden çok yerde uygulansa da bir kez raporlanır', () => {
    const result = checkGrammar('i think i can do it.');
    expect(result.corrected).toBe('I think I can do it.');
    expect(result.issues.filter((issue) => issue.rule === 'pronoun-i')).toHaveLength(1);
  });
});

describe('runTutorTurn', () => {
  const pool = [
    { term: 'experience', translationTR: 'deneyim', example: 'I have experience in sales.' },
    { term: 'deadline', translationTR: 'son teslim tarihi', example: 'The deadline is Monday.' },
  ];

  it('hatalı mesajı düzeltir ve senaryonun ilk sorusunu sorar', () => {
    const turn = runTutorTurn({ scenario: 'job-interview', message: 'i have five years experience', turn: 0, vocabularyPool: pool });
    expect(turn.isPerfect).toBe(false);
    expect(turn.correctedUserMessage).toBe('I have five years experience.');
    expect(turn.reply).toContain('Could you tell me a little about yourself?');
    expect(turn.replyTranslationTR).toContain('Bana biraz kendinden bahseder misin?');
    expect(turn.extractedVocabulary[0]).toEqual({ term: 'experience', translationTR: 'deneyim', example: 'I have experience in sales.' });
    expect(turn.extractedVocabulary.length).toBeLessThanOrEqual(3);
  });

  it('kusursuz mesajda düzeltme döndürmez ve tur sayısına göre sıradaki soruya geçer', () => {
    const turn = runTutorTurn({ scenario: 'cafe-order', message: 'A large latte, please.', turn: 1, vocabularyPool: [] });
    expect(turn.isPerfect).toBe(true);
    expect(turn.correctedUserMessage).toBeNull();
    expect(turn.reply).toContain('Would you like that hot or iced?');
    expect(turn.extractedVocabulary.length).toBeGreaterThan(0);
  });
});

describe('extractVocabulary', () => {
  it('önce çok kelimeli ifadeleri bulur, kısa ve yaygın kelimeleri atlar', () => {
    const pool = [
      { term: 'look forward to', translationTR: 'dört gözle beklemek', example: 'I look forward to it.' },
      { term: 'look', translationTR: 'bakmak', example: 'Look!' },
      { term: 'the', translationTR: '-', example: '-' },
    ];
    const found = extractVocabulary('I really look forward to the trip.', pool);
    expect(found.map((item) => item.term)).toEqual(['look forward to']);
  });
});

describe('analyzeSentenceLocally', () => {
  const reference = "I'm going to the market tomorrow.";

  it('referansla birebir aynı çeviri doğru kabul edilir', () => {
    const analysis = analyzeSentenceLocally('I am going to the market tomorrow.', reference);
    expect(analysis.isCorrect).toBe(true);
    expect(analysis.score).toBe(100);
    expect(analysis.nativeAlternative).toBe(reference);
  });

  it('eksik kelimeli çeviri düşük puan alır ve eksik kelimeler not edilir', () => {
    const analysis = analyzeSentenceLocally('I go market.', reference);
    expect(analysis.isCorrect).toBe(false);
    expect(analysis.score).toBeLessThan(60);
    expect(analysis.grammarNotesTR.join(' ')).toContain('tomorrow');
  });

  it('referans yoksa yalnızca dilbilgisine göre puanlar', () => {
    expect(analyzeSentenceLocally('She works here.')).toMatchObject({ isCorrect: true, score: 95 });
    const fixed = analyzeSentenceLocally('she work here');
    expect(fixed).toMatchObject({ isCorrect: false, correctedSentence: 'She works here.' });
    expect(fixed.naturalnessScore).toBeGreaterThanOrEqual(1);
  });
});

describe('tokensOf / tokenOverlap', () => {
  it('kısaltmaları açar ve noktalamayı atar', () => {
    expect(tokensOf("I'm sure it's fine!")).toEqual(['i', 'am', 'sure', 'it', 'is', 'fine']);
  });

  it('örtüşmeyi F1 olarak hesaplar', () => {
    expect(tokenOverlap(['a', 'b'], ['a', 'b'])).toBe(1);
    expect(tokenOverlap([], ['a'])).toBe(0);
    expect(tokenOverlap(['a', 'c'], ['a', 'b'])).toBeCloseTo(0.5);
  });
});
