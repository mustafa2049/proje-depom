/** Metinden kelime çıkarma yardımcıları (OCR ve altyazı analizi). */

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

export function splitByTerm(text: string, term: string): { text: string; match: boolean }[] {
  const t = term.trim();
  if (!t) return [{ text, match: false }];
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // "run into" → "ran into" gibi düzensiz çekimleri yakalamak zor; ek toleransı: -s, -ed, -ing, -d, -es
  const stem = escaped.replace(/e$/, '');
  const re = new RegExp(`\\b(${escaped}|${stem}(?:s|es|ed|d|ing|ly)?)\\b`, 'gi');
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
