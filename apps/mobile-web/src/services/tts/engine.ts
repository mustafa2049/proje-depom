export interface SpeakOptions {
  accent: 'en-US' | 'en-GB';
  rate: number;
}

/** Platforma özgü sesli okuma motorunun arayüzü. */
export interface SpeechEngine {
  speak(text: string, options: SpeakOptions): void;
  stop(): void;
  isSpeaking(): boolean;
}
