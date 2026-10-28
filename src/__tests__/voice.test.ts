import { describe, expect, it } from 'vitest';
import index from '../../public/voice/index.json';
import { SEED_WORDS } from '../data/words';
import { splitForAi, voiceKey } from '../lib/voice';

describe('doğal ses anahtarı', () => {
  it('scripts/voice ile aynı özetleri üretir', () => {
    // Değerler Python tarafındaki cyrb53 uygulamasıyla hesaplandı.
    expect(voiceKey('ubiquitous')).toBe('igmgqk921w');
    expect(voiceKey('You’re welcome!')).toBe('1pl8w58bjrh');
    expect(voiceKey('emoji 😀 test')).toBe('sg48skiufr');
  });
  it('büyük harf, kesme işareti ve boşluk farkını yok sayar', () => {
    expect(voiceKey('  The  ubiquitous\nsmartphone. ')).toBe('gktczblmok');
    expect(voiceKey('The ubiquitous smartphone.')).toBe('gktczblmok');
    expect(voiceKey("You're welcome!")).toBe(voiceKey('You’re welcome!'));
  });
});

describe('hazır kayıtlar', () => {
  const clips = index.clips as Record<string, number>;
  it('her sözlük kelimesinin ve örnek cümlesinin kaydı var', () => {
    const missing: string[] = [];
    for (const w of SEED_WORDS) {
      if (!clips[voiceKey(w.word)]) missing.push(w.word);
      for (const e of w.examples) if (!clips[voiceKey(e.en)]) missing.push(e.en);
    }
    expect(missing).toEqual([]);
  });
  it('kayıt süreleri makul', () => {
    const odd = Object.entries(clips).filter(([, ms]) => ms < 250 || ms > 30_000);
    expect(odd).toEqual([]);
  });
});

describe('yapay zekâ sesi için bölme', () => {
  it('kısa metni olduğu gibi bırakır', () => {
    expect(splitForAi('  Hello   there! ')).toEqual(['Hello there!']);
  });
  it('uzun metni cümle sınırlarından 200 karakteri aşmadan böler', () => {
    const s = 'This is a fairly long sentence that keeps going for a while. ';
    const chunks = splitForAi(s.repeat(6))!;
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 200)).toBe(true);
    expect(chunks.join(' ')).toBe(s.repeat(6).trim());
  });
  it('bölünemeyecek kadar uzun cümlede veya 3 parçadan fazlasında vazgeçer', () => {
    expect(splitForAi('word '.repeat(60))).toBeNull();
    expect(splitForAi('This sentence has exactly enough words to matter here. '.repeat(14))).toBeNull();
    expect(splitForAi('   ')).toBeNull();
  });
});
