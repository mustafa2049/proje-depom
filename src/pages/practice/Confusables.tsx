import { useEffect, useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { cx, Icon, SpeakButton, useCountdown } from '../../components/ui';
import { CONFUSABLES } from '../../data/confusables';
import { vibrate } from '../../lib/speech';
import { useStore } from '../../store/AppStore';
import { useAddToBox } from '../../store/useAddToBox';

const QUESTION_SECONDS = 15;

export default function Confusables() {
  const { dispatch, words, state } = useStore();
  const addToBox = useAddToBox();
  const [pairIndex, setPairIndex] = useState(0);
  const [q, setQ] = useState(0);
  const [choice, setChoice] = useState<0 | 1 | null>(null);
  const [correct, setCorrect] = useState(0);
  const pair = CONFUSABLES[pairIndex];
  const question = pair.questions[q];
  const finished = q >= pair.questions.length;
  const [left, setLeft] = useCountdown(QUESTION_SECONDS, choice === null && !finished, () => {
    if (choice === null) setChoice(question.answer === 0 ? 1 : 0); // süre dolunca yanlış sayılır
  });

  useEffect(() => {
    setLeft(QUESTION_SECONDS);
  }, [q, pairIndex, setLeft]);

  const answer = (c: 0 | 1) => {
    if (choice !== null) return;
    setChoice(c);
    const ok = c === question.answer;
    vibrate(ok ? 30 : 80);
    if (ok) {
      setCorrect((n) => n + 1);
      dispatch({ type: 'addXp', amount: 3 });
    }
  };

  const nextQuestion = () => {
    setChoice(null);
    setQ((n) => n + 1);
  };

  const nextPair = () => {
    setPairIndex((i) => (i + 1) % CONFUSABLES.length);
    setQ(0);
    setChoice(null);
    setCorrect(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextTitle = CONFUSABLES[(pairIndex + 1) % CONFUSABLES.length].title;
  const progress = (Math.min(q, pair.questions.length) / pair.questions.length) * 100;
  const [a, b] = pair.sides;
  const pillTone = {
    tertiary: 'bg-surface-container text-tertiary',
    secondary: 'bg-secondary-container text-on-secondary-container',
    primary: 'bg-primary-container text-on-primary-container',
    neutral: 'bg-surface-container text-outline',
  };

  return (
    <SubScreen title="Karıştırılan Kelimeler">
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between gap-space-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Modül {pairIndex + 1} / {CONFUSABLES.length} • {pair.level}
          </span>
          <div className="flex gap-1">
            {CONFUSABLES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={p.title}
                onClick={() => {
                  setPairIndex(i);
                  setQ(0);
                  setChoice(null);
                  setCorrect(0);
                }}
                className={cx('w-2.5 h-2.5 rounded-full', i === pairIndex ? 'bg-primary' : 'bg-surface-container-highest')}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">{pair.title}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{pair.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        {[a, b].map((side, i) => {
          const tone = i === 0 ? { bar: 'bg-secondary', chip: 'bg-secondary-container text-on-secondary-container', text: 'text-secondary', deco: 'decoration-secondary' } : { bar: 'bg-primary', chip: 'bg-primary-container text-on-primary-container', text: 'text-primary', deco: 'decoration-primary' };
          const known = words[side.word];
          return (
            <div key={side.word} className="flex flex-col bg-surface-container rounded-xl p-space-md shadow-md relative overflow-hidden">
              <div className={cx('absolute top-0 inset-x-0 h-1', tone.bar)} />
              <div className="flex items-start justify-between mb-space-xs gap-1">
                <span className={cx('px-2 py-0.5 rounded-full font-label-sm text-label-sm tracking-wider uppercase', tone.chip)}>{side.pos}</span>
                <SpeakButton text={side.word} size={16} className={cx('w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center', tone.text)} />
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{side.word}</h3>
              <p className="font-label-md text-label-md text-outline mb-space-sm">{side.ipa}</p>
              <div className="flex flex-col gap-space-xs mb-space-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Kalıp Formülü</span>
                <div className={cx('px-2 py-1.5 rounded-lg bg-surface-container-low font-label-md text-label-md font-semibold text-center', tone.text)}>{side.formula}</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface mb-space-sm">{side.meaning}</p>
              <div className="mt-auto bg-surface-container-lowest/60 rounded-lg p-2.5">
                <span className="font-label-sm text-label-sm text-outline block mb-1">Cümle İçi:</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">{side.example}</p>
              </div>
              {known && !state.cards[known.id] && (
                <button type="button" onClick={() => addToBox(known.id)} className={cx('mt-2 font-label-sm text-label-sm flex items-center gap-1', tone.text)}>
                  <Icon name="add_circle" size={14} /> Kutu 1’e ekle
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm">
        <div className="w-14 h-14 rounded-xl bg-surface-container-high flex-shrink-0 flex items-center justify-center text-primary">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M4 16H14M14 16L10 12M14 16L10 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
            <circle cx="23" cy="16" r="6" stroke="#4edea3" strokeWidth="2.2" />
            <circle cx="23" cy="16" fill="#4edea3" r="2.5" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wider">{pair.logic.title}</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{pair.logic.text}</p>
        </div>
      </div>

      <div className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
            <Icon name="lightbulb" size={18} />
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">{pair.memory.title}</h4>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{pair.memory.subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-center">
          {pair.memory.pills.map((p) => (
            <div key={p.small} className={cx('flex flex-col py-1 px-0.5 rounded', pillTone[p.tone])}>
              <span className="font-headline-sm text-headline-sm font-bold">{p.big}</span>
              <span className="font-label-sm text-label-sm leading-tight">{p.small}</span>
            </div>
          ))}
        </div>
        {pair.exceptions && (
          <div className="p-space-sm rounded-lg bg-surface-container-high/60 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-tertiary">
              <Icon name="warning" size={16} />
              <span className="font-label-md text-label-md font-bold">İleri Düzey İstisnalar</span>
            </div>
            {pair.exceptions.map((e) => (
              <p key={e} className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">• {e}</p>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-container rounded-xl p-space-md shadow-lg flex flex-col gap-space-md relative overflow-hidden">
        {finished ? (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <Icon name={correct === pair.questions.length ? 'emoji_events' : 'task_alt'} size={40} fill className="text-tertiary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              {correct} / {pair.questions.length} Doğru
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {correct === pair.questions.length ? 'Kusursuz! Bu ayrımı artık biliyorsun.' : 'İpuçlarını tekrar oku ve testi yeniden dene.'}
            </p>
            <button type="button" onClick={() => { setQ(0); setCorrect(0); setChoice(null); }} className="font-label-lg text-label-lg text-primary flex items-center gap-1">
              <Icon name="replay" size={18} /> Testi Tekrarla
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold">
                  Soru {q + 1} / {pair.questions.length}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Icon name="check_circle" size={14} className="text-secondary" /> {correct} Doğru
                </span>
              </div>
              <div className={cx('flex items-center gap-1 font-label-md text-label-md', left <= 5 ? 'text-error' : 'text-tertiary')}>
                <Icon name="timer" size={16} />
                <span>{left}s</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm">
              <div className="flex items-start gap-2 mb-space-xs">
                <Icon name="help" size={20} className="text-secondary mt-0.5" />
                <p className="font-label-md text-label-md text-on-surface-variant">Boşluğa en uygun sözcüğü seçin:</p>
              </div>
              <blockquote className="font-headline-sm text-headline-sm text-on-surface leading-snug">
                “
                {question.sentence.split('___').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span
                        className={cx(
                          'px-3 py-1 mx-1 rounded-lg font-bold inline-block min-w-[90px] text-center tracking-wide',
                          choice === null ? 'bg-surface-container-high text-primary' : choice === question.answer ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container',
                        )}
                      >
                        {choice === null ? '________' : pair.sides[question.answer].word}
                      </span>
                    )}
                  </span>
                ))}
                ”
              </blockquote>
            </div>
            <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
              {pair.sides.map((side, i) => {
                const isAnswer = i === question.answer;
                const chosen = choice === i;
                return (
                  <button
                    key={side.word}
                    type="button"
                    onClick={() => answer(i as 0 | 1)}
                    disabled={choice !== null}
                    className={cx(
                      'h-16 rounded-xl font-headline-sm text-headline-sm flex flex-col items-center justify-center gap-0.5 shadow active:scale-95 transition-all',
                      choice !== null && isAnswer
                        ? 'bg-secondary text-on-secondary'
                        : chosen
                          ? 'bg-error text-on-error'
                          : i === 0
                            ? 'bg-surface-container-high hover:bg-surface-variant text-on-surface'
                            : 'bg-primary-container text-on-primary-container',
                    )}
                  >
                    <span lang="en" className="tracking-wider uppercase">{side.word}</span>
                    <span className="font-label-sm text-label-sm font-normal opacity-80">({side.pos})</span>
                  </button>
                );
              })}
            </div>
            {choice !== null && (
              <div
                className={cx(
                  'flex p-space-sm rounded-lg items-center gap-space-sm animate-fade-in',
                  choice === question.answer ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container',
                )}
              >
                <Icon name={choice === question.answer ? 'check_circle' : 'cancel'} size={22} />
                <div className="flex flex-col text-left flex-1">
                  <span className="font-label-md text-label-md font-bold">{choice === question.answer ? 'Harika! Doğru Seçim.' : left === 0 ? 'Süre Doldu!' : 'Yanlış Seçim'}</span>
                  <span className="font-body-sm text-body-sm leading-tight">{question.explanation}</span>
                </div>
                <button type="button" onClick={nextQuestion} className="px-3 py-2 rounded-lg bg-surface/30 font-label-md text-label-md shrink-0">
                  Devam
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={nextPair}
        className="w-full h-14 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] transition-all"
      >
        <span>Sonraki Çifte Geç: {nextTitle}</span>
        <Icon name="arrow_forward" size={20} />
      </button>
    </SubScreen>
  );
}
