import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubScreen } from '../../components/Layout';
import { BoxStrip, cx, Icon, PrimaryButton, shuffle, splitByTerm, SpeakButton } from '../../components/ui';
import { BOX_COLORS, BOX_INTERVALS, isDue, nextBox } from '../../lib/leitner';
import { speak, vibrate } from '../../lib/speech';
import type { AppState, Word } from '../../lib/types';
import { useStore } from '../../store/AppStore';
import { allWords } from '../../store/selectors';

const ROUND_SIZE = 4;

/** Quiz havuzu: önce vadesi gelen, sonra düşük kutudaki kartlar; yetmezse aktif destelerden kelimeler. */
export function buildQuizPool(state: AppState, words: Record<string, Word>, size = ROUND_SIZE): Word[] {
  const usable = (w?: Word) => !!w && w.examples.some((e) => splitByTerm(e.en, w.word).some((p) => p.match));
  const cards = Object.values(state.cards)
    .filter((c) => usable(words[c.wordId]))
    .sort((a, b) => Number(isDue(b)) - Number(isDue(a)) || a.box - b.box || a.dueDay - b.dueDay);
  const picked = cards.slice(0, size).map((c) => words[c.wordId]);
  if (picked.length < size) {
    const extra = shuffle(allWords(state).filter((w) => state.enrolledDecks.includes(w.deckId) && !picked.includes(w) && usable(w)));
    picked.push(...extra.slice(0, size - picked.length));
  }
  return shuffle(picked);
}

function distractors(target: Word, all: Word[], n = 3): string[] {
  const samePos = shuffle(all.filter((w) => w.id !== target.id && w.pos === target.pos && !w.word.includes(' ')));
  const others = shuffle(all.filter((w) => w.id !== target.id && w.pos !== target.pos && !w.word.includes(' ')));
  return [...samePos, ...others].slice(0, n).map((w) => w.word);
}

type Stage = 0 | 1 | 2;
const STAGES = [
  { icon: 'edit_note', label: '1. Boşluk Doldurma' },
  { icon: 'headphones', label: '2. Dinle & Yaz' },
  { icon: 'join_right', label: '3. Eşleştirme' },
];

