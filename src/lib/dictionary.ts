import { slugify } from '../data/words';
import type { Cefr, PartOfSpeech, Word } from './types';

/**
 * Kelime bilgisini otomatik doldurur:
 *  1) Önce yerel sözlükte arar,
 *  2) Bulamazsa ücretsiz Free Dictionary API (fonetik, tür, örnek, eş anlam) ve
 *     MyMemory çeviri API'si (Türkçe karşılık) ile internetten tamamlar.
 */

const POS_MAP: Record<string, PartOfSpeech> = {
  noun: 'noun',
  verb: 'verb',
  adjective: 'adjective',
  adverb: 'adverb',
  conjunction: 'conjunction',
  phrase: 'phrase',
  idiom: 'idiom',
};

export interface LookupResult {
  word: Word;
  source: 'local' | 'online' | 'partial';
}

interface DictEntry {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string }[];
  meanings?: {
    partOfSpeech: string;
    synonyms?: string[];
    definitions: { definition: string; example?: string; synonyms?: string[] }[];
  }[];
}

async function fetchJson<T>(url: string, timeoutMs = 7000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export async function translateToTurkish(text: string): Promise<string | null> {
  try {
    const data = await fetchJson<{ responseData?: { translatedText?: string }; responseStatus?: number }>(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|tr`,
    );
    const out = data.responseData?.translatedText?.trim();
    if (!out || out.toLowerCase() === text.toLowerCase() || /MYMEMORY WARNING/i.test(out)) return null;
    return out;
  } catch {
    return null;
  }
}

function guessCefr(word: string): Cefr {
  const len = word.replace(/\s/g, '').length;
  if (len <= 4) return 'A2';
  if (len <= 6) return 'B1';
  if (len <= 9) return 'B2';
  return 'C1';
}

export async function lookupOnline(raw: string, deckId: string): Promise<LookupResult | null> {
  const text = raw.trim();
  if (!text) return null;
  let entry: DictEntry | null = null;
  try {
    const data = await fetchJson<DictEntry[]>(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text.toLowerCase())}`);
    entry = data[0] ?? null;
  } catch {
    entry = null;
  }
  const meaningTr = await translateToTurkish(text);
  if (!entry && !meaningTr) return null;

  const meaning = entry?.meanings?.[0];
  const ipa = entry?.phonetic ?? entry?.phonetics?.find((p) => p.text)?.text ?? '';
  const examples: { en: string; tr: string }[] = [];
  for (const m of entry?.meanings ?? []) {
    for (const d of m.definitions) {
      if (d.example && examples.length < 2) examples.push({ en: d.example, tr: '' });
    }
  }
  await Promise.all(
    examples.map(async (e) => {
      e.tr = (await translateToTurkish(e.en)) ?? '';
    }),
  );
  const synonyms = Array.from(
    new Set([...(meaning?.synonyms ?? []), ...(meaning?.definitions.flatMap((d) => d.synonyms ?? []) ?? [])]),
  ).slice(0, 4);
  const pos: PartOfSpeech = text.includes(' ') ? 'phrase' : POS_MAP[meaning?.partOfSpeech ?? ''] ?? 'noun';

  return {
    source: entry && meaningTr ? 'online' : 'partial',
    word: {
      id: slugify(text),
      word: text,
      ipa: ipa ? (ipa.startsWith('/') ? ipa : `/${ipa}/`) : '',
      pos,
      cefr: guessCefr(text),
      meaning: meaningTr ?? '',
      examples,
      synonyms,
      deckId,
      custom: true,
    },
  };
}
