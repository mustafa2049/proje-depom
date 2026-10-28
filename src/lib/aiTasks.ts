/** Uygulamanın yapay zekâ görevleri: istem (prompt) metinleri ve yanıt doğrulama. */

import type { Story } from '../data/modules';
import { chatJson, CREATIVE_MODEL } from './ai';
import { slugify } from './slug';
import type { Cefr, CoachReport, PartOfSpeech, Word } from './types';

const TEACHER = 'Sen Türk öğrencilere İngilizce öğreten deneyimli ve sıcak bir öğretmensin. Açıklamaları kısa, net ve doğal Türkçeyle yaz.';
const POS_SET = new Set<PartOfSpeech>(['noun', 'verb', 'adjective', 'adverb', 'phrasal', 'idiom', 'phrase', 'conjunction', 'preposition']);
const CEFR_SET = new Set<Cefr>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const str = (v: unknown, max = 400): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const strList = (v: unknown, max = 5, len = 80): string[] => (Array.isArray(v) ? v.map((x) => str(x, len)).filter(Boolean).slice(0, max) : []);

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

// ── Yanlış cevap açıklaması ──

export interface AiMistakeExplanation {
  explanation: string;
  confusedWith?: { word: string; meaning: string };
  tip: string;
}

export async function aiExplainMistake(word: Word, answer: string, reverse: boolean): Promise<AiMistakeExplanation> {
  const task = reverse
    ? `Öğrenciye Türkçe "${word.meaning}" verildi, İngilizcesini sordu. Doğru cevap "${word.word}". Öğrenci "${answer}" yazdı.`
    : `Öğrenciye İngilizce "${word.word}" (${word.pos}) verildi, Türkçe anlamını sordu. Doğru cevap "${word.meaning}". Öğrenci "${answer}" yazdı.`;
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `${task}
Öğrencinin cevabı neden yanlış ya da eksik? Muhtemelen hangi kelimeyle karıştırdı? Farkı kısaca açıkla.
Cevap aslında kabul edilebilir bir eş anlamlıysa bunu açıkça söyle.
JSON anahtarları: explanation (2-3 cümle Türkçe açıklama),
confusedWith (karıştırılan İngilizce kelime varsa {word, meaning: Türkçe anlamı}, yoksa null),
tip (bir daha karıştırmamak için tek cümlelik Türkçe ipucu).`,
    1000,
  );
  const cw = r.confusedWith as Record<string, unknown> | null | undefined;
  const explanation = str(r.explanation, 600);
  if (!explanation) throw new Error('Açıklama oluşturulamadı.');
  return {
    explanation,
    confusedWith: cw && str(cw.word, 60) ? { word: str(cw.word, 60), meaning: str(cw.meaning, 120) } : undefined,
    tip: str(r.tip, 300),
  };
}

// ── Yeni örnek cümleler ──

export async function aiExamples(word: Word, count = 3): Promise<{ en: string; tr: string }[]> {
  const known = word.examples.map((e) => e.en).join(' | ');
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `İngilizce "${word.word}" (${word.pos}, ${word.cefr}, anlamı: ${word.meaning}) için ${count} yeni örnek cümle yaz.
Cümleler birbirinden farklı bağlamlarda olsun (iş, günlük hayat, duygular, seyahat gibi), doğal ve ${word.cefr} seviyesine uygun olsun,
kelimeyi (gerekirse çekimli haliyle) içersin. Şunları tekrar etme: ${known || '—'}
JSON: {"examples": [{"en": "...", "tr": "doğal Türkçe çevirisi"}]}`,
    1200,
  );
  const out = (Array.isArray(r.examples) ? r.examples : [])
    .map((e) => ({ en: str((e as Record<string, unknown>)?.en, 300), tr: str((e as Record<string, unknown>)?.tr, 300) }))
    .filter((e) => e.en)
    .slice(0, count);
  if (!out.length) throw new Error('Örnek cümle oluşturulamadı.');
  return out;
}

// ── Kendi cümleni kur ──

