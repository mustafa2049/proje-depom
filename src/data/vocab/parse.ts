import { slugify } from '../../lib/slug';
import type { Cefr, PartOfSpeech, Word } from '../../lib/types';

const POS: Record<string, PartOfSpeech> = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  pv: 'phrasal',
  idm: 'idiom',
  phr: 'phrase',
  conj: 'conjunction',
  prep: 'preposition',
};

const CEFRS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const list = (s?: string) =>
  s
    ?.split(';')
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * Satır başına bir kelime:
 *   kelime | /ipa/ | tür | CEFR | Türkçe anlam | örnek cümle | örnek çevirisi | eş anlamlılar (;) | kalıplar (;)
 * Boş satırlar ve # ile başlayan satırlar yok sayılır.
 */
export function parseVocab(deckId: string, raw: string): Word[] {
  const out: Word[] = [];
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [word, ipa, pos, cefr, meaning, en, tr, syn, col] = t.split('|').map((x) => x.trim());
    if (!POS[pos] || !CEFRS.has(cefr) || !meaning || !en) throw new Error(`Hatalı sözlük satırı (${deckId}): ${t}`);
    const synonyms = list(syn);
    const collocations = list(col);
    out.push({
      id: slugify(word),
      word,
      ipa,
      pos: POS[pos],
      cefr: cefr as Cefr,
      meaning,
      examples: [{ en, tr: tr ?? '' }],
      ...(synonyms?.length ? { synonyms } : {}),
      ...(collocations?.length ? { collocations } : {}),
      deckId,
    });
  }
  return out;
}
