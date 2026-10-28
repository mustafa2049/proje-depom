/**
 * Groq yapay zekâ katmanı (OpenAI uyumlu API).
 * Anahtar derleme sırasında .env.local içindeki VITE_GROQ_API_KEY'den gömülür;
 * Ayarlar ekranından girilen anahtar varsa o önceliklidir. Anahtar yoksa veya istek
 * başarısız olursa çağıran ekranlar kural tabanlı/çevrimdışı yöntemlere döner.
 */

const API = 'https://api.groq.com/openai/v1';
const CHAT_MODEL = 'openai/gpt-oss-120b';
/** Türkçe kelime oyunlarında (hafıza ipucu) daha başarılı model */
export const CREATIVE_MODEL = 'qwen/qwen3.8-27b';
const STT_MODEL = 'whisper-large-v3-turbo';
const KEY_STORAGE = 'lexilearn:groqKey';

export function getStoredKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function setStoredKey(key: string): void {
  try {
    if (key.trim()) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    // Depolama kullanılamıyorsa yalnızca gömülü anahtar kullanılır.
  }
}

export function hasBuiltInKey(): boolean {
  return Boolean(import.meta.env.VITE_GROQ_API_KEY);
}

function apiKey(): string {
  return getStoredKey() || (import.meta.env.VITE_GROQ_API_KEY as string | undefined) || '';
}

export function aiAvailable(): boolean {
  return Boolean(apiKey()) && (typeof navigator === 'undefined' || navigator.onLine);
}

export class AiError extends Error {}

/** Ücretsiz katmanın dakikalık token sınırı aşıldı; retryAfter saniye sonra yeniden denenebilir. */
class RateLimitError extends AiError {
  constructor(readonly retryAfter: number) {
    super('Ücretsiz kullanım sınırına ulaşıldı. Biraz sonra tekrar dene.');
  }
}

/** Model geçerli JSON üretemedi; aynı istek yeniden denenebilir. */
class BadOutputError extends AiError {}

// Groq'ta her modelin dakikalık token sınırı ayrıdır: biri dolarsa diğerine geçilir.
const FALLBACK_MODEL: Record<string, string> = {
  [CHAT_MODEL]: 'openai/gpt-oss-20b',
  [CREATIVE_MODEL]: CHAT_MODEL,
  'openai/gpt-oss-20b': CHAT_MODEL,
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post(path: string, body: BodyInit, json: boolean, timeoutMs: number): Promise<unknown> {
  const key = apiKey();
  if (!key) throw new AiError('Yapay zekâ anahtarı tanımlı değil.');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, ...(json ? { 'Content-Type': 'application/json' } : {}) },
      body,
      signal: ctrl.signal,
    });
    if (res.status === 401) throw new AiError('API anahtarı geçersiz. Ayarlardan yeni anahtar gir.');
    if (res.status === 429) throw new RateLimitError(Number(res.headers.get('retry-after')) || 10);
    if (res.status === 400 && (await res.text()).includes('json_validate_failed')) throw new BadOutputError('Yapay zekâ yanıtı okunamadı.');
    if (!res.ok) throw new AiError(`Yapay zekâ servisi yanıt vermedi (HTTP ${res.status}).`);
    return await res.json();
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError(navigator.onLine ? 'Yapay zekâya bağlanılamadı.' : 'İnternet bağlantısı yok.');
  } finally {
    clearTimeout(t);
  }
}

async function chatJsonOnce<T>(system: string, user: string, maxTokens: number, model: string): Promise<T> {
  const data = (await post(
    '/chat/completions',
    JSON.stringify({
      model,
      // Akıl yürütme süresini kısa tut: yanıtlar ~1-3 saniyede gelsin
      reasoning_effort: model.startsWith('qwen/') ? 'none' : 'low',
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: `${system}\nYanıtı yalnızca geçerli JSON olarak ver.` },
        { role: 'user', content: user },
      ],
    }),
    true,
    45_000,
  )) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new BadOutputError('Yapay zekâ boş yanıt verdi.');
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new BadOutputError('Yapay zekâ yanıtı okunamadı.');
  }
}

/**
 * Modelden JSON nesnesi ister ve ayrıştırır. Sınır dolarsa yedek modele geçer,
 * o da doluysa kısa bir bekleme sonrası bir kez daha dener; bozuk çıktıda bir kez yeniler.
 */
export async function chatJson<T>(system: string, user: string, maxTokens = 1500, model = CHAT_MODEL): Promise<T> {
  const fallback = FALLBACK_MODEL[model];
  let badOutput = false;
  for (let attempt = 0; attempt < 4; attempt++) {
    const m = attempt % 2 === 1 && fallback ? fallback : model;
    try {
      return await chatJsonOnce<T>(system, user, maxTokens, m);
    } catch (e) {
      if (e instanceof BadOutputError && !badOutput) {
        badOutput = true;
        continue;
      }
      if (!(e instanceof RateLimitError) || attempt === 3) throw e;
      // İlk sınır hatasında hemen yedek modele geç; o da doluysa beklenen süre kadar bekle (en fazla 12 sn).
      if (attempt >= 1) await wait(Math.min(12, e.retryAfter) * 1000);
    }
  }
  throw new AiError('Yapay zekâ şu an yanıt veremiyor.');
}

/** Ses kaydını (Whisper) yazıya çevirir. */
export async function transcribe(audio: Blob, language = 'en'): Promise<string> {
  const form = new FormData();
  const ext = audio.type.includes('mp4') ? 'm4a' : audio.type.includes('ogg') ? 'ogg' : 'webm';
  form.append('file', audio, `kayit.${ext}`);
  form.append('model', STT_MODEL);
  form.append('language', language);
  form.append('response_format', 'json');
  form.append('temperature', '0');
  const data = (await post('/audio/transcriptions', form, false, 30_000)) as { text?: string };
  return (data.text ?? '').trim();
}

/** Anahtarın çalıştığını hızlıca doğrular. */
export async function testConnection(): Promise<boolean> {
  const r = await chatJson<{ ok?: boolean }>('Sen bir test uç noktasısın.', 'Return {"ok": true}', 300);
  return r.ok === true;
}
