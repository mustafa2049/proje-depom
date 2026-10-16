import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';

import { createSpeechRecognizer, getSpeechRecognitionConstructor, type SpeechRecognizer } from '../../utils/speechRecognition';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

/**
 * Web Speech API ile sesli giriş. Tarayıcı desteklemiyorsa (ör. native) buton pasif ve açıklamalıdır.
 */
export function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const supported = getSpeechRecognitionConstructor() !== null;
  const [listening, setListening] = useState(false);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  useEffect(() => () => recognizerRef.current?.stop(), []);

  function toggle() {
    if (listening) {
      recognizerRef.current?.stop();
      setListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (result) => {
        if (result.isFinal && result.transcript.trim()) {
          onTranscript(result.transcript.trim());
        }
      },
      () => setListening(false),
    );
    if (!recognizer) {
      return;
    }
    recognizerRef.current = recognizer;
    recognizer.start();
    setListening(true);
  }

  const inactive = disabled || !supported;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={supported ? (listening ? 'Dinlemeyi durdur' : 'Sesle yaz') : 'Sesli giriş desteklenmiyor'}
      accessibilityHint={supported ? undefined : 'Sesli giriş yalnızca destekleyen web tarayıcılarında kullanılabilir.'}
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={toggle}
      className={`h-11 w-11 items-center justify-center rounded-full border ${listening ? 'border-danger bg-danger/20' : 'border-slate-700 bg-surface'} ${inactive ? 'opacity-40' : ''}`}
    >
      {listening ? <MicOff size={18} color="#EF4444" /> : <Mic size={18} color={supported ? '#38BDF8' : '#64748B'} />}
    </Pressable>
  );
}
