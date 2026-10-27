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
    if (res.status === 429) throw new AiError('Ücretsiz kullanım sınırına ulaşıldı. Biraz sonra tekrar dene.');
    if (!res.ok) throw new AiError(`Yapay zekâ servisi yanıt vermedi (HTTP ${res.status}).`);
    return await res.json();
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError(navigator.onLine ? 'Yapay zekâya bağlanılamadı.' : 'İnternet bağlantısı yok.');
  } finally {
    clearTimeout(t);
  }
}

/** Modelden JSON nesnesi ister ve ayrıştırır. */
export async function chatJson<T>(system: string, user: string, maxTokens = 1500, model = CHAT_MODEL): Promise<T> {
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
  if (!text) throw new AiError('Yapay zekâ boş yanıt verdi.');
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiError('Yapay zekâ yanıtı okunamadı.');
  }
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
