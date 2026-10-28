/**
 * Doğal ses katmanı.
 *
 * 1. Hazır kayıtlar: sözlükteki kelimeler, örnek cümleler ve modül metinleri Kokoro (af_heart)
 *    ile önceden seslendirilip `public/voice/<anahtar>.ogg` olarak uygulamaya gömülür
 *    (bkz. scripts/voice). Anahtar, metnin normalize edilmiş halinin cyrb53 özetidir;
 *    böylece aynı cümle hangi ekranda geçerse geçsin aynı kayıt çalar. İnternet gerekmez.
 * 2. Yapay zekâ sesi: kayıtta olmayan İngilizce metinler (sohbet, yapay zekâ cümleleri, kendi
 *    eklediğin kelimeler) çevrimiçiyken Groq Orpheus ile seslendirilir ve cihazda önbelleğe alınır.
 *
 * İkisi de kullanılamazsa speech.ts cihazın ses motoruna döner.
 */

import { aiAvailable, AiError, RateLimitError, synthesizeSpeech, TermsError } from './ai';

/** Kayıtlar Kokoro'da 0.9 hızında üretildi: varsayılan telaffuz hızı (0.9x) kaydın doğal hızıdır. */
const CLIP_RATE = 0.9;
/** Orpheus tek istekte en fazla 200 karakter okur. */
const AI_CHUNK = 200;
const AI_MAX_CHUNKS = 3;
const AI_CACHE = 'lexilearn-ai-voice';
const AI_STATE_KEY = 'lexilearn:aiVoiceState';

