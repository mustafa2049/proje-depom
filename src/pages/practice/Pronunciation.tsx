import { useEffect, useMemo, useRef, useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { BOX_COLORS } from '../../lib/leitner';
import { cx, Highlight, Icon, shuffle, SpeakButton } from '../../components/ui';
import { aiAvailable, transcribe } from '../../lib/ai';
import { canRecognize, listen, similarity, speak, vibrate, type RecognitionHandle } from '../../lib/speech';
import type { Word } from '../../lib/types';
import { useStore } from '../../store/AppStore';
import { allWords } from '../../store/selectors';

const BARS = 16;

async function waveform(blob: Blob): Promise<{ bars: number[]; duration: number }> {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    const data = buf.getChannelData(0);
    const size = Math.floor(data.length / BARS);
    const bars: number[] = [];
    for (let i = 0; i < BARS; i++) {
      let sum = 0;
      for (let j = 0; j < size; j++) sum += data[i * size + j] ** 2;
      bars.push(Math.sqrt(sum / size));
    }
    const max = Math.max(...bars, 0.0001);
    return { bars: bars.map((b) => b / max), duration: buf.duration };
  } finally {
    void ctx.close();
  }
}

/** Ana dil kaydı elimizde olmadığından referans dalga formu IPA hece vurgusundan türetilir. */
function referenceBars(word: Word): number[] {
  const syl = word.syllables ?? word.word.split(/(?<=[aeiou])(?=[^aeiou])/i);
  const stress = word.stressIndex ?? 0;
  const out: number[] = [];
  for (let i = 0; i < BARS; i++) {
    const pos = Math.min(syl.length - 1, Math.floor((i / BARS) * syl.length));
    const base = pos === stress ? 1 : 0.55;
    out.push(base * (0.55 + 0.45 * Math.sin(((i % 3) + 1) * 1.2)));
  }
  return out;
}

