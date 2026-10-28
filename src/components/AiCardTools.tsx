import { useEffect, useState } from 'react';
import { aiCheckSentence, aiExamples, aiExplainMistake, type AiMistakeExplanation, type AiSentenceCheck } from '../lib/aiTasks';
import { vibrate } from '../lib/speech';
import type { Word } from '../lib/types';
import { useStore } from '../store/AppStore';
import { Sheet } from './Sheet';
import { useToast } from './Toast';
import { cx, Highlight, Icon, SpeakButton } from './ui';

export type AiCardTab = 'why' | 'examples' | 'sentence';

export interface Mistake {
  answer: string;
  reverse: boolean;
}

/** Kart için yapay zekâ araçları: yanlış cevap açıklaması, yeni örnek cümleler ve cümle kurma kontrolü. */
export function AiCardTools({
  word,
  open,
  onClose,
  tab: initialTab,
  mistake,
}: {
  word: Word;
  open: boolean;
  onClose: () => void;
  tab: AiCardTab;
  mistake?: Mistake;
}) {
  const [tab, setTab] = useState<AiCardTab>(initialTab);
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const tabs: [AiCardTab, string, string][] = [
    ...(mistake ? [['why', 'help', 'Neden?'] as [AiCardTab, string, string]] : []),
    ['examples', 'format_quote', 'Yeni Örnekler'],
    ['sentence', 'edit_note', 'Cümle Kur'],
  ];

  return (
    <Sheet open={open} onClose={onClose} title={word.word} icon="auto_awesome">
      <div className="flex flex-col gap-4">
        <div className="flex p-1 rounded-lg bg-surface-container-lowest gap-1">
          {tabs.map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cx(
                'flex-1 py-2 rounded-md font-label-md text-label-md flex items-center justify-center gap-1',
                tab === id ? 'bg-primary text-on-primary' : 'text-on-surface-variant',
              )}
            >
              <Icon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>
        {/* Sekmeler kapatılıp açılsa da sonuçlarını korusun diye hepsi bağlı kalır, yalnızca görünürlük değişir */}
        {mistake && <WhyPanel word={word} mistake={mistake} hidden={tab !== 'why'} />}
        <ExamplesPanel word={word} hidden={tab !== 'examples'} active={open && tab === 'examples'} />
        <SentencePanel word={word} hidden={tab !== 'sentence'} />
      </div>
    </Sheet>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 py-6 justify-center text-on-surface-variant font-label-md text-label-md">
      <Icon name="progress_activity" size={20} className="animate-spin text-primary" />
      {text}
    </div>
  );
}

function ErrorBox({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <p className="font-body-sm text-body-sm text-error">{text}</p>
      <button type="button" onClick={onRetry} className="font-label-lg text-label-lg text-primary">
        Tekrar dene
      </button>
    </div>
  );
}