export interface AiSentenceCheck {
  correctUsage: boolean;
  score: number;
  corrected: string;
  feedback: string;
  natural?: string;
}

export async function aiCheckSentence(word: Word, sentence: string): Promise<AiSentenceCheck> {
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `Öğrenci "${word.word}" (${word.meaning}) kelimesini kullanarak şu cümleyi kurdu:
"""${sentence.slice(0, 500)}"""
Kelimeyi anlamına uygun ve dilbilgisi açısından doğru kullanmış mı değerlendir.
JSON anahtarları: correctUsage (hedef kelime anlamına uygun kullanıldı mı, boolean),
score (cümlenin genel doğruluk ve doğallık puanı, 0-100 tam sayı),
corrected (cümlenin düzeltilmiş hali; hata yoksa aynen tekrar et),
feedback (1-2 cümle Türkçe geri bildirim; önce olumlu bir şey söyle, sonra varsa hatayı açıkla),
natural (aynı anlamı anadili İngilizce olan birinin söyleyeceği daha doğal bir alternatif; gerek yoksa boş).`,
    1200,
  );
  const score = Number(r.score);
  return {
    correctUsage: r.correctUsage === true,
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : r.correctUsage === true ? 80 : 40,
    corrected: str(r.corrected, 600),
    feedback: str(r.feedback, 500),
    natural: str(r.natural, 600) || undefined,
  };
}

// ── Boşluk doldurma seti ──

export interface AiClozeItem {
  wordId: string;
  sentence: string;
  answer: string;
  tr: string;
}

export async function aiClozeSet(words: Word[]): Promise<AiClozeItem[]> {
  const list = words.map((w) => `${w.id} = ${w.word} (${w.meaning})`).join('\n');
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `Her kelime için bağlamdan tahmin edilebilecek, yeni ve doğal bir İngilizce boşluk doldurma cümlesi yaz.
Kelimenin cümledeki halini (çekimli olabilir) "___" ile değiştir; cümlede yalnızca bir boşluk olsun.
Cümle, diğer kelimelerden hangisinin geleceğini ayırt ettirecek kadar ipucu içersin.
Kelimeler (kimlik = kelime (anlam)):
${list}
JSON: {"items": [{"id": "kimlik", "sentence": "boşluklu cümle", "answer": "boşluğa gelen tam hali", "tr": "cümlenin Türkçesi"}]}`,
    2500,
  );
  const ids = new Set(words.map((w) => w.id));
  const seen = new Set<string>();
  return (Array.isArray(r.items) ? r.items : [])
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return { wordId: str(o.id, 80), sentence: str(o.sentence, 400), answer: str(o.answer, 80), tr: str(o.tr, 400) };
    })
    .filter((it) => {
      if (!ids.has(it.wordId) || seen.has(it.wordId) || !it.answer || (it.sentence.match(/_{2,}/g) ?? []).length !== 1) return false;
      seen.add(it.wordId);
      return true;
    })
    .map((it) => ({ ...it, sentence: it.sentence.replace(/_{2,}/, '___') }));
}

// ── Haftalık koç raporu ──

export async function aiCoach(stats: string): Promise<CoachReport> {
  const r = await chatJson<Record<string, unknown>>(
    `${TEACHER} Aynı zamanda motive eden ama gerçekçi bir çalışma koçusun.`,
    `Öğrencinin Leitner kelime kartı uygulamasındaki istatistikleri:
${stats}

Bu verilere dayanarak kısa bir haftalık koçluk raporu yaz. Sayılara ve kelimelere somut olarak atıf yap, genel geçer tavsiye verme.
JSON anahtarları: headline (en fazla 8 kelimelik Türkçe başlık), summary (2-3 cümlelik genel değerlendirme),
strengths (2 madde: iyi giden şeyler), focus (2-3 madde: zorlandığı kelimeler/kelime türleri ve nedenleri),
plan (3 madde: bu hafta için somut, uygulamadaki modüllere atıf yapan eylem planı; modüller: Aktif Hatırlama Quiz,
Karıştırılan Kelimeler, Kalıp & Kolokasyon, Sohbet Partneri, Akıllı Boşluk Doldurma, Mikro Yazma, Telaffuz Laboratuvarı, İnatçı Kelimeler Kliniği).`,
    1800,
  );
  const summary = str(r.summary, 600);
  if (!summary) throw new Error('Rapor oluşturulamadı.');
  return {
    headline: str(r.headline, 80) || 'Haftalık Değerlendirme',
    summary,
    strengths: strList(r.strengths, 3, 300),
    focus: strList(r.focus, 3, 300),
    plan: strList(r.plan, 4, 300),
    createdAt: Date.now(),
  };
}

