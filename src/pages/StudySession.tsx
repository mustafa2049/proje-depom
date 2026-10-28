import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AiCardTools, type AiCardTab } from '../components/AiCardTools';
import { ExtraStudyButton } from '../components/ExtraStudy';
import { Flashcard, type SwipeDirection } from '../components/Flashcard';
import { EmptyState, cx, Icon, PrimaryButton, ProgressBar, BoxStrip } from '../components/ui';
import { aiAvailable } from '../lib/ai';
import { checkAnswer, type AnswerVerdict } from '../lib/answer';
import { useBackHandler } from '../lib/backButton';
import { nextBox, previewInterval } from '../lib/leitner';
import { speak, vibrate } from '../lib/speech';
import type { CardState, ReviewOutcome, SessionMove } from '../lib/types';
import { useStore } from '../store/AppStore';
import { dailyPlan, streak, unseenWords } from '../store/selectors';
import { getDeck } from '../data/decks';

const SESSION_BONUS_XP = 10;

/** Geri alınabilmesi için her değerlendirmeden önceki durum */
interface UndoEntry {
  index: number;
  wordId: string;
  prev: CardState | undefined;
  outcome: ReviewOutcome;
  at: number;
}

export default function StudySession() {
  const { state, dispatch, words } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const deckId = params.get('deste') ?? undefined;
  const mode = params.get('mod'); // "hatalar" → yalnızca pratik, SRS'yi etkilemez
  const practiceOnly = mode === 'hatalar';
  // "ekstra=5" → günlük plan bitince günlük kotadan bağımsız ek yeni kelime turu
  const extra = Math.min(20, Math.max(0, Number(params.get('ekstra')) || 0));

  // Oturum kuyruğu bir kez oluşturulur; çalışırken değişmez.
  const [queue] = useState<string[]>(() => {
    if (practiceOnly) {
      return (state.lastSession?.moves ?? []).filter((m) => m.outcome === 'forgot').map((m) => m.wordId);
    }
    if (extra) return unseenWords(state, deckId).slice(0, extra).map((w) => w.id);
    const plan = dailyPlan(state, Date.now(), deckId);
    return [...plan.dueIds, ...plan.newIds];
  });

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<AnswerVerdict | null>(null);
  const [exiting, setExiting] = useState<SwipeDirection | null>(null);
  const [aiTab, setAiTab] = useState<AiCardTab | null>(null);
  const moves = useRef<SessionMove[]>([]);
  const startedAt = useRef(Date.now());
  const xpEarned = useRef(0);
  const undoStack = useRef<UndoEntry[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const spokenIndex = useRef(-1);

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
        source: extra ? 'extra' : deckId ? `deck:${deckId}` : 'daily',
      },
    });
    navigate('/ogren/ozet', { replace: true });
  }, [dispatch, navigate, practiceOnly, deckId, extra]);

  const rate = useCallback(
    (outcome: ReviewOutcome) => {
      if (!wordId || exiting) return;
      vibrate(outcome === 'forgot' ? 60 : 30);
      const from = card?.box ?? 0;
      const at = Date.now();
      undoStack.current.push({ index, wordId, prev: card, outcome, at });
      setCanUndo(true);
      if (!practiceOnly) {
        moves.current.push({ wordId, from, to: nextBox(from, outcome), outcome });
        xpEarned.current += outcome === 'forgot' ? 1 : 5;
        dispatch({ type: 'review', wordId, outcome, now: at });
      }
      setExiting(outcome === 'know' ? 'right' : outcome === 'forgot' ? 'left' : 'up');
      setTimeout(() => {
        setExiting(null);
        setFlipped(false);
        setTyped('');
        setVerdict(null);
        setAiTab(null);
        if (index + 1 >= queue.length) finish();
        else setIndex((i) => i + 1);
      }, 280);
    },
    [wordId, exiting, card, practiceOnly, dispatch, index, queue.length, finish],
  );

  /** Son cevabı geri alır ve o karta döner (yanlış butona basıldığında). */
  const undo = useCallback(() => {
    if (exiting) return;
    const last = undoStack.current.pop();
    if (!last) return;
    if (!practiceOnly) {
      moves.current.pop();
      xpEarned.current -= last.outcome === 'forgot' ? 1 : 5;
      dispatch({ type: 'undoReview', wordId: last.wordId, prev: last.prev, outcome: last.outcome, at: last.at });
    }
    setCanUndo(undoStack.current.length > 0);
    spokenIndex.current = -1;
    setIndex(last.index);
    setFlipped(false);
    setTyped('');
    setVerdict(null);
    setAiTab(null);
    vibrate(20);
  }, [exiting, practiceOnly, dispatch]);

  // Android geri tuşu: cevaplanmış kart varsa oturumu kaydedip özete geç
  useBackHandler(() => {
    if (!moves.current.length) return false;
    finish();
    return true;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (aiTab || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowLeft' || e.key === '1') rate('forgot');
      else if (e.key === 'ArrowUp' || e.key === '2') rate('easy');
      else if (e.key === 'ArrowRight' || e.key === '3') rate('know');
      else if (e.key === 'Backspace' || e.key === 'z') undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rate, undo, aiTab]);

  const knowTarget = useMemo(() => nextBox(card?.box ?? 0, 'know'), [card]);
  // Kart yönü: karışık modda kartların yarısı ters sorulur (oturum boyunca sabit)
  const direction = state.profile.cardDirection;
  const reverse = direction === 'tr-en' || (direction === 'mixed' && (index * 7 + (wordId?.length ?? 0)) % 2 === 1);
  const typeMode = state.profile.typeAnswer;
  const ai = aiAvailable();

  // Otomatik seslendirme: İngilizce kelime görünür olduğunda bir kez okunur (ters kartta cevap çevrilince)
  const { autoSpeak, ttsRate } = state.profile;
  useEffect(() => {
    if (!autoSpeak || !word || exiting) return;
    const englishVisible = reverse ? flipped : true;
    if (!englishVisible || spokenIndex.current === index) return;
    spokenIndex.current = index;
    speak(word.word, { rate: ttsRate });
  }, [autoSpeak, ttsRate, word, index, flipped, reverse, exiting]);
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
              {!practiceOnly && <ExtraStudyButton deckId={deckId} replace />}
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
            {canUndo && (
              <button
                aria-label="Son cevabı geri al"
                type="button"
                onClick={undo}
                title="Geri al"
                className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center active:scale-95 transition-transform animate-fade-in"
              >
                <Icon name="undo" size={18} />
              </button>
            )}
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
            className="flex-1 min-w-0 h-12 px-4 rounded-xl bg-surface-container-high text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary placeholder:text-outline"
          />
          <button type="submit" disabled={!typed.trim()} className="h-12 px-4 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg disabled:opacity-40">
            Kontrol
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-2 py-1">
          {verdict && (
            <div
              className={cx(
                'flex items-center gap-2 px-3 py-2 rounded-xl font-label-md text-label-md',
                verdict === 'correct' ? 'bg-secondary-container/30 text-secondary' : verdict === 'close' ? 'bg-tertiary-container/30 text-tertiary' : 'bg-error-container/30 text-error',
              )}
            >
              <Icon name={verdict === 'correct' ? 'check_circle' : verdict === 'close' ? 'spellcheck' : 'cancel'} size={18} />
              <span className="flex-1">
                {verdict === 'correct' ? 'Doğru! “Biliyorum”a bas.' : verdict === 'close' ? `Neredeyse — küçük bir yazım hatası. Senin cevabın: “${typed}”` : `Yanlış. Senin cevabın: “${typed}”`}
              </span>
              {verdict !== 'correct' && ai && (
                <button type="button" onClick={() => setAiTab('why')} className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface flex items-center gap-1">
                  <Icon name="help" size={16} className="text-tertiary" /> Neden?
                </button>
              )}
            </div>
          )}
          {flipped && ai ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAiTab('examples')}
                className="flex-1 h-10 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Icon name="auto_awesome" size={16} className="text-tertiary" /> Yeni örnek
              </button>
              <button
                type="button"
                onClick={() => setAiTab('sentence')}
                className="flex-1 h-10 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Icon name="edit_note" size={16} className="text-primary" /> Cümle kur
              </button>
            </div>
          ) : (
            !verdict && (
              <div className="flex items-center justify-center gap-2 text-outline font-label-sm text-label-sm">
                <Icon name="swipe" size={16} />
                <span>Sağa/sola kaydırın veya aşağıdaki butonları kullanın</span>
              </div>
            )
          )}
        </div>
      )}

      <AiCardTools
        word={word}
        open={aiTab !== null}
        onClose={() => setAiTab(null)}
        tab={aiTab ?? 'examples'}
        mistake={verdict && verdict !== 'correct' ? { answer: typed, reverse } : undefined}
        key={word.id}
      />

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