function WhyPanel({ word, mistake, hidden }: { word: Word; mistake: Mistake; hidden: boolean }) {
  const [result, setResult] = useState<AiMistakeExplanation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    aiExplainMistake(word, mistake.answer, mistake.reverse)
      .then(setResult)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (!hidden && !result && !loading && !error) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden]);

  if (hidden) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 font-label-md text-label-md">
        <span className="px-2 py-0.5 rounded bg-error-container/30 text-error line-through">{mistake.answer}</span>
        <Icon name="arrow_forward" size={16} className="text-outline" />
        <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary">{mistake.reverse ? word.word : word.meaning}</span>
      </div>
      {loading && <Loading text="Hatan inceleniyor…" />}
      {error && <ErrorBox text={error} onRetry={load} />}
      {result && (
        <>
          <p className="font-body-md text-body-md text-on-surface leading-relaxed">{result.explanation}</p>
          {result.confusedWith && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-tertiary-container/15">
              <Icon name="compare_arrows" size={18} className="text-tertiary" />
              <span className="font-body-sm text-body-sm text-on-surface">
                Karıştırdığın kelime: <b lang="en">{result.confusedWith.word}</b>
                {result.confusedWith.meaning && <> = {result.confusedWith.meaning}</>}
              </span>
            </div>
          )}
          {result.tip && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-container">
              <Icon name="lightbulb" size={18} fill className="text-tertiary mt-0.5" />
              <p className="font-body-sm text-body-sm text-on-surface">{result.tip}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ExamplesPanel({ word, hidden, active }: { word: Word; hidden: boolean; active: boolean }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [examples, setExamples] = useState<{ en: string; tr: string }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  const load = () => {
    setLoading(true);
    setError('');
    aiExamples(word)
      .then(setExamples)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (active && !examples.length && !loading && !error) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const save = (ex: { en: string; tr: string }) => {
    // İlk (sözlükteki) örnek hep korunur; üstüne en fazla 4 kayıtlı örnek tutulur
    const [first, ...rest] = word.examples.filter((e) => e.en !== ex.en);
    const examples = first ? [first, ...[...rest, ex].slice(-4)] : [ex];
    dispatch({ type: 'updateWord', word: { ...word, examples } });
    setSaved((s) => [...s, ex.en]);
    toast('Örnek karta eklendi', { icon: 'bookmark_added' });
  };

  if (hidden) return null;
  return (
    <div className="flex flex-col gap-3">
      {loading && <Loading text="Yeni cümleler yazılıyor…" />}
      {error && <ErrorBox text={error} onRetry={load} />}
      {!loading &&
        examples.map((ex) => (
          <div key={ex.en} className="p-3 rounded-lg bg-surface-container flex flex-col gap-1.5">
            <p lang="en" className="font-body-md text-body-md text-on-surface font-medium leading-snug">
              <Highlight text={ex.en} term={word.word} />
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant italic">{ex.tr}</p>
            <div className="flex items-center justify-end gap-3 pt-0.5">
              <SpeakButton text={ex.en} label="Dinle" className="flex items-center gap-1 text-primary font-label-md text-label-md" />
              <button
                type="button"
                disabled={saved.includes(ex.en)}
                onClick={() => save(ex)}
                className="flex items-center gap-1 text-secondary font-label-md text-label-md disabled:text-outline"
              >
                <Icon name={saved.includes(ex.en) ? 'bookmark_added' : 'bookmark_add'} size={16} />
                {saved.includes(ex.en) ? 'Kaydedildi' : 'Karta kaydet'}
              </button>
            </div>
          </div>
        ))}
      {examples.length > 0 && !loading && (
        <button type="button" onClick={load} className="flex items-center justify-center gap-1.5 py-2 text-primary font-label-lg text-label-lg">
          <Icon name="refresh" size={18} /> Başka örnekler
        </button>
      )}
    </div>
  );
}

function SentencePanel({ word, hidden }: { word: Word; hidden: boolean }) {
  const { dispatch } = useStore();
  const [text, setText] = useState('');
  const [result, setResult] = useState<(AiSentenceCheck & { text: string }) | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const check = () => {
    const t = text.trim();
    if (!t || loading) return;
    setLoading(true);
    setError('');
    aiCheckSentence(word, t)
      .then((r) => {
        setResult({ ...r, text: t });
        vibrate(r.correctUsage ? 30 : 80);
        if (r.correctUsage && r.score >= 70) dispatch({ type: 'addXp', amount: 5 });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  if (hidden) return null;
  const tone = !result ? '' : result.correctUsage && result.score >= 70 ? 'text-secondary' : result.correctUsage ? 'text-tertiary' : 'text-error';
  return (
    <div className="flex flex-col gap-3">
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        <b lang="en" className="text-on-surface">{word.word}</b> ({word.meaning}) kelimesini kullanarak kendi cümleni yaz. Yapay zekâ doğru kullanıp kullanmadığını kontrol etsin.
      </p>
      <textarea
        aria-label="Cümlen"
        lang="en"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`I think it was ${word.word}…`}
        autoCapitalize="sentences"
        className="p-3 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-outline"
      />
      <button
        type="button"
        onClick={check}
        disabled={!text.trim() || loading || result?.text === text.trim()}
        className="h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 disabled:opacity-40"
      >
        <Icon name={loading ? 'progress_activity' : 'spellcheck'} size={20} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Kontrol ediliyor…' : 'Cümlemi Kontrol Et'}
      </button>
      {error && <p className="font-body-sm text-body-sm text-error text-center">{error}</p>}
      {result && (
        <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-container animate-fade-in">
          <div className="flex items-center justify-between">
            <span className={cx('flex items-center gap-1.5 font-label-lg text-label-lg', tone)}>
              <Icon name={result.correctUsage ? 'check_circle' : 'cancel'} size={20} fill />
              {result.correctUsage ? 'Kelimeyi doğru kullandın' : 'Kelime anlamına uygun kullanılmamış'}
            </span>
            <span className={cx('font-headline-sm text-headline-sm font-bold', tone)}>{result.score}</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface">{result.feedback}</p>
          {result.corrected && result.corrected.trim() !== result.text && (
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Düzeltilmiş</span>
              <p lang="en" className="font-body-md text-body-md text-secondary">{result.corrected}</p>
            </div>
          )}
          {result.natural && (
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Daha doğal</span>
              <div className="flex items-start gap-2">
                <p lang="en" className="flex-1 font-body-md text-body-md text-primary">{result.natural}</p>
                <SpeakButton text={result.natural} label="Dinle" className="text-primary shrink-0" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
