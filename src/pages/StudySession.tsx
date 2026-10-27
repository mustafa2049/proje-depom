import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flashcard, type SwipeDirection } from '../components/Flashcard';
import { EmptyState, cx, Icon, PrimaryButton, ProgressBar, BoxStrip } from '../components/ui';
import { checkAnswer, type AnswerVerdict } from '../lib/answer';
import { nextBox, previewInterval } from '../lib/leitner';
import { vibrate } from '../lib/speech';
import type { ReviewOutcome, SessionMove } from '../lib/types';
import { useStore } from '../store/AppStore';
import { dailyPlan, streak } from '../store/selectors';
import { getDeck } from '../data/decks';

const SESSION_BONUS_XP = 10;

export default function StudySession() {
  const { state, dispatch, words } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const deckId = params.get('deste') ?? undefined;
  const mode = params.get('mod'); // "hatalar" → yalnızca pratik, SRS'yi etkilemez
  const practiceOnly = mode === 'hatalar';

  // Oturum kuyruğu bir kez oluşturulur; çalışırken değişmez.
  const [queue] = useState<string[]>(() => {
    if (practiceOnly) {
      return (state.lastSession?.moves ?? []).filter((m) => m.outcome === 'forgot').map((m) => m.wordId);
    }
    const plan = dailyPlan(state, Date.now(), deckId);
    return [...plan.dueIds, ...plan.newIds];
  });

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<AnswerVerdict | null>(null);
  const [exiting, setExiting] = useState<SwipeDirection | null>(null);
  const moves = useRef<SessionMove[]>([]);
  const startedAt = useRef(Date.now());
  const xpEarned = useRef(0);

  const wordId = queue[index];
  const word = wordId ? words[wordId] : undefined;
  const card = wordId ? state.cards[wordId] : undefined;
  const s = streak(state);

  const finish = useCallback(() => {
    const durationMs = Date.now() - startedAt.current;
    dispatch({ type: 'logStudyTime', ms: durationMs });
    if (practiceOnly) {
      navigate('/ogren/ozet', { replace: true });
      return;
    }
    dispatch({ type: 'addXp', amount: SESSION_BONUS_XP });
    dispatch({
      type: 'finishSession',
      result: {
        finishedAt: Date.now(),
        durationMs,
        moves: moves.current,
        xp: xpEarned.current + SESSION_BONUS_XP,
        source: deckId ? `deck:${deckId}` : 'daily',
      },
    });
    navigate('/ogren/ozet', { replace: true });
  }, [dispatch, navigate, practiceOnly, deckId]);

  const rate = useCallback(
    (outcome: ReviewOutcome) => {
      if (!wordId || exiting) return;
      vibrate(outcome === 'forgot' ? 60 : 30);
      const from = card?.box ?? 0;
      if (!practiceOnly) {
        moves.current.push({ wordId, from, to: nextBox(from, outcome), outcome });
        xpEarned.current += outcome === 'forgot' ? 1 : 5;
        dispatch({ type: 'review', wordId, outcome });
      }
      setExiting(outcome === 'know' ? 'right' : outcome === 'forgot' ? 'left' : 'up');
      setTimeout(() => {
        setExiting(null);
        setFlipped(false);
        setTyped('');
        setVerdict(null);
        if (index + 1 >= queue.length) finish();
        else setIndex((i) => i + 1);
      }, 280);
    },
    [wordId, exiting, card, practiceOnly, dispatch, index, queue.length, finish],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowLeft' || e.key === '1') rate('forgot');
      else if (e.key === 'ArrowUp' || e.key === '2') rate('easy');
      else if (e.key === 'ArrowRight' || e.key === '3') rate('know');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rate]);

  const knowTarget = useMemo(() => nextBox(card?.box ?? 0, 'know'), [card]);
  // Kart yönü: karışık modda kartların yarısı ters sorulur (oturum boyunca sabit)
  const direction = state.profile.cardDirection;
  const reverse = direction === 'tr-en' || (direction === 'mixed' && (index * 7 + (wordId?.length ?? 0)) % 2 === 1);
  const typeMode = state.profile.typeAnswer;
  const submitTyped = () => {
    if (!word || !typed.trim()) return;
    const v = checkAnswer(typed, word, reverse);
    setVerdict(v);
    setFlipped(true);
    vibrate(v === 'wrong' ? 80 : 30);
  };

  if (!queue.length || !word) {
    return (
      <main className="min-h-screen flex flex-col justify-center max-w-md mx-auto px-margin py-10 gap-4">
        <EmptyState
          icon="task_alt"
          title={practiceOnly ? 'Tekrar edilecek hata yok' : 'Bugünlük tüm kartlar tamam!'}
          text={
            practiceOnly
              ? 'Son oturumda unuttuğun kelime bulunmuyor.'
              : 'Vadesi gelen kartın kalmadı. Pratik modülleriyle kelimelerini pekiştirebilir ya da kütüphaneden yeni bir deste seçebilirsin.'
          }
          action={
            <div className="flex flex-col gap-2 w-full">
              <PrimaryButton onClick={() => navigate('/pratik')}>
                <Icon name="psychology" size={20} /> Pratik Modüllerine Git
              </PrimaryButton>
              <button type="button" className="font-label-lg text-label-lg text-primary py-2" onClick={() => navigate('/')}>
                Ana Sayfaya Dön
              </button>
            </div>
          }
        />
      </main>
    );
  }

  const progress = (index / queue.length) * 100;
  const deck = deckId ? getDeck(deckId) : undefined;

  return (
    <main className="min-h-screen flex flex-col w-full max-w-md mx-auto px-margin pt-safe pb-safe select-none">
      <div className="flex flex-col gap-space-xs py-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Oturumu sonlandır"
              type="button"
              onClick={() => (moves.current.length ? finish() : navigate(-1))}
              className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center active:scale-95 transition-transform"
            >
              <Icon name="close" size={18} />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md">
              <Icon name="bolt" size={16} className="text-tertiary" />
              <span>
                {index + 1} / {queue.length} Kelime
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-tertiary font-label-md text-label-md shadow-sm">
            <Icon name="local_fire_department" size={16} fill />
            <span className="text-on-surface font-semibold">{practiceOnly ? 'Hızlı Tekrar' : `${s} Gün Seri`}</span>
          </div>
        </div>
        <ProgressBar value={progress} className="mt-1" />
        {deck && <p className="font-label-sm text-label-sm text-on-surface-variant">{deck.emoji} {deck.title}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-2 my-1 rounded-xl bg-surface-container-low text-on-surface-variant">
        <div className="flex items-center gap-2 shrink-0">
          <Icon name="view_carousel" size={18} className="text-primary" />
          <span lang="en" className="font-label-sm text-label-sm tracking-wider uppercase">Leitner</span>
        </div>
        <div className="w-40">
          <BoxStrip active={card?.box ?? 0} compact />
        </div>
      </div>

      <Flashcard
        word={word}
        card={card}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
        onSwipe={(dir) => rate(dir === 'right' ? 'know' : 'forgot')}
        exiting={exiting}
        reverse={reverse}
      />

      {typeMode && !flipped ? (
        <form
          className="flex gap-2 py-1"
          onSubmit={(e) => {
            e.preventDefault();
            submitTyped();
          }}
        >
          <input
            aria-label={reverse ? 'İngilizcesini yaz' : 'Türkçe anlamını yaz'}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={reverse ? 'İngilizcesini yaz…' : 'Türkçe anlamını yaz…'}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            lang={reverse ? 'en' : 'tr'}
            className="flex-1 h-12 px-4 rounded-xl bg-surface-container-high text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary placeholder:text-outline"
          />
          <button type="submit" disabled={!typed.trim()} className="h-12 px-4 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg disabled:opacity-40">
            Kontrol
          </button>
        </form>
      ) : verdict ? (
        <div
          className={cx(
            'flex items-center gap-2 px-3 py-2 rounded-xl font-label-md text-label-md',
            verdict === 'correct' ? 'bg-secondary-container/30 text-secondary' : verdict === 'close' ? 'bg-tertiary-container/30 text-tertiary' : 'bg-error-container/30 text-error',
          )}
        >
          <Icon name={verdict === 'correct' ? 'check_circle' : verdict === 'close' ? 'spellcheck' : 'cancel'} size={18} />
          <span>
            {verdict === 'correct' ? 'Doğru! “Biliyorum”a bas.' : verdict === 'close' ? `Neredeyse — küçük bir yazım hatası. Senin cevabın: “${typed}”` : `Yanlış. Senin cevabın: “${typed}”`}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 py-1 text-outline font-label-sm text-label-sm">
          <Icon name="swipe" size={16} />
          <span>Sağa/sola kaydırın veya aşağıdaki butonları kullanın</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5 pt-2 pb-3 mt-auto">
        <button
          type="button"
          onClick={() => rate('forgot')}
          className="flex flex-col items-center justify-center min-h-[56px] p-2.5 rounded-xl bg-error-container/30 hover:bg-error-container/50 active:scale-95 transition-all text-center group"
        >
          <div className="flex items-center gap-1 mb-0.5">
            <Icon name="arrow_back" size={18} className="text-error group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-headline-sm text-label-lg font-bold text-error">Unuttum</span>
          </div>
          <span className="font-label-sm text-[11px] text-error/80 leading-tight">Kutu 1’e döner</span>
        </button>
        <button
          type="button"
          onClick={() => rate('easy')}
          className="flex flex-col items-center justify-center min-h-[56px] p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-95 transition-all text-center"
        >
          <div className="flex items-center gap-1 mb-0.5">
            <Icon name="done_all" size={18} className="text-primary" />
            <span className="font-headline-sm text-label-lg font-bold text-on-surface">Çok Kolay</span>
          </div>
          <span className="font-label-sm text-[11px] text-on-surface-variant leading-tight">Kutu 5 Arşiv</span>
        </button>
        <button
          type="button"
          onClick={() => rate('know')}
          className="flex flex-col items-center justify-center min-h-[56px] p-2.5 rounded-xl bg-secondary-container/30 hover:bg-secondary-container/50 active:scale-95 transition-all text-center group"
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-headline-sm text-label-lg font-bold text-secondary">Biliyorum</span>
            <Icon name="arrow_forward" size={18} className="text-secondary group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className={cx('font-label-sm text-[11px] text-secondary/80 leading-tight')}>
            Kutu {knowTarget} (+{previewInterval(card, 'know', state.profile.smartIntervals)} Gün)
          </span>
        </button>
      </div>
      {practiceOnly && (
        <p className="text-center font-label-sm text-label-sm text-on-surface-variant pb-3">
          Hızlı tekrar modu: cevapların Leitner kutularını değiştirmez.
        </p>
      )}
    </main>
  );
}