export default function Pronunciation() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  const queue = useMemo(() => {
    const learning = Object.values(state.cards)
      .map((c) => words[c.wordId])
      .filter((w): w is Word => !!w && !w.word.includes(' '));
    const base = learning.length >= 3 ? learning : allWords(state).filter((w) => w.syllables || state.enrolledDecks.includes(w.deckId));
    const withSyl = base.filter((w) => w.syllables);
    return shuffle([...withSyl, ...shuffle(base.filter((w) => !w.syllables))]).slice(0, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [index, setIndex] = useState(0);
  const word = queue[index % Math.max(1, queue.length)];
  const card = word ? state.cards[word.id] : undefined;

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userBars, setUserBars] = useState<number[] | null>(null);
  const [duration, setDuration] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [heard, setHeard] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<RecognitionHandle | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);

  const reset = () => {
    setAudioUrl((u) => {
      if (u) URL.revokeObjectURL(u);
      return null;
    });
    setUserBars(null);
    setScore(null);
    setHeard('');
    setDuration(0);
  };

  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      recognition.current?.stop();
    },
    [],
  );

  if (!word) {
    return (
      <SubScreen title="Telaffuz Laboratuvarı">
        <p className="font-body-md text-body-md text-on-surface-variant">Çalışılacak kelime bulunamadı.</p>
      </SubScreen>
    );
  }

  /** Tanınan metin adaylarından en iyi puanı hesaplar. */
  const scoreAlternatives = (alts: { transcript: string; confidence: number }[]) => {
    let best = 0;
    let bestText = '';
    for (const a of alts) {
      const sim = similarity(a.transcript, word.word);
      const s = Math.round(sim * 85 + (sim > 0.9 ? (a.confidence || 0.8) * 15 : 0));
      if (s > best) {
        best = s;
        bestText = a.transcript;
      }
    }
    setScore(Math.min(100, best));
    setHeard(bestText || alts[0]?.transcript || '');
    if (best >= 70) dispatch({ type: 'addXp', amount: 5 });
  };

  // Yapay zekâ anahtarı varsa kayıt Whisper ile yazıya çevrilir (cihazın ses tanımasından daha doğru;
  // Android'de mikrofonu kayıtla paylaşma sorunu da olmaz).
  const useWhisper = aiAvailable();

  const start = async () => {
    if (recording) return;
    reset();
    vibrate(40);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast('Mikrofon izni gerekli', { description: 'Tarayıcı ayarlarından mikrofon erişimine izin ver.', tone: 'error', icon: 'mic_off' });
      return;
    }
    chunks.current = [];
    const mr = new MediaRecorder(stream.current);
    mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    mr.onstop = async () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks.current, { type: mr.mimeType });
      setAudioUrl(URL.createObjectURL(blob));
      try {
        const wf = await waveform(blob);
        setUserBars(wf.bars);
        setDuration(wf.duration);
      } catch {
        setUserBars(null);
      }
      if (useWhisper && blob.size > 0) {
        setAnalyzing(true);
        try {
          const text = await transcribe(blob);
          scoreAlternatives([{ transcript: text, confidence: 0.9 }]);
        } catch (e) {
          toast('Ses tanınamadı', { description: (e as Error).message, tone: 'error' });
        } finally {
          setAnalyzing(false);
        }
      }
    };
    mr.start();
    recorder.current = mr;
    setRecording(true);
    if (!useWhisper && canRecognize()) recognition.current = listen('en-US', scoreAlternatives);
  };

  const stop = () => {
    if (!recording) return;
    vibrate(40);
    setRecording(false);
    recorder.current?.state === 'recording' && recorder.current.stop();
    recognition.current?.stop();
  };

  const refBars = referenceBars(word);
  const syllables = word.syllables;
  const scoreTone = score === null ? 'text-outline' : score >= 85 ? 'text-secondary' : score >= 60 ? 'text-tertiary' : 'text-error';
  const feedback =
    analyzing
      ? 'Kaydın yapay zekâ (Whisper) ile analiz ediliyor…'
      : score === null
      ? useWhisper || canRecognize()
        ? 'Mikrofon butonuna basılı tut, kelimeyi söyle ve bırak.'
        : 'Bu tarayıcı otomatik puanlamayı desteklemiyor; kaydını ana dil telaffuzuyla karşılaştırarak dinle.'
      : score >= 85
        ? 'Harika telaffuz! Kelime net biçimde anlaşıldı.'
        : score >= 60
          ? `Neredeyse! Vurguya dikkat et${syllables && word.stressIndex !== undefined ? `: /${syllables[word.stressIndex].replace('ˈ', '')}/ hecesini daha güçlü söyle` : ''}.`
          : 'Tekrar dene: önce yavaş dinle, sonra hece hece söyle.';

  return (
    <SubScreen title="Telaffuz Laboratuvarı" bottomPadding="pb-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-high text-primary">
              <Icon name="record_voice_over" size={18} />
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Gölgeleme & Fonetik</span>
          </div>
          {card && (
            <span className={cx('font-label-sm text-label-sm px-2.5 py-1 rounded-full', BOX_COLORS[card.box].soft, BOX_COLORS[card.box].text)}>Kutu {card.box}</span>
          )}
        </div>
        <div className="bg-surface-container-low rounded-xl p-5 shadow-md flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Hedef Kelime</span>
            <span className="inline-flex w-1.5 h-1.5 rounded-full bg-secondary" />
          </div>
          <div className="flex items-center gap-3">
            <h2 lang="en" className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold uppercase break-all">{word.word}</h2>
            <SpeakButton text={word.word} size={20} className="w-10 h-10 shrink-0 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary flex items-center justify-center shadow-sm" />
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-4">
            {word.ipa} • {word.meaning}
          </span>
          {syllables ? (
            <div className="w-full flex items-center justify-center gap-1.5 flex-wrap">
              {syllables.map((s, i) => {
                const stressed = i === word.stressIndex;
                return (
                  <div key={i} className={cx('flex flex-col items-center px-2.5 py-1.5 rounded-lg', stressed ? 'bg-surface-container-highest shadow-sm' : 'bg-surface-container-high')}>
                    <div className="flex items-center gap-0.5">
                      {stressed && <Icon name="bolt" size={12} className="text-secondary" />}
                      <span className={cx('font-label-lg text-label-lg', stressed ? 'font-bold text-secondary' : 'text-on-surface')}>/{s.replace(/[ˈˌ]/g, '')}/</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{stressed ? 'Vurgu' : `Hece ${i + 1}`}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-label-sm text-label-sm text-on-surface-variant">IPA’daki ˈ işareti vurgulu heceyi gösterir.</p>
          )}
          <button type="button" onClick={() => speak(word.word, { rate: 0.55 })} className="mt-3 font-label-md text-label-md text-primary flex items-center gap-1">
            <Icon name="slow_motion_video" size={16} /> Yavaş dinle
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container-low rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
              <circle className="text-surface-container-highest" cx="22" cy="22" fill="none" r="18" stroke="currentColor" strokeWidth="4" />
              <circle
                className={scoreTone}
                cx="22"
                cy="22"
                fill="none"
                r="18"
                stroke="currentColor"
                strokeDasharray="113.1"
                strokeDashoffset={113.1 - ((score ?? 0) / 100) * 113.1}
                strokeLinecap="round"
                strokeWidth="4"
                style={{ transition: 'stroke-dashoffset 600ms' }}
              />
            </svg>
            <span className={cx('absolute font-headline-sm text-headline-sm font-bold', scoreTone)}>{score ?? '–'}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className={cx('font-label-sm text-label-sm uppercase font-semibold', scoreTone)}>
              {score === null ? 'Puan Bekleniyor' : score >= 85 ? 'Mükemmel Uyum' : score >= 60 ? 'İyi' : 'Geliştir'}
            </span>
            <span className="font-label-md text-label-md text-on-surface truncate">{heard ? `“${heard}”` : 'Henüz kayıt yok'}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{useWhisper ? 'Whisper (yapay zekâ)' : 'Konuşma tanıma'}</span>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-surface-container-high flex flex-col items-center justify-center shrink-0 text-primary">
            <Icon name="speed" size={22} />
            <span className="font-label-sm text-label-sm font-bold text-on-surface">{duration ? duration.toFixed(1) : '–'}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-primary uppercase font-semibold">Kayıt Süresi</span>
            <span className="font-label-md text-label-md text-on-surface truncate">{duration ? `${duration.toFixed(2)} sn` : '—'}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Doğal akıcılık</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="bg-surface-container-low rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="font-label-md text-label-md text-on-surface font-semibold">Referans Ses (Cihaz TTS • US)</span>
            </div>
            <SpeakButton text={word.word} label="Dinle" size={16} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary hover:bg-primary/25 font-label-sm text-label-sm" />
          </div>
          <div className="h-14 w-full bg-surface-container-lowest rounded-lg p-2 flex items-center justify-between gap-1 overflow-hidden" aria-hidden="true">
            {refBars.map((h, i) => (
              <div key={i} className="w-1.5 bg-primary rounded-full" style={{ height: `${Math.max(10, h * 100)}%`, opacity: 0.35 + h * 0.65 }} />
            ))}
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className={cx('w-2.5 h-2.5 rounded-full', recording ? 'bg-error animate-pulse' : 'bg-secondary')} />
              <span className="font-label-md text-label-md text-on-surface font-semibold">Senin Kaydın (Mikrofon)</span>
            </div>
            <button
              type="button"
              disabled={!audioUrl}
              onClick={() => audioUrl && new Audio(audioUrl).play()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary hover:bg-secondary/25 font-label-sm text-label-sm transition-colors disabled:opacity-40"
            >
              <Icon name="replay" size={16} />
              <span>Tekrar Dinle</span>
            </button>
          </div>
          <div className="h-14 w-full bg-surface-container-lowest rounded-lg p-2 flex items-center justify-between gap-1 overflow-hidden" aria-hidden="true">
            {(userBars ?? Array(BARS).fill(0.08)).map((h, i) => (
              <div key={i} className={cx('w-1.5 rounded-full', recording ? 'bg-error animate-pulse' : 'bg-secondary')} style={{ height: `${Math.max(8, h * 100)}%`, opacity: 0.3 + h * 0.7 }} />
            ))}
          </div>
          <div className="mt-3 p-3 rounded-lg bg-surface-container flex items-start gap-2.5">
            <Icon name="auto_awesome" size={20} className="text-tertiary shrink-0 mt-0.5" />
            <p className="font-body-sm text-body-sm text-on-surface leading-snug">{feedback}</p>
          </div>
        </div>
      </section>

      {word.examples[0] && (
        <section className="bg-surface-container-low rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Cümle İçinde Gölgeleme (Shadowing)</span>
            <SpeakButton text={word.examples[0].en} size={16} className="w-8 h-8 rounded-full bg-surface-container-high text-primary" />
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface">
              “<Highlight text={word.examples[0].en} term={word.word} className="text-secondary font-bold underline decoration-secondary decoration-2 underline-offset-4" />”
            </p>
            {word.examples[0].tr && <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{word.examples[0].tr}</p>}
          </div>
        </section>
      )}

      <footer className="pt-2 flex flex-col items-center gap-3">
        <div className="w-full flex items-center justify-between gap-3 px-1">
          <button
            type="button"
            onClick={reset}
            className="flex-1 h-14 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Icon name="restart_alt" size={20} />
            <span className="font-label-md text-label-md">Baştan Al</span>
          </button>
          <div className="relative flex items-center justify-center shrink-0">
            <div className={cx('absolute w-20 h-20 rounded-full animate-ping pointer-events-none', recording ? 'bg-error/30' : 'bg-secondary/20')} />
            <button
              type="button"
              aria-label="Kaydetmek için basılı tut"
              onPointerDown={(e) => {
                e.preventDefault();
                void start();
              }}
              onPointerUp={stop}
              onPointerLeave={stop}
              onContextMenu={(e) => e.preventDefault()}
              className={cx(
                'w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-90 z-10 touch-none select-none',
                recording ? 'bg-error text-on-error' : 'bg-secondary text-on-secondary',
              )}
            >
              <Icon name="mic" size={34} />
              <span className="font-label-sm font-bold uppercase tracking-tighter text-[9px] -mt-1">{recording ? 'Kayıtta' : 'Kayıt'}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              reset();
              setIndex((i) => i + 1);
            }}
            className="flex-1 h-14 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <span className="font-label-md text-label-md">Devam Et</span>
            <Icon name="arrow_forward" size={20} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <Icon name="vibration" size={16} />
          <span className="font-label-sm text-label-sm">Basılı Tut ve Konuş • Haptik Geri Bildirimli</span>
        </div>
      </footer>
    </SubScreen>
  );
}
