/** Kural tabanlı mikro yazma analizi (sunucu veya yapay zekâ gerektirmez). */

import { splitByTerm } from './text';

export interface WritingIssue {
  type: 'mechanics' | 'l1' | 'style';
  message: string;
}

export interface Suggestion {
  from: string;
  to: string;
  note: string;
}

export interface WritingAnalysis {
  sentences: number;
  words: number;
  avgSentence: number;
  level: string;
  levelNote: string;
  naturalness: number;
  issues: WritingIssue[];
  suggestions: Suggestion[];
  usedTargets: string[];
}

const UPGRADES: { re: RegExp; to: string; note: string }[] = [
  { re: /\bvery good\b/i, to: 'excellent', note: '“very + sıfat” yerine tek güçlü sıfat' },
  { re: /\bvery bad\b/i, to: 'terrible', note: '“very + sıfat” yerine tek güçlü sıfat' },
  { re: /\bvery big\b/i, to: 'enormous', note: '“very + sıfat” yerine tek güçlü sıfat' },
  { re: /\bvery tired\b/i, to: 'exhausted', note: '“very + sıfat” yerine tek güçlü sıfat' },
  { re: /\bvery important\b/i, to: 'crucial', note: '“very + sıfat” yerine tek güçlü sıfat' },
  { re: /\bvery happy\b/i, to: 'delighted', note: '“very + sıfat” yerine tek güçlü sıfat' },
  { re: /\bvery difficult\b/i, to: 'challenging', note: 'Daha akademik bir sıfat' },
  { re: /\bvery hard\b/i, to: 'demanding', note: 'Daha akademik bir sıfat' },
  { re: /\ba lot of\b/i, to: 'a great deal of', note: 'Daha resmi bir miktar ifadesi' },
  { re: /\bget better\b/i, to: 'improve', note: 'Deyimsel fiil yerine tek fiil' },
  { re: /\bthink about\b/i, to: 'consider', note: 'Daha resmi fiil' },
  { re: /\bfind out\b/i, to: 'discover', note: 'Daha resmi fiil' },
  { re: /\bstart(ed)? to\b/i, to: 'began to', note: 'Anlatımda geçmiş zaman akıcılığı' },
  { re: /\bbut\b/i, to: 'however,', note: 'Cümle başında bağlaç çeşitliliği' },
  { re: /\bso\b/i, to: 'therefore,', note: 'Sonuç bildiren resmi bağlaç' },
  { re: /\bbecause of this\b/i, to: 'as a result', note: 'Daha akıcı bağlantı ifadesi' },
];

const L1_PATTERNS: { re: RegExp; message: string }[] = [
  { re: /\b(?:do|does|did|doing|done) an? (?:big |huge |tough |hard |serious )?(?:decision|mistake|error|party)\b/i, message: '“do a decision/mistake/party” doğal değil → make a decision / make a mistake / throw a party' },
  { re: /\bmake an? (?:\w+ )?party\b/i, message: '“make a party” → throw / have a party' },
  { re: /\bstrong rain\b/i, message: '“strong rain” → heavy rain' },
  { re: /\bopen the (?:light|lights|tv|television)\b/i, message: '“open the light” → turn on the light' },
  { re: /\bclose the (?:light|lights|tv|television)\b/i, message: '“close the light” → turn off the light' },
  { re: /\bsay (?:a )?lie\b/i, message: '“say a lie” → tell a lie' },
  { re: /\bmore better\b/i, message: '“more better” → better (çifte karşılaştırma)' },
  { re: /\bvery very\b/i, message: '“very very” yerine daha güçlü bir sıfat seç' },
  { re: /\bI am agree\b/i, message: '“I am agree” → I agree' },
  { re: /\bmake (?:attention)\b/i, message: '“make attention” → pay attention' },
  { re: /\bborrow me\b/i, message: '“borrow me” → lend me (ödünç vermek)' },
];

const CONNECTORS = /\b(however|although|therefore|moreover|furthermore|nevertheless|whereas|consequently|despite|meanwhile|eventually|unless)\b/gi;

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[a-z]/i.test(s));
}

export function analyzeWriting(text: string, targets: string[], advancedWords: Set<string>): WritingAnalysis {
  const sentences = splitSentences(text);
  const tokens = text.match(/[A-Za-z’']+/g) ?? [];
  const words = tokens.length;
  const avgSentence = sentences.length ? words / sentences.length : 0;
  const avgWordLen = words ? tokens.reduce((s, t) => s + t.length, 0) / words : 0;
  const connectors = (text.match(CONNECTORS) ?? []).length;
  const advanced = tokens.filter((t) => advancedWords.has(t.toLowerCase())).length;

  const issues: WritingIssue[] = [];
  for (const s of sentences) {
    if (/^[a-z]/.test(s)) issues.push({ type: 'mechanics', message: `Cümle büyük harfle başlamalı: “${s.slice(0, 24)}…”` });
  }
  if (sentences.length && !/[.!?]["”']?\s*$/.test(text.trim())) issues.push({ type: 'mechanics', message: 'Son cümle noktalama işaretiyle bitmeli.' });
  if (/\bi\b/.test(text)) issues.push({ type: 'mechanics', message: '“I” zamiri her zaman büyük harfle yazılır.' });
  const dup = text.match(/\b(\w+)\s+\1\b/i);
  if (dup) issues.push({ type: 'mechanics', message: `Tekrarlanan kelime: “${dup[0]}”` });
  for (const p of L1_PATTERNS) if (p.re.test(text)) issues.push({ type: 'l1', message: p.message });

  const suggestions: Suggestion[] = [];
  for (const u of UPGRADES) {
    const m = text.match(u.re);
    if (m) suggestions.push({ from: m[0], to: u.to, note: u.note });
    if (suggestions.length >= 3) break;
  }

  // Kaba CEFR tahmini: cümle uzunluğu, kelime uzunluğu, bağlaç ve ileri kelime kullanımı.
  const score = Math.min(avgSentence, 22) / 22 * 35 + Math.min(Math.max(avgWordLen - 3.5, 0), 2.5) / 2.5 * 25 + Math.min(connectors, 3) / 3 * 20 + Math.min(advanced, 4) / 4 * 20;
  const level = score >= 75 ? 'C1' : score >= 60 ? 'B2+' : score >= 45 ? 'B2' : score >= 30 ? 'B1' : 'A2';
  const levelNote = connectors ? 'Bağlaç kullanımı güçlü' : avgSentence > 14 ? 'Uzun ve akıcı cümleler' : 'Bağlaçlarla cümleleri zenginleştir';
  const naturalness = Math.max(40, 100 - issues.filter((i) => i.type !== 'style').length * 12);

  const usedTargets = targets.filter((t) => splitByTerm(text, t).some((p) => p.match));
  return { sentences: sentences.length, words, avgSentence, level, levelNote, naturalness, issues, suggestions, usedTargets };
}
