import * as Speech from 'expo-speech';

import type { SpeechEngine } from './engine';

/** Native motor: expo-speech (iOS AVSpeechSynthesizer / Android TextToSpeech). */
export function createPlatformSpeechEngine(): SpeechEngine {
  let speaking = false;

  return {
    speak(text, options) {
      speaking = true;
      Speech.speak(text, {
        language: options.accent,
        rate: options.rate,
        onDone: () => {
          speaking = false;
        },
        onStopped: () => {
          speaking = false;
        },
        onError: () => {
          speaking = false;
        },
      });
    },

    stop() {
      Speech.stop();
      speaking = false;
    },

    isSpeaking() {
      return speaking;
    },
  };
}
