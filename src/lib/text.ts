/** Metinden kelime çıkarma yardımcıları (OCR ve altyazı analizi). */

import type { Word } from './types';

// İngilizcede en sık kullanılan, öğrenme listesine eklemeye değmeyecek kelimeler.
const STOPWORDS = new Set(
  `a about above after again against all almost also am an and any are aren't as at be because been before being below
  between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each few for from
  further get gets got had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself him himself
  his how how's i i'd i'll i'm i've if in into is isn't it it's its itself just know let's like me more most mustn't my myself
  no nor not now of off oh ok okay on once only or other ought our ours ourselves out over own really right same shan't she
  she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves then there there's these
  they they'd they'll they're they've this those through to too under until up us very was wasn't we we'd we'll we're we've
  were weren't what what's when when's where where's which while who who's whom why why's will with won't would wouldn't yeah
  yes you you'd you'll you're you've your yours yourself yourselves go going gonna wanna gotta come came see saw say said
  tell told think thought want look make made take took give gave one two three time thing things way well back good new
  first last long great little man woman people day year mean something nothing anything everything someone anyone
  everyone hey hi hello please thanks thank sorry uh um huh mr mrs ms let us still even much many may might must shall
  every never always here there where again ever around away put need feel felt try tried call called keep kept`
    .split(/\s+/)
    .filter(Boolean),
);

export function isStopword(word: string): boolean {
  return STOPWORDS.has(word.toLowerCase());
}

/** .srt / .vtt altyazılarındaki zaman kodlarını, numaraları ve etiketleri temizler. */
export function cleanSubtitles(raw: string): string {
  return raw
    .replace(/^WEBVTT.*$/m, '')
    .replace(/^\d+\s*$/gm, '')
    .replace(/\d{1,2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[,.]\d{3}.*$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\{[^}]+\}/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export interface WordFrequency {
  word: string;
  count: number;
}

/** Metindeki öğrenmeye değer kelimeleri sıklığa göre döner. */
export function extractVocabulary(text: string, minLength = 4): WordFrequency[] {
  const counts = new Map<string, number>();
  for (const m of text.toLowerCase().matchAll(/[a-z]+(?:'[a-z]+)?/g)) {
    const w = m[0];
    if (w.length < minLength || isStopword(w) || w.includes("'")) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || b.word.length - a.word.length);
}

/** Metni kelime ve aradaki boşluk/noktalama parçalarına ayırır (dokunulabilir metin için). */
export function tokenize(text: string): { text: string; isWord: boolean }[] {
  const out: { text: string; isWord: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index), isWord: false });
    out.push({ text: m[0], isWord: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), isWord: false });
  return out;
}

/** Çekimli bir kelimenin olası sözlük biçimleri (ör. "thrived" → "thrive"). */
export function lemmaCandidates(token: string): string[] {
  const w = token.toLowerCase();
  const out = [w];
  if (w.endsWith('ies')) out.push(w.slice(0, -3) + 'y');
  if (w.endsWith('es')) out.push(w.slice(0, -2));
  if (w.endsWith('s')) out.push(w.slice(0, -1));
  if (w.endsWith('ied')) out.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ed')) out.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith('ing')) out.push(w.slice(0, -3), w.slice(0, -3) + 'e');
  if (w.endsWith('ly')) out.push(w.slice(0, -2));
  return out;
}

export function findWordId(token: string, ids: Record<string, unknown>): string | null {
  for (const c of lemmaCandidates(token)) if (c in ids) return c;
  return null;
}

/** Sık kullanılan düzensiz fiillerin geçmiş zaman ve -s/-ing biçimleri. */
const IRREGULAR: Record<string, string[]> = {
  be: ['am', 'is', 'are', 'was', 'were', 'been', 'being'],
  break: ['broke', 'broken'],
  bring: ['brought'],
  build: ['built'],
  buy: ['bought'],
  catch: ['caught'],
  choose: ['chose', 'chosen'],
  come: ['came'],
  cost: ['cost'],
  cut: ['cut'],
  do: ['did', 'done', 'does'],
  drink: ['drank', 'drunk'],
  drive: ['drove', 'driven'],
  eat: ['ate', 'eaten'],
  fall: ['fell', 'fallen'],
  feel: ['felt'],
  find: ['found'],
  fly: ['flew', 'flown', 'flies'],
  forget: ['forgot', 'forgotten'],
  forgive: ['forgave', 'forgiven'],
  get: ['got', 'gotten', 'getting'],
  give: ['gave', 'given'],
  go: ['went', 'gone', 'goes'],
  grow: ['grew', 'grown'],
  hang: ['hung'],
  have: ['had', 'has'],
  hide: ['hid', 'hidden'],
  hit: ['hit', 'hitting'],
  hold: ['held'],
  keep: ['kept'],
  know: ['knew', 'known'],
  lead: ['led'],
  leave: ['left'],
  lend: ['lent'],
  lose: ['lost'],
  make: ['made'],
  meet: ['met'],
  pay: ['paid'],
  put: ['put', 'putting'],
  run: ['ran', 'running'],
  say: ['said'],
  see: ['saw', 'seen'],
  sell: ['sold'],
  send: ['sent'],
  set: ['set', 'setting'],
  shut: ['shut', 'shutting'],
  sit: ['sat', 'sitting'],
  sleep: ['slept'],
  speak: ['spoke', 'spoken'],
  spend: ['spent'],
  stand: ['stood'],
  steal: ['stole', 'stolen'],
  swim: ['swam', 'swum', 'swimming'],
  take: ['took', 'taken'],
  teach: ['taught'],
  tell: ['told'],
  think: ['thought'],
  throw: ['threw', 'thrown'],
  understand: ['understood'],
  wake: ['woke', 'woken'],
  wear: ['wore', 'worn'],
  win: ['won', 'winning'],
  write: ['wrote', 'written'],
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Bir kelimenin çekimli hâllerini yakalayan düzenli ifade parçası. */
function inflections(word: string): string {
  const w = esc(word.toLowerCase());
  const stem = w.replace(/e$/, '');
  const forms = [`${w}`, `${stem}(?:s|es|ed|d|ing|ly)`];
  if (/y$/.test(w)) forms.push(`${w.slice(0, -1)}(?:ies|ied)`);
  // Ünsüz ikizleşmesi: stop → stopped, plan → planning, cancel → cancelled
  if (/[^aeiou][aeiou][bdglmnprt]$/.test(w)) forms.push(`${w}${w.slice(-1)}(?:ed|ing)`);
  for (const f of IRREGULAR[word.toLowerCase()] ?? []) forms.push(esc(f));
  return `(?:${forms.join('|')})`;
}

/**
 * Cümlede hedef kelimeyi bulur ve parçalara ayırır. Çekim eklerini (-s, -ed, -ing),
 * düzensiz fiilleri ("make" → "made") ve deyimlerde ilk kelimenin çekimini ("run into" → "ran into") tanır.
 */
export function splitByTerm(text: string, term: string): { text: string; match: boolean }[] {
  const t = term.trim();
  if (!t) return [{ text, match: false }];
  const parts = t.split(/\s+/);
  // Çok kelimeli ifadelerde ilk kelime çekimlenebilir, son kelime çoğul olabilir ("utility bills").
  const rest = parts.slice(1).map((p, i, arr) => (i === arr.length - 1 ? `${esc(p)}(?:s|es)?` : esc(p)));
  const pattern = parts.length === 1 ? inflections(parts[0]) : `${inflections(parts[0])}\\s+${rest.join('\\s+')}`;
  const re = new RegExp(`\\b${pattern}\\b`, 'gi');
  const out: { text: string; match: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index), match: false });
    out.push({ text: m[0], match: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), match: false });
  return out;
}

