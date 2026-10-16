import type { SpeakOptions, SpeechEngine } from './tts/engine';
import { createPlatformSpeechEngine } from './tts/platform';

export const NORMAL_RATE = 1.0;
/** Yavaş ve anlaşılır telaffuz modu (kaplumbağa ikonu). */
export const SLOW_RATE = 0.75;

const MIN_RATE = 0.5;
const MAX_RATE = 2.0;

export interface SpeechOptions {
  accent?: SpeakOptions['accent'];
  rate?: number;
}

let engine: SpeechEngine = createPlatformSpeechEngine();

/** Motoru değiştirir (testler veya özel platform entegrasyonları için). */
export function setSpeechEngine(next: SpeechEngine): void {
  engine = next;
}

export function speak(text: string, options: SpeechOptions = {}): void {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  const rate = Math.min(MAX_RATE, Math.max(MIN_RATE, options.rate ?? NORMAL_RATE));
  engine.speak(trimmed, { accent: options.accent ?? 'en-US', rate });
}

export function stop(): void {
  engine.stop();
}

export function isSpeaking(): boolean {
  return engine.isSpeaking();
}