// ── Metinden kelime çıkarma ──

export async function aiExtractVocab(text: string, level: string, deckId: string, skip: string[]): Promise<Word[]> {
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `Aşağıdaki İngilizce metinden ${level} seviyesindeki bir öğrencinin henüz bilmiyor olabileceği, öğrenmeye değer en fazla 12 kelime veya kalıp seç.
Öğrencinin seviyesinde ya da üstündeki kelimeleri seç; A1-A2 seviyesindeki temel kelimeleri (government, warn gibi), özel isimleri ve şunları atla: ${skip.slice(0, 80).join(', ') || '—'}.
"word" alanı MUTLAKA sözlük hali olsun, metindeki çekimli hali değil (grappling → grapple, economists → economist,
cutting down on → cut down on, households → household). Phrasal verb ve deyimleri bütün olarak al.
Metin:
"""${text.slice(0, 6000)}"""

JSON: {"words": [{"word", "ipa" (eğik çizgisiz İngiliz IPA), "pos" (noun|verb|adjective|adverb|phrasal|idiom|phrase|conjunction|preposition),
"cefr" (A1-C2), "meaning" (metindeki anlamına uygun 1-3 Türkçe karşılık), "example": {"en": metinden kelimeyi içeren cümle, "tr": Türkçesi},
"synonyms" (en fazla 3), "collocations" (en fazla 2)}]}`,
    4000,
  );
  return (Array.isArray(r.words) ? r.words : [])
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      const word = str(o.word, 60);
      const meaning = str(o.meaning, 120);
      const ex = (o.example ?? {}) as Record<string, unknown>;
      const ipa = str(o.ipa, 60).replace(/^\/|\/$/g, '');
      return {
        id: slugify(word),
        word,
        ipa: ipa ? `/${ipa}/` : '',
        pos: POS_SET.has(o.pos as PartOfSpeech) ? (o.pos as PartOfSpeech) : word.includes(' ') ? 'phrase' : 'noun',
        cefr: CEFR_SET.has(o.cefr as Cefr) ? (o.cefr as Cefr) : 'B1',
        meaning,
        examples: str(ex.en) ? [{ en: str(ex.en), tr: str(ex.tr) }] : [],
        synonyms: strList(o.synonyms, 3),
        collocations: strList(o.collocations, 2),
        deckId,
        custom: true,
      } satisfies Word;
    })
    .filter((w) => w.word && w.meaning && w.id)
    .slice(0, 12);
}

// ── Sohbet partneri ──

export interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  tr?: string;
  correction?: { fixed: string; note: string };
}

export interface ChatTurn {
  reply: string;
  tr: string;
  correction?: { fixed: string; note: string };
  suggestions: string[];
}

function transcript(history: ChatMessage[]): string {
  return history
    .slice(-16)
    .map((m) => `${m.role === 'ai' ? 'PARTNER' : 'ÖĞRENCİ'}: ${m.text}`)
    .join('\n');
}

