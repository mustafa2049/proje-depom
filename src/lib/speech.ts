/**
 * Metin okuma (TTS) ve konuşma tanıma (STT).
 * İngilizce metinler önce doğal sesle okunur (hazır kayıtlar, sonra Groq Orpheus; bkz. voice.ts);
 * ikisi de yoksa tarayıcıda Web Speech API, Android uygulamasında cihazın yerel ses servisi kullanılır
 * (Android WebView konuşma tanımayı desteklemez).
 */

import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { aiClips, bundledClip, loadVoiceIndex, playClips, stopClip } from './voice';

const isNative = Capacitor.isNativePlatform();

let cachedVoices: SpeechSynthesisVoice[] = [];

function voices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  if (!cachedVoices.length) cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices();
  });
}

export function canSpeak(): boolean {
  return isNative || (typeof window !== 'undefined' && 'speechSynthesis' in window);
}

export interface SpeechPrefs {
  /** İngilizce metinlerde doğal ses (hazır kayıtlar + yapay zekâ sesi) */
  natural: boolean;
  /** Kayıtta olmayan metinler için Groq Orpheus */
  aiVoice: boolean;
  /** İngilizce için seçilen cihaz sesi (boşsa sistem varsayılanı) */
  deviceVoice: string;
}

let prefs: SpeechPrefs = { natural: true, aiVoice: true, deviceVoice: '' };

/** Profil ayarları değişince mağaza tarafından çağrılır. */
export function configureSpeech(next: SpeechPrefs): void {
  prefs = next;
  if (next.natural) void loadVoiceIndex();
}

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  onBoundary?: (charIndex: number) => void;
  onEnd?: () => void;
}

let speakToken = 0;

export function speak(text: string, opts: SpeakOptions = {}): void {
  const id = ++speakToken;
  stopClip();
  if (!text) {
    opts.onEnd?.();
    return;
  }
  if (prefs.natural && (opts.lang ?? 'en-US').toLowerCase().startsWith('en')) {
    stopDevice();
    void speakNatural(text, opts, id).then((played) => {
      if (!played && id === speakToken) speakDevice(text, opts);
    });
    return;
  }
  speakDevice(text, opts);
}

/** Hazır kayıt, yoksa yapay zekâ sesiyle okur; ikisi de yoksa false (cihaz sesine dönülür). */
async function speakNatural(text: string, opts: SpeakOptions, id: number): Promise<boolean> {
  const clipOpts = { rate: opts.rate ?? 0.9, onEnd: opts.onEnd, onBoundary: opts.onBoundary, text };
  const superseded = () => {
    // Bu arada yeni bir okuma başladı: çağıranın durumu (ör. çalıyor simgesi) sıfırlansın.
    opts.onEnd?.();
    return true;
  };
  const clip = await bundledClip(text);
  if (id !== speakToken) return superseded();
  if (clip) return playClips([clip.src], { ...clipOpts, marks: clip.marks });
  if (!prefs.aiVoice) return false;
  const urls = await aiClips(text);
  if (id !== speakToken) return superseded();
  return urls ? playClips(urls, clipOpts) : false;
}

interface NativeVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
}

let nativeVoices: Promise<NativeVoice[]> | undefined;

function loadNativeVoices(): Promise<NativeVoice[]> {
  nativeVoices ??= TextToSpeech.getSupportedVoices()
    .then((r) => r.voices as NativeVoice[])
    .catch(() => []);
  return nativeVoices;
}

export interface DeviceVoice {
  id: string;
  label: string;
  lang: string;
  /** İnternet gerektirmeyen ses */
  local: boolean;
}

const REGION: Record<string, string> = { US: 'Amerikan', GB: 'İngiliz', AU: 'Avustralya', IN: 'Hint', CA: 'Kanada', IE: 'İrlanda', NZ: 'Yeni Zelanda', ZA: 'Güney Afrika' };

function regionLabel(lang: string): string {
  const region = lang.replace('_', '-').split('-')[1]?.toUpperCase() ?? '';
  return REGION[region] ?? lang;
}

/** Cihazdaki İngilizce sesler (ayarlardaki ses seçimi için). */
export async function listDeviceVoices(): Promise<DeviceVoice[]> {
  if (isNative) {
    const list = await loadNativeVoices();
    return list
      .filter((v) => v.lang.toLowerCase().startsWith('en'))
      .map((v) => {
        // Google ses adları: en-us-x-iol-network → "iol"
        const code = v.voiceURI.match(/-x-([a-z0-9]+)-/i)?.[1] ?? v.voiceURI;
        return { id: v.voiceURI, label: `${regionLabel(v.lang)} · ${code}`, lang: v.lang, local: v.localService };
      });
  }
  return voices()
    .filter((v) => v.lang.toLowerCase().startsWith('en'))
    .map((v) => ({ id: v.voiceURI, label: v.name, lang: v.lang, local: v.localService }));
}

function stopDevice(): void {
  if (isNative) void TextToSpeech.stop().catch(() => {});
  else if (canSpeak()) window.speechSynthesis.cancel();
}