export default function Quiz() {
  const { state, dispatch, words } = useStore();
  const navigate = useNavigate();
  const [seed, setSeed] = useState(0);
  const pool = useMemo(() => buildQuizPool(state, words), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const everyone = useMemo(() => allWords(state), [state]);
  const [stage, setStage] = useState<Stage>(0);
  const [item, setItem] = useState(0);
  const [score, setScore] = useState<Record<string, number>>({});
  const [answered, setAnswered] = useState<string | null>(null);
  const [typed, setTyped] = useState<number[]>([]);
  const [matchSel, setMatchSel] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<{ word: Word; from: number; to: number; correct: number }[]>([]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  const word = pool[item];
  const options = useMemo(() => (word ? shuffle([word.word, ...distractors(word, everyone)]) : []), [word, everyone]);
  const letters = useMemo(() => (word ? shuffle(word.word.split('').map((ch, i) => ({ ch, i }))) : []), [word]);
  const meanings = useMemo(() => shuffle(pool.map((w) => w.id)), [pool]);
  const example = word?.examples.find((e) => splitByTerm(e.en, word.word).some((p) => p.match));

  useEffect(() => {
    if (stage === 1 && word) speak(word.word, { rate: state.profile.ttsRate });
  }, [stage, item]); // eslint-disable-line react-hooks/exhaustive-deps

  if (pool.length < 2) {
    return (
      <SubScreen title="Aktif Hatırlama">
        <p className="font-body-md text-body-md text-on-surface-variant">Quiz için yeterli kelime yok. Kütüphaneden bir deste etkinleştir.</p>
      </SubScreen>
    );
  }

  const mark = (id: string, ok: boolean) => {
    setScore((s) => ({ ...s, [id]: (s[id] ?? 0) + (ok ? 1 : 0) }));
    vibrate(ok ? 30 : 80);
  };

  const finish = (finalScore: Record<string, number>) => {
    const res = pool.map((w) => {
      const correct = finalScore[w.id] ?? 0;
      const card = state.cards[w.id];
      const from = card?.box ?? 0;
      let to = from;
      if (card) {
        const outcome = correct >= 2 ? 'know' : 'forgot';
        to = nextBox(card.box, outcome);
        dispatch({ type: 'review', wordId: w.id, outcome });
      }
      return { word: w, from, to, correct };
    });
    const totalCorrect = res.reduce((s, r) => s + r.correct, 0);
    dispatch({ type: 'addXp', amount: totalCorrect * 5 });
    setResults(res);
    setDone(true);
  };

  const next = () => {
    setAnswered(null);
    setTyped([]);
    if (stage < 2 && item + 1 < pool.length) {
      setItem((i) => i + 1);
      return;
    }
    if (stage < 2) {
      setStage((s) => (s + 1) as Stage);
      setItem(0);
      return;
    }
    finish(score);
  };

  if (done) {
    const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
    return (
      <SubScreen title="Aktif Hatırlama">
        <section className="bg-surface-container-high rounded-xl p-space-lg text-center shadow-xl flex flex-col items-center gap-2">
          <Icon name="emoji_events" size={44} fill className="text-tertiary" />
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Quiz Tamamlandı!</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {pool.length * 3} sorudan {totalCorrect} doğru • {Math.floor(elapsed / 60)} dk {elapsed % 60} sn
          </p>
          <span className="px-3 py-1 rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg">+{totalCorrect * 5} XP</span>
        </section>
        <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-2">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Leitner Sonuçları</h3>
          {results.map((r) => (
            <div key={r.word.id} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high">
              <div>
                <p className="font-label-lg text-label-lg text-on-surface">{r.word.word}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{r.correct}/3 doğru</p>
              </div>
              {r.from ? (
                <span className={cx('font-label-md text-label-md', r.to > r.from ? 'text-secondary' : 'text-error')}>
                  Kutu {r.from} ➔ Kutu {r.to}
                </span>
              ) : (
                <span className="font-label-sm text-label-sm text-outline">Pratik (kutuda değil)</span>
              )}
            </div>
          ))}
          <p className="font-label-sm text-label-sm text-on-surface-variant">3 aşamanın en az 2’sinde doğru bilinen kelimeler bir üst kutuya çıkar.</p>
        </section>
        <PrimaryButton
          onClick={() => {
            setSeed((s) => s + 1);
            setStage(0);
            setItem(0);
            setScore({});
            setMatched([]);
            setElapsed(0);
            setDone(false);
          }}
        >
          <Icon name="replay" size={20} /> Yeni Quiz
        </PrimaryButton>
        <button type="button" className="font-label-lg text-label-lg text-primary py-2" onClick={() => navigate('/pratik')}>
          Pratik Merkezine Dön
        </button>
      </SubScreen>
    );
  }

  const card = word ? state.cards[word.id] : undefined;
  const target = card ? nextBox(card.box, 'know') : 0;
  const typedWord = typed.map((i) => letters[i].ch).join('');
  const stageDone = stage === 2 ? matched.length === pool.length : answered !== null;

  return (
    <SubScreen title="Aktif Hatırlama" bottomPadding="pb-36">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container">
            <Icon name="verified" size={18} />
          </span>
          <div>
            <p className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">Aktif Hatırlama</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {stage < 2 && card ? `Kutu ${card.box} → Kutu ${target} Yükseltme` : `${pool.length} kelime • 3 aşama`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-tertiary">
          <Icon name="hourglass_top" size={16} />
          <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide">
            {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {stage < 2 && (
        <div className="bg-surface-container rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Leitner Kademesi</span>
            {card ? (
              <span className={cx('font-label-sm text-label-sm font-bold flex items-center gap-1', BOX_COLORS[card.box].text)}>
                Kutu {card.box}: {BOX_INTERVALS[card.box]} Günlük Aralık <Icon name="arrow_forward" size={14} /> Kutu {target}
              </span>
            ) : (
              <span className="font-label-sm text-label-sm text-outline">Henüz kutuda değil (pratik)</span>
            )}
          </div>
          <BoxStrip active={card?.box ?? 0} labels={false} />
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto py-1 -mx-margin px-margin no-scrollbar">
        {STAGES.map((s, i) => (
          <div
            key={s.label}
            className={cx(
              'flex items-center gap-1.5 px-3 py-2 rounded-full shrink-0',
              i === stage ? 'bg-primary-container text-on-primary-container shadow-sm' : i < stage ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container text-on-surface-variant',
            )}
          >
            <Icon name={i < stage ? 'check_circle' : s.icon} size={16} />
            <span className={cx('font-label-md text-label-md', i === stage && 'font-bold')}>{s.label}</span>
          </div>
        ))}
      </div>

      {stage === 0 && word && example && (
        <section className="relative bg-surface-container rounded-xl p-5 shadow-md overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-primary">
              <Icon name="psychology" size={14} />
              <span className="font-label-sm text-label-sm tracking-wide">Cümle İçi Doğrulama</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Soru {item + 1} / {pool.length}
            </span>
          </div>
          <p className="font-headline-sm text-headline-sm text-on-surface leading-relaxed mb-4">
            “
            {splitByTerm(example.en, word.word).map((p, i) =>
              p.match ? (
                <span
                  key={i}
                  className={cx(
                    'inline-block px-2.5 py-0.5 rounded-lg font-bold min-w-[80px] text-center',
                    answered ? (answered === word.word ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container') : 'bg-surface-container-highest text-secondary',
                  )}
                >
                  {answered ? p.text : '_____'}
                </span>
              ) : (
                <span key={i}>{p.text}</span>
              ),
            )}
            ”
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {word.ipa && (
              <SpeakButton
                text={word.word}
                label={answered ? word.ipa : 'İpucu: Dinle'}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-high text-tertiary font-label-md text-label-md"
              />
            )}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-md text-label-md">
              <Icon name="translate" size={14} />
              <span>({word.meaning})</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {options.map((opt, i) => {
              const isCorrect = opt === word.word;
              const chosen = answered === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={answered !== null}
                  onClick={() => {
                    setAnswered(opt);
                    mark(word.id, isCorrect);
                  }}
                  className={cx(
                    'w-full flex items-center justify-between p-3.5 rounded-xl font-headline-sm text-headline-sm text-left shadow-sm transition-transform active:scale-[0.98]',
                    answered && isCorrect
                      ? 'bg-secondary-container text-on-secondary-container shadow-md'
                      : chosen
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container/40 font-label-lg text-label-lg font-bold">
                      {'ABCD'[i]}
                    </span>
                    <span className={cx('tracking-tight', answered && isCorrect ? 'font-bold' : 'font-normal')}>{opt}</span>
                  </div>
                  <Icon name={answered && isCorrect ? 'check_circle' : chosen ? 'cancel' : 'circle'} size={22} className={!answered ? 'text-surface-container-highest' : undefined} />
                </button>
              );
            })}
          </div>
          {answered && example.tr && <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant italic">{example.tr}</p>}
        </section>
      )}

      {stage === 1 && word && (
        <section className="bg-surface-container rounded-xl p-4 shadow-md flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold">2</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Dinle ve Yaz</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {item + 1} / {pool.length}
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high">
            <button
              type="button"
              aria-label="Kelimeyi dinle"
              onClick={() => speak(word.word, { rate: state.profile.ttsRate })}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-on-primary shadow transition-transform active:scale-95 shrink-0"
            >
              <Icon name="play_arrow" size={22} fill />
            </button>
            <div className="flex-1 flex items-center gap-1 h-8 px-2 overflow-hidden" aria-hidden="true">
              {[3, 5, 7, 4, 6, 8, 5, 6, 4, 7, 5, 3, 2].map((h, i) => (
                <span key={i} className={cx('w-1 rounded-full', i % 3 ? 'bg-primary' : 'bg-primary-container')} style={{ height: h * 4 }} />
              ))}
            </div>
            <button type="button" onClick={() => speak(word.word, { rate: 0.6 })} className="font-label-sm text-label-sm text-on-surface-variant shrink-0 px-2 py-1 rounded-full bg-surface-container">
              Yavaş
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 min-h-[44px] flex-wrap p-2 rounded-lg bg-surface-container-lowest">
            {typed.length === 0 && <span className="font-label-md text-label-md text-outline">Harflere dokunarak kelimeyi oluştur</span>}
            {typed.map((li, k) => (
              <button
                key={k}
                type="button"
                disabled={answered !== null}
                onClick={() => setTyped((t) => t.filter((_, j) => j !== k))}
                className={cx(
                  'w-8 h-9 rounded-lg flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-sm',
                  answered ? (answered === 'ok' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container') : 'bg-primary-container/30 text-on-surface',
                )}
              >
                {letters[li].ch === ' ' ? '␣' : letters[li].ch}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1 flex-wrap">
            {letters.map((l, li) => (
              <button
                key={li}
                type="button"
                disabled={typed.includes(li) || answered !== null}
                onClick={() => setTyped((t) => [...t, li])}
                className="w-8 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center font-headline-sm text-headline-sm text-on-surface font-bold shadow-sm disabled:opacity-20 active:scale-90 transition-all"
              >
                {l.ch === ' ' ? '␣' : l.ch}
              </button>
            ))}
          </div>
          {answered === null ? (
            <button
              type="button"
              disabled={typed.length !== letters.length}
              onClick={() => {
                const ok = typedWord.toLowerCase() === word.word.toLowerCase();
                setAnswered(ok ? 'ok' : 'fail');
                mark(word.id, ok);
              }}
              className="w-full h-12 rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg disabled:opacity-40"
            >
              Kontrol Et
            </button>
          ) : (
            <p className={cx('font-label-lg text-label-lg text-center', answered === 'ok' ? 'text-secondary' : 'text-error')}>
              {answered === 'ok' ? 'Harika! Doğru yazdın.' : `Doğrusu: ${word.word}`} — {word.meaning}
            </p>
          )}
        </section>
      )}

      {stage === 2 && (
        <section className="bg-surface-container rounded-xl p-4 shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold">3</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Eşleştirme</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {matched.length} / {pool.length}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Kelimeyi seç, sonra Türkçe karşılığına dokun.</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              {pool.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  disabled={matched.includes(w.id)}
                  onClick={() => setMatchSel(w.id)}
                  className={cx(
                    'p-3 rounded-lg font-body-md text-body-md font-bold text-center transition-all min-h-[56px]',
                    matched.includes(w.id)
                      ? 'bg-secondary-container text-on-secondary-container opacity-60'
                      : matchSel === w.id
                        ? 'bg-primary-container text-on-primary-container ring-2 ring-primary'
                        : 'bg-surface-container-high text-on-surface',
                  )}
                >
                  {w.word}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {meanings.map((id) => (
                <button
                  key={id}
                  type="button"
                  disabled={matched.includes(id) || !matchSel}
                  onClick={() => {
                    if (!matchSel) return;
                    const ok = matchSel === id;
                    mark(matchSel, ok);
                    if (ok) {
                      const nextMatched = [...matched, id];
                      setMatched(nextMatched);
                    } else {
                      setWrongPair(id);
                      setTimeout(() => setWrongPair(null), 500);
                    }
                    setMatchSel(null);
                  }}
                  className={cx(
                    'p-3 rounded-lg font-body-sm text-body-sm text-center transition-all min-h-[56px]',
                    matched.includes(id)
                      ? 'bg-secondary-container text-on-secondary-container opacity-60'
                      : wrongPair === id
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container-high text-on-surface disabled:opacity-70',
                  )}
                >
                  {words[id]?.meaning}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="fixed bottom-0 inset-x-0 z-40 px-margin pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-surface via-surface/95 to-transparent">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between gap-3 mb-2 px-1">
            <div className="flex items-center gap-1.5 text-secondary">
              <Icon name="vibration" size={16} />
              <span className="font-label-sm text-label-sm">
                {Object.values(score).reduce((a, b) => a + b, 0)} doğru cevap
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary font-semibold">+5 XP / doğru</span>
          </div>
          <button
            type="button"
            disabled={!stageDone}
            onClick={next}
            className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold shadow-lg transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            <span>{stage === 2 ? 'Sonuçları Gör' : item + 1 < pool.length ? 'Sonraki Soru' : 'Sonraki Aşamaya Geç'}</span>
            <Icon name="arrow_forward" size={20} />
          </button>
        </div>
      </div>
    </SubScreen>
  );
}
