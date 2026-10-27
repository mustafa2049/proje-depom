/** Tarayıcının Web Speech API'si üzerinden metin okuma (TTS) ve konuşma tanıma (STT). */

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
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  onBoundary?: (charIndex: number) => void;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!canSpeak() || !text) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts.lang ?? 'en-US';
  u.rate = opts.rate ?? 0.9;
  const voice = voices().find((v) => v.lang === u.lang) ?? voices().find((v) => v.lang.startsWith(u.lang.slice(0, 2)));
  if (voice) u.voice = voice;
  if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary?.(e.charIndex);
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  synth.speak(u);
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
  if (canSpeak()) window.speechSynthesis.cancel();
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
  return typeof window !== 'undefined' && recognitionCtor() !== null;
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
