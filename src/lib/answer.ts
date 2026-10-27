/** "Yazarak cevapla" modunda kullanıcının cevabını değerlendirir. */

import type { Word } from './types';

export type AnswerVerdict = 'correct' | 'close' | 'wrong';

/** Türkçe karakterlere uygun küçük harfe çevirip noktalama ve fazla boşlukları temizler. */
export function normalizeAnswer(text: string, lang: 'tr' | 'en'): string {
  return text
    .toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en')
    .replace(/[’']/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Türkçe klavyesiz yazımı da kabul etmek için Türkçe harfleri ASCII karşılıklarına indirger. */
function fold(text: string): string {
  return text.replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c] ?? c);
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** Uzunluğa göre izin verilen yazım hatası sayısı: kısa kelimede 0, uzunlarda 1-2. */
function typoBudget(len: number): number {
  return len <= 3 ? 0 : len <= 7 ? 1 : 2;
}

/** Türkçe anlam metnindeki alternatif karşılıklar ("Kaçınılmaz, önlenemez" → ["kaçınılmaz", "önlenemez"]). */
export function meaningCandidates(meaning: string): string[] {
  return meaning
    .split(/[,;/]|\bveya\b|\bya da\b/)
    .map((m) => normalizeAnswer(m, 'tr'))
    .filter(Boolean);
}

export function checkAnswer(input: string, word: Word, reverse: boolean): AnswerVerdict {
  if (reverse) {
    const a = normalizeAnswer(input, 'en');
    const t = normalizeAnswer(word.word, 'en');
    if (!a) return 'wrong';
    if (a === t) return 'correct';
    const d = levenshtein(a, t);
    return d <= typoBudget(t.length) ? 'close' : 'wrong';
  }
  const a = fold(normalizeAnswer(input, 'tr'));
  if (a.length < 2) return 'wrong';
  let verdict: AnswerVerdict = 'wrong';
  for (const c of meaningCandidates(word.meaning).map(fold)) {
    if (a === c) return 'correct';
    // "kaçınılmaz bir şey" ↔ "kaçınılmaz" gibi kapsama durumları
    const words = c.split(' ');
    if (words.includes(a) || (a.length >= 4 && (c.startsWith(a) || a.startsWith(c)))) return 'correct';
    if (levenshtein(a, c) <= typoBudget(c.length)) verdict = 'close';
  }
  return verdict;
}