/**
 * Arama anahtarı: büyük/küçük harf ve aksan duyarsız, Türkçe harfler ASCII karşılığına indirgenir
 * ("Kaçınılmaz" ve "kacinilmaz" aynı anahtarı verir).
 */
export function searchKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SearchItem<T> {
  item: T;
  word: string;
  /** Kelime, anlam ve eş anlamlıların birleşik anahtarı */
  all: string;
}

/** Kelime listesinde arar: tam eşleşme, baştan eşleşme, kelime içinde, sonra anlam/eş anlamlı içinde. */
export function rankedSearch<T>(index: SearchItem<T>[], query: string): T[] {
  const q = searchKey(query);
  if (!q) return index.map((x) => x.item);
  const scored: { item: T; score: number; len: number }[] = [];
  for (const x of index) {
    let score: number;
    if (x.word === q) score = 0;
    else if (x.word.startsWith(q)) score = 1;
    else if (x.word.includes(q)) score = 2;
    else if (x.all.includes(q)) score = 3;
    else continue;
    scored.push({ item: x.item, score, len: x.word.length });
  }
  return scored.sort((a, b) => a.score - b.score || a.len - b.len).map((x) => x.item);
}

export function wordSearchIndex(words: Word[]): SearchItem<Word>[] {
  return words.map((w) => ({ item: w, word: searchKey(w.word), all: searchKey(`${w.word} ${w.meaning} ${(w.synonyms ?? []).join(' ')}`) }));
}
