import { describe, expect, it } from 'vitest';

import { NotFoundError } from '../lib/errors';

import { getPassage, listPassages, normalizeWord } from './readerService';

describe('normalizeWord', () => {
  it('büyük harfi küçültür ve kenar noktalamayı temizler', () => {
    expect(normalizeWord('  Umbrella, ')).toBe('umbrella');
    expect(normalizeWord('"Hello!"')).toBe('hello');
  });

  it('kelime içindeki kesme işaretini ve tireyi korur', () => {
    expect(normalizeWord("Don't")).toBe("don't");
    expect(normalizeWord('well-known')).toBe('well-known');
  });

  it('yalnızca noktalamadan oluşan girdi için boş dize döner', () => {
    expect(normalizeWord('...')).toBe('');
  });
});

describe('okuma kütüphanesi sorguları', () => {
  it('seviye filtresi yalnızca o seviyenin parçalarını döner', () => {
    const b1 = listPassages('B1');
    expect(b1.length).toBeGreaterThanOrEqual(2);
    expect(b1.every((passage) => passage.level === 'B1')).toBe(true);
  });

  it('özet listesi içerik metnini taşımaz', () => {
    const [first] = listPassages();
    expect(first).not.toHaveProperty('content');
  });

  it('bilinmeyen kimlik NotFoundError fırlatır', () => {
    expect(() => getPassage('no-such-passage')).toThrow(NotFoundError);
  });
});
