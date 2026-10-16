import { describe, expect, it } from 'vitest';

import { cardFromLookup } from './cardFromLookup';
import { checkWordOrder, placeWord, returnWord, toChips } from './sentenceBuilder';
import { createSpeechRecognizer, getSpeechRecognitionConstructor } from './speechRecognition';
import { scenarioKeyFromLabel, scenarioTitle, SCENARIOS } from './scenarios';
import { cleanWord, sentenceAt, tokenizeText } from './tokenize';
import type { LookupResult } from '../types/api';

describe('tokenizeText', () => {
  it('kelimeleri noktalama ve boşluktan ayırır, kelime tokenlarını işaretler', () => {
    const tokens = tokenizeText('Hello, world!');
    expect(tokens.filter((token) => token.isWord).map((token) => token.text)).toEqual(['Hello', 'world']);
    expect(tokens.map((token) => token.text).join('')).toBe('Hello, world!');
  });

  it('kesme işareti ve tireli kelimeleri tek token olarak tutar', () => {
    const words = tokenizeText("Don't forget the well-known rule.").filter((token) => token.isWord);
    expect(words.map((token) => token.text)).toEqual(["Don't", 'forget', 'the', 'well-known', 'rule']);
  });

  it('her tokenın başlangıç konumu metinle tutarlıdır', () => {
    const text = 'I like tea.';
    for (const token of tokenizeText(text)) {
      expect(text.slice(token.start, token.start + token.text.length)).toBe(token.text);
    }
  });
});

describe('sentenceAt', () => {
  it('verilen konumdaki cümleyi döner', () => {
    const text = 'It rained all day. We stayed inside! Then the sun came out.';
    const position = text.indexOf('stayed');
    expect(sentenceAt(text, position)).toBe('We stayed inside!');
  });
});

describe('cleanWord', () => {
  it('sunucudaki normalizasyonla aynı sonucu verir', () => {
    expect(cleanWord('  Umbrella, ')).toBe('umbrella');
    expect(cleanWord('"...”')).toBe('');
  });
});

describe('cardFromLookup', () => {
  const lookup: LookupResult = {
    source: 'AI',
    word: 'bank',
    translationTR: 'kıyı',
    partOfSpeech: 'noun',
    phonetic: null,
    definitionEN: 'The land along the side of a river.',
    exampleSentence: 'He walked along the river bank.',
    synonyms: ['shore'],
    existingCardId: null,
  };

  it('sözlük sonucunu kart isteğine çevirir; boş fonetik alanı eklemez', () => {
    expect(cardFromLookup(lookup)).toEqual({
      term: 'bank',
      partOfSpeech: 'noun',
      translationTR: 'kıyı',
      definitionEN: 'The land along the side of a river.',
      exampleSentence1: 'He walked along the river bank.',
      synonyms: ['shore'],
    });
  });
});

describe('kelime sıralama kuralları', () => {
  const bank = toChips(['tea.', 'like', 'I']);

  it('doğru sıra ile doğrulama başarılı olur', () => {
    expect(checkWordOrder(['I', 'like', 'tea.'], 'I like tea.')).toBe(true);
  });

  it('yanlış sıra ve eksik kelime başarısız olur', () => {
    expect(checkWordOrder(['like', 'I', 'tea.'], 'I like tea.')).toBe(false);
    expect(checkWordOrder(['I', 'like'], 'I like tea.')).toBe(false);
  });

  it('kelime yerleştirip geri alma bankayı ve yerleştirilenleri tutarlı tutar', () => {
    const first = bank.find((chip) => chip.word === 'I');
    const afterPlace = placeWord(bank, [], first?.id ?? '');
    expect(afterPlace.placed.map((chip) => chip.word)).toEqual(['I']);
    expect(afterPlace.bank).toHaveLength(2);

    const afterReturn = returnWord(afterPlace.bank, afterPlace.placed, first?.id ?? '');
    expect(afterReturn.placed).toHaveLength(0);
    expect(afterReturn.bank).toHaveLength(3);
  });

  it('bilinmeyen kimlik için durum değişmez', () => {
    expect(placeWord(bank, [], 'nope').placed).toHaveLength(0);
  });
});

describe('senaryo eşlemesi', () => {
  it('sunucu etiketlerini senaryo anahtarlarına çevirir', () => {
    expect(scenarioKeyFromLabel('Job Interview')).toBe('job-interview');
    expect(scenarioKeyFromLabel('Bilinmeyen')).toBe('free-talk');
  });

  it('beş senaryo tanımlıdır ve başlıkları vardır', () => {
    expect(SCENARIOS).toHaveLength(5);
    expect(scenarioTitle('cafe-order')).toBe('Kafe Siparişi');
  });
});

describe('konuşmadan metne (web)', () => {
  it('tarayıcı desteği yoksa yapıcı null döner ve tanıyıcı oluşmaz', () => {
    expect(getSpeechRecognitionConstructor({})).toBeNull();
    expect(createSpeechRecognizer(() => undefined, () => undefined, {})).toBeNull();
  });

  it('webkit öneki ile sağlanan yapıcıyı bulur', () => {
    class FakeRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      onresult = null;
      onerror = null;
      onend = null;
      start() {}
      stop() {}
    }
    expect(getSpeechRecognitionConstructor({ webkitSpeechRecognition: FakeRecognition })).toBe(FakeRecognition);
    expect(createSpeechRecognizer(() => undefined, () => undefined, { webkitSpeechRecognition: FakeRecognition })).not.toBeNull();
  });
});
