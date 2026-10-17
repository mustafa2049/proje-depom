import { afterEach, describe, expect, it } from 'vitest';

import { useSettingsStore } from '../store/useSettingsStore';

import { setSpeechEngine, speak } from './ttsService';
import type { SpeakOptions, SpeechEngine } from './tts/engine';

function recordingEngine(): { engine: SpeechEngine; calls: Array<{ text: string; options: SpeakOptions }> } {
  const calls: Array<{ text: string; options: SpeakOptions }> = [];
  return {
    calls,
    engine: {
      speak: (text, options) => calls.push({ text, options }),
      stop: () => undefined,
      isSpeaking: () => false,
    },
  };
}

describe('TTS varsayılan aksanı', () => {
  afterEach(() => {
    useSettingsStore.setState({ accent: 'en-US' });
  });

  it('aksan belirtilmezse ayarlardaki varsayılanı kullanır', () => {
    const { engine, calls } = recordingEngine();
    setSpeechEngine(engine);
    useSettingsStore.setState({ accent: 'en-GB' });

    speak('  hello  ');

    expect(calls[0]).toEqual({ text: 'hello', options: { accent: 'en-GB', rate: 1 } });
  });

  it('açıkça belirtilen aksan varsayılanı geçersiz kılar; hız 0.5–2 aralığına sıkıştırılır', () => {
    const { engine, calls } = recordingEngine();
    setSpeechEngine(engine);
    useSettingsStore.setState({ accent: 'en-GB' });

    speak('hi', { accent: 'en-US', rate: 0.75 });
    speak('hi', { rate: 9 });

    expect(calls[0]?.options).toEqual({ accent: 'en-US', rate: 0.75 });
    expect(calls[1]?.options.rate).toBe(2);
  });
});
