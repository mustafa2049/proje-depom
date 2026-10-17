import type { SpeechEngine } from './engine';

/**
 * Web ve test ortamı motoru: Web Speech API (window.speechSynthesis) varsa kullanır, yoksa sessizdir.
 * Native platformda platform.native.ts (expo-speech) devreye girer.
 */
export function createPlatformSpeechEngine(): SpeechEngine {
  let speaking = false;

  function synth(): SpeechSynthesis | undefined {
    return typeof globalThis.speechSynthesis !== 'undefined' ? globalThis.speechSynthesis : undefined;
  }

  return {
    speak(text, options) {
      const speechSynthesis = synth();
      if (!speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
        return;
      }

      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.accent;
      utterance.rate = options.rate;
      utterance.onstart = () => {
        speaking = true;
      };
      utterance.onend = () => {
        speaking = false;
      };
      utterance.onerror = () => {
        speaking = false;
      };
      speaking = true;
      speechSynthesis.speak(utterance);
    },

    stop() {
      synth()?.cancel();
      speaking = false;
    },

    isSpeaking() {
      return speaking;
    },
  };
}
