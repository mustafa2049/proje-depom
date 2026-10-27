import { describe, expect, it } from 'vitest';
import { cleanSubtitles, extractVocabulary, findWordId, splitByTerm } from '../lib/text';
import { analyzeWriting } from '../lib/writing';
import { similarity } from '../lib/speech';

describe('splitByTerm', () => {
  it('çekimli halleri vurgular', () => {
    const parts = splitByTerm('Small businesses thrive here and thrived before.', 'thrive');
    expect(parts.filter((p) => p.match).map((p) => p.text)).toEqual(['thrive', 'thrived']);
  });
  it('kelime içindeki eşleşmeleri yakalamaz', () => {
    expect(splitByTerm('effective', 'effect').some((p) => p.match)).toBe(false);
  });
});

describe('altyazı analizi', () => {
  it('zaman kodlarını temizler ve sık kelimeleri eler', () => {
    const srt = '1\n00:00:01,000 --> 00:00:03,500\n<i>It was pure serendipity!</i>\n\n2\n00:00:04,000 --> 00:00:05,000\nSerendipity, again.';
    const clean = cleanSubtitles(srt);
    expect(clean).not.toMatch(/-->/);
    const vocab = extractVocabulary(clean);
    expect(vocab[0]).toEqual({ word: 'serendipity', count: 2 });
    expect(vocab.some((v) => v.word === 'was')).toBe(false);
  });
  it('çekimli kelimenin sözlük kimliğini bulur', () => {
    expect(findWordId('thrived', { thrive: 1 })).toBe('thrive');
    expect(findWordId('abandoned', { abandon: 1 })).toBe('abandon');
    expect(findWordId('xyz', { thrive: 1 })).toBeNull();
  });
});

describe('yazma analizi', () => {
  it('hedef kelimeleri, cümle sayısını ve L1 tuzaklarını tespit eder', () => {
    const a = analyzeWriting('My team was reluctant at first. However, the change was inevitable. We did a decision.', ['reluctant', 'inevitable', 'thrive'], new Set(['inevitable']));
    expect(a.sentences).toBe(3);
    expect(a.usedTargets).toEqual(['reluctant', 'inevitable']);
    expect(a.issues.some((i) => i.type === 'l1')).toBe(true);
  });
  it('büyük harf ve noktalama uyarısı verir', () => {
    const a = analyzeWriting('i was tired', [], new Set());
    expect(a.issues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('similarity', () => {
  it('aynı metin 1, farklı metin düşük', () => {
    expect(similarity('Inevitable!', 'inevitable')).toBe(1);
    expect(similarity('table', 'inevitable')).toBeLessThan(0.6);
  });
});
