import { useCallback, useEffect, useRef, useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { cx, EmptyState, Icon, PrimaryButton, ProgressBar, shuffle, SpeakButton } from '../../components/ui';
import { aiAvailable } from '../../lib/ai';
import { aiClozeSet, type AiClozeItem } from '../../lib/aiTasks';
import { isDue } from '../../lib/leitner';
import { speak, vibrate } from '../../lib/speech';
import type { AppState, Word } from '../../lib/types';
import { useStore } from '../../store/AppStore';
import { allWords } from '../../store/selectors';

const SET_SIZE = 8;

/** Önce vadesi gelen ve düşük kutudaki kartlar; yetmezse aktif destelerden kelimeler. */
function pickWords(state: AppState, words: Record<string, Word>): Word[] {
  const learning = Object.values(state.cards)
    .filter((c) => words[c.wordId] && c.box <= 4)
    .sort((a, b) => Number(isDue(b)) - Number(isDue(a)) || a.box - b.box)
    .slice(0, SET_SIZE * 2)
    .map((c) => words[c.wordId]);
  const picked = shuffle(learning).slice(0, SET_SIZE);
  if (picked.length < SET_SIZE) {
    const extra = shuffle(allWords(state).filter((w) => state.enrolledDecks.includes(w.deckId) && !picked.includes(w)));
    picked.push(...extra.slice(0, SET_SIZE - picked.length));
  }
  return picked;
}

interface Question extends AiClozeItem {
  options: string[];
}

function buildQuestions(items: AiClozeItem[], words: Record<string, Word>): Question[] {
  return items.map((it) => {
    const pos = words[it.wordId]?.pos;
    const others = items.filter((o) => o.wordId !== it.wordId && o.answer.toLowerCase() !== it.answer.toLowerCase());
    // Önce aynı türden kelimeler: seçenekler dilbilgisi açısından da makul görünsün
    const ranked = [...shuffle(others.filter((o) => words[o.wordId]?.pos === pos)), ...shuffle(others.filter((o) => words[o.wordId]?.pos !== pos))];
    // Aynı yüzey biçimli çeldiriciler tekrar etmesin
    const distractors = [...new Set(ranked.map((o) => o.answer))].slice(0, 3);
    return { ...it, options: shuffle([it.answer, ...distractors]) };
  });
}

export default function AiCloze() {
  const { state, dispatch, words } = useStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showTr, setShowTr] = useState(false);
  const [correct, setCorrect] = useState(0);
  const loaded = useRef(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    aiClozeSet(pickWords(state, words))
      .then((items) => {
        if (items.length < 4) throw new Error('Yeterli soru üretilemedi, tekrar dene.');
        setQuestions(buildQuestions(items, words));
        setIndex(0);
        setPicked(null);
        setShowTr(false);
        setCorrect(0);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [state, words]);

  useEffect(() => {
    if (loaded.current || !aiAvailable()) return;
    loaded.current = true;
    load();
  }, [load]);

  if (!aiAvailable()) {
    return (
      <SubScreen title="Akıllı Boşluk Doldurma">
        <EmptyState icon="cloud_off" title="Yapay zekâ gerekli" text="Bu modül için internet bağlantısı ve Ayarlar’da tanımlı bir Groq anahtarı gerekiyor." />
      </SubScreen>
    );
  }

  if (loading || (!questions.length && !error)) {
    return (
      <SubScreen title="Akıllı Boşluk Doldurma">
        <div className="flex flex-col items-center gap-3 py-16 text-on-surface-variant">
          <Icon name="progress_activity" size={36} className="animate-spin text-primary" />
          <p className="font-body-md text-body-md">Kelimelerin için yeni cümleler yazılıyor…</p>
        </div>
      </SubScreen>
    );
  }

  if (error && !questions.length) {
    return (
      <SubScreen title="Akıllı Boşluk Doldurma">
        <EmptyState icon="error" title="Sorular hazırlanamadı" text={error} action={<PrimaryButton onClick={load}>Tekrar dene</PrimaryButton>} />
      </SubScreen>
    );
  }

  const done = index >= questions.length;
  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <SubScreen title="Akıllı Boşluk Doldurma">
        <section className="bg-surface-container rounded-xl p-6 flex flex-col items-center gap-2 text-center">
          <Icon name={pct >= 75 ? 'emoji_events' : 'trending_up'} size={48} className={pct >= 75 ? 'text-tertiary' : 'text-primary'} fill />
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            {correct} / {questions.length} doğru
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {pct >= 75 ? 'Harika! Kelimeleri yeni bağlamlarda da tanıyorsun.' : 'Yanlış yaptığın kelimeler bir sonraki sette tekrar karşına çıkabilir.'} +{correct * 3} XP
          </p>
        </section>
        <PrimaryButton onClick={load}>
          <Icon name="auto_awesome" size={20} /> Yeni set üret
        </PrimaryButton>
      </SubScreen>
    );
  }

  const q = questions[index];
  const [before, after] = q.sentence.split('___');
  const filled = `${before}${q.answer}${after ?? ''}`;
  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const ok = opt === q.answer;
    vibrate(ok ? 30 : 80);
    if (ok) {
      setCorrect((c) => c + 1);
      dispatch({ type: 'addXp', amount: 3 });
    }
    speak(filled, { rate: state.profile.ttsRate });
  };
  const next = () => {
    setPicked(null);
    setShowTr(false);
    setIndex((i) => i + 1);
  };
  const word = words[q.wordId];

  return (
    <SubScreen title="Akıllı Boşluk Doldurma">
      <div className="flex items-center gap-3">
        <ProgressBar value={(index / questions.length) * 100} className="flex-1" />
        <span className="font-label-md text-label-md text-on-surface-variant">
          {index + 1}/{questions.length}
        </span>
      </div>

      <section className="bg-surface-container rounded-xl p-5 flex flex-col gap-4 min-h-[180px]">
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider flex items-center gap-1">
          <Icon name="auto_awesome" size={14} /> Yeni bağlam
        </span>
        <p lang="en" className="font-headline-sm text-headline-sm text-on-surface leading-relaxed">
          {before}
          <span
            className={cx(
              'inline-block min-w-[5rem] px-2 mx-0.5 rounded border-b-2 text-center',
              picked ? 'border-secondary text-secondary' : 'border-primary text-transparent',
            )}
          >
            {picked ? q.answer : '…'}
          </span>
          {after}
        </p>
        {(showTr || picked) && q.tr && <p className="font-body-sm text-body-sm text-on-surface-variant italic">{q.tr}</p>}
        {!picked && q.tr && !showTr && (
          <button type="button" onClick={() => setShowTr(true)} className="self-start flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
            <Icon name="translate" size={16} /> Türkçe ipucu
          </button>
        )}
      </section>

      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            lang="en"
            onClick={() => choose(opt)}
            className={cx(
              'h-14 rounded-xl font-label-lg text-label-lg transition-all active:scale-95',
              !picked
                ? 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
                : opt === q.answer
                  ? 'bg-secondary-container/40 text-secondary'
                  : opt === picked
                    ? 'bg-error-container/40 text-error'
                    : 'bg-surface-container text-outline',
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      {picked && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {word && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container">
              <div className="flex-1">
                <span lang="en" className="font-label-lg text-label-lg text-on-surface">{word.word}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant"> — {word.meaning}</span>
              </div>
              <SpeakButton text={filled} />
            </div>
          )}
          <PrimaryButton onClick={next}>
            {index + 1 >= questions.length ? 'Sonuçları gör' : 'Sonraki'} <Icon name="arrow_forward" size={20} />
          </PrimaryButton>
        </div>
      )}
    </SubScreen>
  );
}
