/** Uygulamanın yapay zekâ görevleri: istem (prompt) metinleri ve yanıt doğrulama. */

import type { Story } from '../data/modules';
import { chatJson, CREATIVE_MODEL } from './ai';
import { slugify } from './slug';
import type { Cefr, PartOfSpeech, Word } from './types';

const TEACHER = 'Sen Türk öğrencilere İngilizce öğreten deneyimli ve sıcak bir öğretmensin. Açıklamaları kısa, net ve doğal Türkçeyle yaz.';
const POS_SET = new Set<PartOfSpeech>(['noun', 'verb', 'adjective', 'adverb', 'phrasal', 'idiom', 'phrase', 'conjunction', 'preposition']);
const CEFR_SET = new Set<Cefr>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const str = (v: unknown, max = 400): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const strList = (v: unknown, max = 5): string[] => (Array.isArray(v) ? v.map((x) => str(x, 80)).filter(Boolean).slice(0, max) : []);

// ── Kelime bilgisi ──

export async function aiWordInfo(text: string, deckId: string): Promise<Word> {
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `İngilizce "${text}" kelimesi/ifadesi için sözlük kartı hazırla. JSON anahtarları:
ipa (İngiliz IPA, eğik çizgiler olmadan), pos (noun|verb|adjective|adverb|phrasal|idiom|phrase|conjunction|preposition),
cefr (A1-C2), meaning (en yaygın 1-3 Türkçe karşılık, virgülle), examples (2 adet {en, tr}; en cümlesi kelimeyi aynen içersin, günlük ve doğal olsun),
synonyms (en fazla 4 İngilizce), collocations (en fazla 3 sık kullanılan İngilizce kalıp), mnemonic (Türk öğrenci için kısa, akılda kalıcı Türkçe hafıza ipucu).`,
  );
  const pos = POS_SET.has(r.pos as PartOfSpeech) ? (r.pos as PartOfSpeech) : text.includes(' ') ? 'phrase' : 'noun';
  const cefr = CEFR_SET.has(r.cefr as Cefr) ? (r.cefr as Cefr) : 'B1';
  const ipa = str(r.ipa, 60).replace(/^\/|\/$/g, '');
  const examples = (Array.isArray(r.examples) ? r.examples : [])
    .map((e) => ({ en: str((e as Record<string, unknown>)?.en), tr: str((e as Record<string, unknown>)?.tr) }))
    .filter((e) => e.en)
    .slice(0, 2);
  const meaning = str(r.meaning, 120);
  if (!meaning) throw new Error('Anlam bulunamadı.');
  return {
    id: slugify(text),
    word: text,
    ipa: ipa ? `/${ipa}/` : '',
    pos,
    cefr,
    meaning,
    examples,
    synonyms: strList(r.synonyms, 4),
    collocations: strList(r.collocations, 3),
    mnemonic: str(r.mnemonic, 300) || undefined,
    deckId,
    custom: true,
  };
}

// ── Yazma geri bildirimi ──

export interface AiWritingFeedback {
  corrected: string;
  level: string;
  score: number;
  summary: string;
  errors: { original: string; fix: string; explanation: string }[];
  upgrades: { from: string; to: string; note: string }[];
  targets: { word: string; ok: boolean; comment: string }[];
}

export async function aiWritingFeedback(text: string, targets: string[], prompt: string): Promise<AiWritingFeedback> {
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `Öğrencinin görevi: "${prompt}"
Kullanması gereken hedef kelimeler: ${targets.join(', ')}
Öğrencinin metni:
"""${text.slice(0, 2000)}"""

JSON anahtarları:
corrected (metnin dilbilgisi ve doğallık açısından düzeltilmiş hali, anlamı koru),
level (tahmini CEFR seviyesi, örn. "B1+"), score (metnin doğruluk ve doğallık puanı: 0 ile 100 arasında tam sayı, örn. 72),
summary (1-2 cümlelik Türkçe genel değerlendirme, önce olumlu bir şey söyle),
errors (en fazla 5 adet {original: hatalı parça, fix: doğrusu, explanation: kısa Türkçe açıklama}),
upgrades (en fazla 3 adet {from, to, note}: daha üst seviye/doğal ifade önerisi, note Türkçe),
targets (her hedef kelime için {word, ok: doğru ve doğal kullanıldı mı (boolean), comment: kısa Türkçe yorum}).`,
    2000,
  );
  const list = <T,>(v: unknown, map: (x: Record<string, unknown>) => T, max: number): T[] =>
    (Array.isArray(v) ? v : []).slice(0, max).map((x) => map((x ?? {}) as Record<string, unknown>));
  const errorCount = Array.isArray(r.errors) ? r.errors.length : 0;
  const rawScore = Number(r.score);
  // Model puanı vermezse hata sayısından makul bir puan türet
  const score = Number.isFinite(rawScore) && rawScore > 0 ? rawScore : Math.max(30, 100 - errorCount * 12);
  return {
    corrected: str(r.corrected, 3000),
    level: str(r.level, 6) || '—',
    score: Math.max(0, Math.min(100, Math.round(score))),
    summary: str(r.summary, 400),
    errors: list(r.errors, (x) => ({ original: str(x.original, 200), fix: str(x.fix, 200), explanation: str(x.explanation, 300) }), 5).filter((e) => e.fix),
    upgrades: list(r.upgrades, (x) => ({ from: str(x.from, 200), to: str(x.to, 200), note: str(x.note, 200) }), 3).filter((u) => u.from && u.to),
    targets: list(r.targets, (x) => ({ word: str(x.word, 60), ok: x.ok === true, comment: str(x.comment, 200) }), 6),
  };
}

