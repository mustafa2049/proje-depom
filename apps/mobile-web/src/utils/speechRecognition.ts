export interface RecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechRecognizer {
  start(): void;
  stop(): void;
}

interface RecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionConstructor = new () => RecognitionInstance;

/**
 * Web Speech API'nin tarayıcıdaki yapıcısını bulur. Desteklenmiyorsa null döner.
 * `scope` test için enjekte edilebilir (varsayılan: global nesne).
 */
export function getSpeechRecognitionConstructor(
  scope: Record<string, unknown> = globalThis as unknown as Record<string, unknown>,
): RecognitionConstructor | null {
  const ctor = scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
  return typeof ctor === 'function' ? (ctor as RecognitionConstructor) : null;
}

/** Konuşmayı metne çevirir; her sonuçta son transkripti bildirir. Desteklenmiyorsa null döner. */
export function createSpeechRecognizer(
  onTranscript: (result: RecognitionResult) => void,
  onEnd: () => void,
  scope?: Record<string, unknown>,
): SpeechRecognizer | null {
  const Ctor = getSpeechRecognitionConstructor(scope);
  if (!Ctor) {
    return null;
  }

  const recognition = new Ctor();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const last = event.results[event.results.length - 1];
    if (!last) {
      return;
    }
    onTranscript({ transcript: last[0]?.transcript ?? '', isFinal: Boolean(last.isFinal) });
  };
  recognition.onerror = () => onEnd();
  recognition.onend = () => onEnd();

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