export async function aiChatTurn(scenario: string, level: string, targets: string[], history: ChatMessage[]): Promise<ChatTurn> {
  const last = [...history].reverse().find((m) => m.role === 'user');
  const r = await chatJson<Record<string, unknown>>(
    `Bir İngilizce konuşma pratiği partnerisin. Senaryo: ${scenario}
Rolünde kal, öğrenci ${level} seviyesinde: kısa (1-3 cümle), doğal ve günlük İngilizce konuş, her yanıtta konuşmayı sürdüren bir soru sor.
Uygun düştüğünde şu hedef kelimelerden birini kullanmasını teşvik edecek sorular sor: ${targets.join(', ') || '—'}.`,
    `Konuşma şu ana kadar:
${transcript(history) || '(henüz başlamadı; senaryoya uygun şekilde ilk repliği sen söyle)'}

JSON anahtarları: reply (rolündeki İngilizce yanıtın), tr (yanıtının Türkçesi),
correction (${last ? `öğrencinin son cümlesi "${last.text}" dilbilgisi hatası veya çok doğal olmayan bir ifade içeriyorsa {fixed: düzeltilmiş hali, note: kısa Türkçe açıklama}, cümle doğruysa null` : 'null'}),
suggestions (öğrencinin verebileceği 2 kısa, farklı İngilizce cevap örneği).`,
    1000,
    CREATIVE_MODEL,
  );
  const reply = str(r.reply, 600);
  if (!reply) throw new Error('Yanıt alınamadı.');
  const c = r.correction as Record<string, unknown> | null | undefined;
  const fixed = c ? str(c.fixed, 400) : '';
  return {
    reply,
    tr: str(r.tr, 600),
    correction: fixed && last && fixed.toLowerCase() !== last.text.trim().toLowerCase() ? { fixed, note: str(c?.note, 300) } : undefined,
    suggestions: strList(r.suggestions, 2, 200),
  };
}

export interface ChatReview {
  score: number;
  summary: string;
  mistakes: { original: string; fix: string; note: string }[];
  phrases: { en: string; tr: string }[];
}

export async function aiChatReview(scenario: string, history: ChatMessage[]): Promise<ChatReview> {
  const userLines = history.filter((m) => m.role === 'user').map((m) => m.text);
  const r = await chatJson<Record<string, unknown>>(
    TEACHER,
    `Öğrenci şu senaryoda İngilizce konuşma pratiği yaptı: ${scenario}
Bağlam için konuşmanın tamamı:
${transcript(history)}

Değerlendirilecek öğrenci cümleleri (PARTNER satırlarını asla değerlendirme ya da düzeltme):
${userLines.map((t, i) => `${i + 1}. ${t}`).join('\n')}

JSON anahtarları:
score (akıcılık, doğruluk ve kelime çeşitliliği puanı, 0-100 tam sayı), summary (2 cümle Türkçe değerlendirme, önce olumlu),
mistakes (yalnızca yukarıdaki öğrenci cümlelerindeki gerçek hatalar, en fazla 4 adet {original: öğrencinin cümlesindeki hatalı parça, fix, note: kısa Türkçe açıklama}),
phrases (bu senaryoda işine yarayacak, öğrencinin kullanmadığı 3 doğal İngilizce kalıp {en, tr}).`,
    1800,
  );
  const score = Number(r.score);
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const said = userLines.map(norm);
  return {
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 60,
    summary: str(r.summary, 600),
    mistakes: (Array.isArray(r.mistakes) ? r.mistakes : [])
      .map((x) => {
        const o = (x ?? {}) as Record<string, unknown>;
        return { original: str(o.original, 300), fix: str(o.fix, 300), note: str(o.note, 300) };
      })
      // Model bazen partnerin cümlelerini de "düzeltir": yalnızca öğrencinin söylediklerini tut
      .filter((m) => m.fix && said.some((t) => t.includes(norm(m.original).slice(0, 24))))
      // Aynı hatanın farklı uzunluktaki tekrarlarını ele
      .filter((m, i, all) => !all.slice(0, i).some((p) => norm(p.fix).includes(norm(m.fix)) || norm(m.fix).includes(norm(p.fix))))
      .slice(0, 4),
    phrases: (Array.isArray(r.phrases) ? r.phrases : [])
      .map((x) => ({ en: str((x as Record<string, unknown>)?.en, 200), tr: str((x as Record<string, unknown>)?.tr, 200) }))
      .filter((p) => p.en)
      .slice(0, 3),
  };
}
