import { describe, expect, it } from 'vitest';
import { checkAnswer, meaningCandidates } from '../lib/answer';
import { SEED_WORD_MAP } from '../data/words';

const inevitable = SEED_WORD_MAP.inevitable; // "Kaçınılmaz, önlenemez"

describe('yazarak cevaplama', () => {
  it('anlamdaki alternatifleri ayırır', () => {
    expect(meaningCandidates('Kaçınılmaz, önlenemez')).toEqual(['kaçınılmaz', 'önlenemez']);
  });
  it('Türkçe cevapta alternatifleri, büyük harf ve Türkçe karakter farkını kabul eder', () => {
    expect(checkAnswer('önlenemez', inevitable, false)).toBe('correct');
    expect(checkAnswer('KAÇINILMAZ', inevitable, false)).toBe('correct');
    expect(checkAnswer('kacinilmaz', inevitable, false)).toBe('correct');
    expect(checkAnswer('kaçınılmas', inevitable, false)).toBe('close');
    expect(checkAnswer('mutlu', inevitable, false)).toBe('wrong');
  });
  it('İngilizce cevapta küçük yazım hatasını "yakın" sayar', () => {
    expect(checkAnswer('Inevitable', inevitable, true)).toBe('correct');
    expect(checkAnswer('inevitible', inevitable, true)).toBe('close');
    expect(checkAnswer('invisible', inevitable, true)).toBe('wrong');
  });
  it('deyimleri ve kesme işaretini tolere eder', () => {
    expect(checkAnswer("You're welcome!", SEED_WORD_MAP['youre-welcome'], true)).toBe('correct');
    expect(checkAnswer('you re welcome', SEED_WORD_MAP['youre-welcome'], true)).toBe('close');
  });
});