// ── Kişisel mikro hikaye ──

export async function aiStory(words: { id: string; word: string; meaning: string }[], level: string): Promise<Story> {
  const list = words.map((w) => `${w.id} = ${w.word} (${w.meaning})`).join('\n');
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `Aşağıdaki kelimelerin hepsini kullanan, ${level} seviyesinde, 3 paragraflık kısa ve ilgi çekici bir İngilizce hikaye yaz.
Her hedef kelimeyi metinde [[kimlik|metindeki hali]] biçiminde işaretle (örn. [[run-into|ran into]], [[thrive|thrives]]).
Kelimeler (kimlik = kelime (anlam)):
${list}

JSON anahtarları: title (İngilizce başlık), paragraphs (3 adet {en: işaretli İngilizce paragraf, tr: paragrafın doğal Türkçe çevirisi}),
questions (2 adet anlama sorusu {q: İngilizce soru, options: 3 İngilizce seçenek, answer: doğru seçeneğin indeksi 0-2, explanation: kısa Türkçe açıklama}).`,
    2500,
  );
  const ids = new Set(words.map((w) => w.id));
  // Sorularda işaret istenmez: [[id|yüzey]] → yüzey
  const plain = (t: string) => t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, id: string, surface?: string) => surface ?? id);
  // Bilinmeyen kimlikli işaretleri düz metne çevir
  const clean = (t: string) => t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, id: string, surface?: string) => (ids.has(id.trim()) ? `[[${id.trim()}${surface ? `|${surface}` : ''}]]` : surface ?? id));
  const paragraphs = (Array.isArray(r.paragraphs) ? r.paragraphs : [])
    .map((p) => ({ en: clean(str((p as Record<string, unknown>)?.en, 1500)), tr: str((p as Record<string, unknown>)?.tr, 1500) }))
    .filter((p) => p.en)
    .slice(0, 4);
  const questions = (Array.isArray(r.questions) ? r.questions : [])
    .map((q) => {
      const o = q as Record<string, unknown>;
      const options = strList(o.options, 3).map(plain);
      return { q: plain(str(o.q, 300)), options, answer: Math.max(0, Math.min(options.length - 1, Number(o.answer) || 0)), explanation: str(o.explanation, 300) };
    })
    .filter((q) => q.q && q.options.length >= 2)
    .slice(0, 3);
  if (!paragraphs.length) throw new Error('Hikaye oluşturulamadı.');
  return { id: `ai-${Date.now()}`, title: str(r.title, 100) || 'My Story', level, minutes: 1, paragraphs, questions };
}

// ── Hafıza ipucu ──

export async function aiMnemonic(word: string, meaning: string): Promise<string> {
  const r = await chatJson<{ mnemonic?: string }>(
    TEACHER,
    `İngilizce "${word}" kelimesi Türkçede "${meaning}" demek. Öğrenci bu kelimeyi sürekli unutuyor.
Kelimenin okunuşuna benzeyen gerçek Türkçe kelimelerle kurulmuş, anlamla doğrudan bağlantılı canlı bir sahne anlatan
1-2 cümlelik, akılda kalıcı bir hafıza ipucu yaz. Okunuşu Türkçe harflerle tırnak içinde göster (örn. "e-ben-dın").
Zorlama veya anlamsız çağrışımlar kurma; iyi bir ses benzerliği yoksa kelime kökünü ya da güçlü bir görsel imgeyi kullan.
JSON: {"mnemonic": "..."}`,
    800,
    CREATIVE_MODEL,
  );
  const m = str(r.mnemonic, 400);
  if (!m) throw new Error('İpucu oluşturulamadı.');
  return m;
}