export function normalizeForVoice(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** cyrb53 (53 bit) — scripts/voice/voicekey.py ile birebir aynı sonucu verir. */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function voiceKey(text: string): string {
  return cyrb53(normalizeForVoice(text)).toString(36);
}

// ── Hazır kayıtlar ──

interface VoiceIndex {
  voice: string;
  /** anahtar → süre (ms) */
  clips: Record<string, number>;
  /** anahtar → [karakter konumu, ms] kelime zamanları (hikâye ve sahne metinleri için) */
  marks: Record<string, [number, number][]>;
}

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

let indexPromise: Promise<VoiceIndex | null> | undefined;

export function loadVoiceIndex(): Promise<VoiceIndex | null> {
  indexPromise ??= fetch(assetUrl('voice/index.json'))
    .then((r) => (r.ok ? (r.json() as Promise<VoiceIndex>) : null))
    .catch(() => null);
  return indexPromise;
}

/** Metnin hazır kaydı varsa adresini ve kelime zamanlarını döner. */
export async function bundledClip(text: string): Promise<{ src: string; marks?: [number, number][] } | null> {
  const index = await loadVoiceIndex();
  const key = voiceKey(text);
  if (!index?.clips[key]) return null;
  return { src: assetUrl(`voice/${key}.ogg`), marks: index.marks[key] };
}

// ── Yapay zekâ sesi (Groq Orpheus) ──

export type AiVoiceStatus = 'ready' | 'terms' | 'limited' | 'offline' | 'nokey';

interface AiVoiceState {
  /** Model şartları kabul edilmemiş: bu zamana kadar deneme */
  termsUntil?: number;
  /** Kota doldu: bu zamana kadar deneme */
  limitedUntil?: number;
}

function readAiState(): AiVoiceState {
  try {
    return JSON.parse(localStorage.getItem(AI_STATE_KEY) ?? '{}') as AiVoiceState;
  } catch {
    return {};
  }
}

function writeAiState(s: AiVoiceState): void {
  try {
    localStorage.setItem(AI_STATE_KEY, JSON.stringify(s));
  } catch {
    // Depolama yoksa durum yalnızca bu oturumda geçerli olur.
  }
}

export function aiVoiceStatus(now = Date.now()): AiVoiceStatus {
  const s = readAiState();
  if ((s.termsUntil ?? 0) > now) return 'terms';
  if ((s.limitedUntil ?? 0) > now) return 'limited';
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';
  return aiAvailable() ? 'ready' : 'nokey';
}

/** Ayarlardaki "Tekrar dene": bekleme sürelerini siler. */
export function resetAiVoiceState(): void {
  writeAiState({});
}

/** Uzun metni cümle sınırlarından ≤200 karakterlik parçalara böler; sığmazsa null. */
export function splitForAi(text: string): string[] | null {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  if (clean.length <= AI_CHUNK) return [clean];
  const sentences = clean.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [clean];
  const chunks: string[] = [];
  let cur = '';
  for (const s of sentences.map((x) => x.trim())) {
    if (s.length > AI_CHUNK) return null;
    if (cur && cur.length + 1 + s.length > AI_CHUNK) {
      chunks.push(cur);
      cur = s;
    } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) chunks.push(cur);
  return chunks.length <= AI_MAX_CHUNKS ? chunks : null;
}

const memoryUrls = new Map<string, string>();

async function cachedAiClip(text: string): Promise<string> {
  const key = voiceKey(text);
  const hit = memoryUrls.get(key);
  if (hit) return hit;
  const cacheReq = `https://lexilearn.local/ai-voice/${key}.wav`;
  let blob: Blob | undefined;
  try {
    const cache = await caches.open(AI_CACHE);
    const res = await cache.match(cacheReq);
    if (res) blob = await res.blob();
  } catch {
    // Cache Storage yoksa yalnızca bellekte tutulur.
  }
  if (!blob) {
    blob = await synthesizeSpeech(text);
    try {
      const cache = await caches.open(AI_CACHE);
      await cache.put(cacheReq, new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/wav' } }));
    } catch {
      // Önbelleğe yazılamadıysa bir sonraki seferde yeniden istenir.
    }
  }
  const url = URL.createObjectURL(blob);
  memoryUrls.set(key, url);
  return url;
}

/** Metni Orpheus ile seslendirir (önbellekli); kullanılamıyorsa null. */
export async function aiClips(text: string): Promise<string[] | null> {
  if (aiVoiceStatus() !== 'ready') return null;
  const chunks = splitForAi(text);
  if (!chunks) return null;
  try {
    const urls: string[] = [];
    for (const c of chunks) urls.push(await cachedAiClip(c));
    return urls;
  } catch (e) {
    if (e instanceof TermsError) writeAiState({ ...readAiState(), termsUntil: Date.now() + 6 * 3600_000 });
    else if (e instanceof RateLimitError) writeAiState({ ...readAiState(), limitedUntil: Date.now() + Math.max(60, e.retryAfter) * 1000 });
    else if (!(e instanceof AiError)) console.warn('Yapay zekâ sesi alınamadı', e);
    return null;
  }
}

/** Ayarlardaki "Tekrar dene": bekleme sürelerini silip örnek cümleyi yapay zekâ sesiyle okur. */
export async function testAiVoice(text: string, rate: number): Promise<{ ok: boolean; status: AiVoiceStatus }> {
  resetAiVoiceState();
  const urls = await aiClips(text);
  if (urls) await playClips(urls, { rate, text });
  return { ok: Boolean(urls), status: aiVoiceStatus() };
}

// ── Çalma ──

let audio: HTMLAudioElement | null = null;
let stopCurrent: (() => void) | null = null;

export function stopClip(): void {
  stopCurrent?.();
}

export interface ClipOptions {
  rate: number;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
  /** Kelime zamanları yoksa vurgu, süreye oranla tahmin edilip kelime başına hizalanır */
  marks?: [number, number][];
  text: string;
}

/**
 * Kayıtları sırayla çalar. Çalma başlayamazsa (ör. dosya yok) false döner ve onEnd çağrılmaz;
 * başladıktan sonra bitince, hata olunca veya durdurulunca onEnd bir kez çağrılır.
 */
export function playClips(srcs: string[], opts: ClipOptions): Promise<boolean> {
  stopClip();
  const el = (audio ??= new Audio());
  let finished = false;
  let started = false;
  let raf = 0;
  let lastChar = -1;
  let part = 0;

  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    el.onended = null;
    el.onerror = null;
    if (stopCurrent === stop) stopCurrent = null;
    opts.onEnd?.();
  };
  const stop = () => {
    el.pause();
    finish();
  };
  stopCurrent = stop;

  const tick = () => {
    if (finished || !opts.onBoundary) return;
    let ch = -1;
    if (opts.marks && srcs.length === 1) {
      const ms = el.currentTime * 1000;
      for (const [c, t] of opts.marks) {
        if (t > ms) break;
        ch = c;
      }
    } else if (el.duration > 0) {
      const est = Math.floor(((part + el.currentTime / el.duration) / srcs.length) * opts.text.length);
      ch = est - (opts.text.slice(0, est).match(/\S*$/)?.[0].length ?? 0);
    }
    if (ch >= 0 && ch !== lastChar) {
      lastChar = ch;
      opts.onBoundary(ch);
    }
    raf = requestAnimationFrame(tick);
  };

  const load = (i: number) => {
    el.src = srcs[i];
    el.playbackRate = Math.min(2, Math.max(0.5, opts.rate / CLIP_RATE));
    el.preservesPitch = true;
    return el.play();
  };

  return new Promise<boolean>((resolve) => {
    el.onended = () => {
      if (part + 1 < srcs.length) {
        part++;
        load(part).catch(finish);
      } else finish();
    };
    el.onerror = () => {
      if (started) finish();
    };
    load(0).then(
      () => {
        if (!finished) {
          started = true;
          raf = requestAnimationFrame(tick);
        }
        resolve(true);
      },
      () => {
        // Başlamadan durdurulduysa (yeni okuma geldi) geri dönüşe gerek yok.
        if (finished) return resolve(true);
        // Çalma başlamadı: cihaz sesine dönülecek, bu yüzden onEnd çağrılmaz.
        finished = true;
        el.onended = null;
        el.onerror = null;
        if (stopCurrent === stop) stopCurrent = null;
        resolve(false);
      },
    );
  });
}