function speakDevice(text: string, opts: SpeakOptions): void {
  if (!canSpeak()) {
    opts.onEnd?.();
    return;
  }
  const lang = opts.lang ?? 'en-US';
  const wantVoice = lang.toLowerCase().startsWith('en') ? prefs.deviceVoice : '';
  if (isNative) {
    // Varsayılan "Flush" stratejisi önceki okumayı keser; kelime sınırı olayı yerel tarafta yoktur.
    const done = () => opts.onEnd?.();
    void (async () => {
      const list = wantVoice ? await loadNativeVoices() : [];
      const voice = list.findIndex((v) => v.voiceURI === wantVoice);
      await TextToSpeech.speak({ text, lang, rate: opts.rate ?? 0.9, ...(voice >= 0 ? { voice } : {}) });
    })().then(done, done);
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = opts.rate ?? 0.9;
  const voice =
    (wantVoice && voices().find((v) => v.voiceURI === wantVoice)) ||
    voices().find((v) => v.lang === u.lang) ||
    voices().find((v) => v.lang.startsWith(u.lang.slice(0, 2)));
  if (voice) u.voice = voice;
  if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary?.(e.charIndex);
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  synth.speak(u);
}

/** Ayarlardaki "Dinle": doğal sesi atlayıp seçili cihaz sesiyle okur. */
export function previewDeviceVoice(text: string, rate: number): void {
  stopSpeaking();
  speakDevice(text, { rate, lang: 'en-US' });
}

/** Sırayla birden fazla metni okur; iptal fonksiyonu döner. */
export function speakSequence(parts: { text: string; lang?: string; rate?: number }[], onDone?: () => void): () => void {
  let cancelled = false;
  const run = (i: number) => {
    if (cancelled) return;
    if (i >= parts.length) {
      onDone?.();
      return;
    }
    speak(parts[i].text, { lang: parts[i].lang, rate: parts[i].rate, onEnd: () => run(i + 1) });
  };
  run(0);
  return () => {
    cancelled = true;
    stopSpeaking();
  };
}

export function stopSpeaking(): void {
  speakToken++;
  stopClip();
  stopDevice();
}

// ── Konuşma tanıma ──

interface RecognitionResultLike {
  transcript: string;
  confidence: number;
}

type RecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<RecognitionResultLike> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function recognitionCtor(): RecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canRecognize(): boolean {
  return isNative || (typeof window !== 'undefined' && recognitionCtor() !== null);
}

function listenNative(
  lang: string,
  onResult: (alternatives: RecognitionResultLike[]) => void,
  onError?: (error: string) => void,
  onEnd?: () => void,
): RecognitionHandle {
  void (async () => {
    try {
      const perm = await SpeechRecognition.requestPermissions();
      if (perm.speechRecognition !== 'granted') {
        onError?.('not-allowed');
        return;
      }
      const res = await SpeechRecognition.start({ language: lang, maxResults: 5, partialResults: false, popup: false });
      // Yerel servis güven skoru döndürmez; sıralama en olası sonuçtan başlar.
      onResult((res.matches ?? []).map((t, i) => ({ transcript: t, confidence: i === 0 ? 0.9 : 0.6 })));
    } catch {
      onError?.('no-match');
    } finally {
      onEnd?.();
    }
  })();
  return { stop: () => void SpeechRecognition.stop().catch(() => {}) };
}

export interface RecognitionHandle {
  stop: () => void;
}

export function listen(
  lang: string,
  onResult: (alternatives: RecognitionResultLike[]) => void,
  onError?: (error: string) => void,
  onEnd?: () => void,
): RecognitionHandle | null {
  if (isNative) return listenNative(lang, onResult, onError, onEnd);
  const Ctor = recognitionCtor();
  if (!Ctor) {
    onError?.('unsupported');
    return null;
  }
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = false;
  rec.maxAlternatives = 5;
  rec.continuous = false;
  rec.onresult = (e) => {
    const last = e.results[e.results.length - 1];
    const alts: RecognitionResultLike[] = [];
    for (let i = 0; i < last.length; i++) alts.push({ transcript: last[i].transcript, confidence: last[i].confidence });
    onResult(alts);
  };
  rec.onerror = (e) => onError?.(e.error);
  rec.onend = () => onEnd?.();
  try {
    rec.start();
  } catch {
    onError?.('start-failed');
    return null;
  }
  return { stop: () => rec.stop() };
}

export function vibrate(ms = 35): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
}

/** Küçük harfe çevirip noktalama işaretlerini temizler. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9ğüşöçıİ\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** İki metin arasındaki Levenshtein benzerliği (0–1). */
export function similarity(a: string, b: string): number {
  const x = normalizeText(a);
  const y = normalizeText(b);
  if (!x.length && !y.length) return 1;
  const dp = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 1; j <= y.length; j++) dp[0][j] = j;
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
  }
  return 1 - dp[x.length][y.length] / Math.max(x.length, y.length);
}
