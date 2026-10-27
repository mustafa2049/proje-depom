import { useEffect, useMemo, useRef, useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { cx, Icon, SpeakButton } from '../../components/ui';
import { STORIES, type Story } from '../../data/modules';
import { aiAvailable } from '../../lib/ai';
import { aiStory } from '../../lib/aiTasks';
import { BOX_COLORS, isDue } from '../../lib/leitner';
import { speak, stopSpeaking } from '../../lib/speech';
import type { AppState } from '../../lib/types';
import { useStore } from '../../store/AppStore';

interface Segment {
  text: string;
  wordId?: string;
  /** Okuma metnindeki karakter başlangıcı (karaoke vurgusu için) */
  start: number;
}

function parseParagraph(raw: string): { segments: Segment[]; plain: string } {
  const segments: Segment[] = [];
  let plain = '';
  let last = 0;
  for (const m of raw.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
    if (m.index! > last) {
      const t = raw.slice(last, m.index);
      segments.push({ text: t, start: plain.length });
      plain += t;
    }
    const surface = m[2] ?? m[1];
    segments.push({ text: surface, wordId: m[1], start: plain.length });
    plain += surface;
    last = m.index! + m[0].length;
  }
  if (last < raw.length) {
    const t = raw.slice(last);
    segments.push({ text: t, start: plain.length });
    plain += t;
  }
  return { segments, plain };
}

function storyWordIds(story: Story): string[] {
  return [...new Set(story.paragraphs.flatMap((p) => [...p.en.matchAll(/\[\[([^\]|]+)/g)].map((m) => m[1])))];
}

/** Kullanıcının Kutu 1-2'deki kelimelerini en çok içeren hikayeyi önerir. */
function recommend(state: AppState, stories: Story[]): number {
  let best = 0;
  let bestScore = -1;
  stories.forEach((s, i) => {
    const ids = storyWordIds(s);
    const score = ids.reduce((sum, id) => sum + (state.cards[id] && state.cards[id].box <= 2 ? 2 : state.cards[id] ? 1 : 0), 0) - (state.completedStories.includes(s.id) ? 5 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}

export default function StoryReader() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  const stories = useMemo(() => [...state.aiStories, ...STORIES], [state.aiStories]);
  const [storyIndex, setStoryIndex] = useState(() => recommend(state, [...state.aiStories, ...STORIES]));
  const story = stories[Math.min(storyIndex, stories.length - 1)];
  const [generating, setGenerating] = useState(false);

  /** Kutu 1-2'deki (yoksa en düşük kutulardaki) kelimelerle yapay zekâya yeni hikaye yazdırır. */
  const generate = async () => {
    const pool = Object.values(state.cards)
      .filter((c) => words[c.wordId])
      .sort((a, b) => a.box - b.box || b.lapses - a.lapses)
      .slice(0, 8)
      .map((c) => words[c.wordId]);
    if (pool.length < 3) {
      toast('Önce birkaç kelime çalış', { description: 'Hikaye için kutularında en az 3 kelime olmalı.', tone: 'info' });
      return;
    }
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const avg = Math.round(pool.reduce((s, w) => s + levels.indexOf(w.cefr), 0) / pool.length);
    setGenerating(true);
    try {
      const st = await aiStory(pool.map((w) => ({ id: w.id, word: w.word, meaning: w.meaning })), levels[Math.max(1, Math.min(4, avg))]);
      dispatch({ type: 'addAiStory', story: { ...st, aiGenerated: true } });
      setStoryIndex(0);
      toast('Yeni hikaye hazır!', { description: `${storyWordIds(st).length} kelimen hikayede geçiyor.`, icon: 'auto_stories' });
    } catch (e) {
      toast('Hikaye oluşturulamadı', { description: (e as Error).message, tone: 'error' });
    } finally {
      setGenerating(false);
    }
  };
  const parsed = useMemo(() => story.paragraphs.map((p) => parseParagraph(p.en)), [story]);
  const ids = useMemo(() => storyWordIds(story), [story]);
  const [open, setOpen] = useState<{ p: number; id: string } | null>(null);
  const [inspected, setInspected] = useState<string[]>([]);
  const [playing, setPlaying] = useState<{ p: number; char: number } | null>(null);
  const [rate, setRate] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const token = useRef(0);
  const bookmarked = state.bookmarks.includes(`story:${story.id}`);

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    setOpen(null);
    setInspected([]);
    setAnswers({});
    setCompleted(false);
    stopSpeaking();
    setPlaying(null);
  }, [story]);

  const playFrom = (p: number) => {
    if (p >= parsed.length) {
      setPlaying(null);
      return;
    }
    const t = token.current;
    setPlaying({ p, char: 0 });
    speak(parsed[p].plain, {
      rate: state.profile.ttsRate * rate,
      onBoundary: (char) => token.current === t && setPlaying({ p, char }),
      onEnd: () => token.current === t && playFrom(p + 1),
    });
  };

  const togglePlay = () => {
    token.current++;
    if (playing) {
      stopSpeaking();
      setPlaying(null);
    } else playFrom(0);
  };

  const boxCounts = ids.reduce(
    (acc, id) => {
      const b = state.cards[id]?.box;
      if (b === 1) acc.k1++;
      else if (b === 2) acc.k2++;
      return acc;
    },
    { k1: 0, k2: 0 },
  );
  const allCorrect = story.questions.every((q, i) => answers[i] === q.answer);

  const complete = () => {
    if (completed) return;
    let promoted = 0;
    if (allCorrect) {
      for (const id of ids) {
        const card = state.cards[id];
        if (card && isDue(card)) {
          dispatch({ type: 'review', wordId: id, outcome: 'know' });
          promoted++;
        }
      }
    }
    dispatch({ type: 'completeStory', storyId: story.id });
    dispatch({ type: 'addXp', amount: 20 + inspected.length * 2 });
    setCompleted(true);
    toast(promoted ? `Harika! ${promoted} kelime bir üst kutuya taşındı` : 'Hikaye tamamlandı!', {
      description: allCorrect ? `+${20 + inspected.length * 2} XP` : 'Anlama sorularını doğru cevaplarsan vadesi gelen kelimeler terfi eder.',
    });
  };

  return (
    <SubScreen title="Mikro Hikaye Okuyucu" bottomPadding="pb-40">
      <div className="flex items-center justify-between">
        <div className="flex flex-col min-w-0 pr-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm">{story.level} Seviye</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {ids.length} Hedef Kelime
            </span>
          </div>
          <div className="flex gap-1 mt-2 overflow-x-auto no-scrollbar max-w-[70vw]">
            {stories.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStoryIndex(i)}
                className={cx('px-2 py-0.5 rounded-full font-label-sm text-label-sm shrink-0', i === storyIndex ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant')}
              >
                {s.aiGenerated ? '✨' : i + 1 - state.aiStories.length}
                {state.completedStories.includes(s.id) && ' ✓'}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label={bookmarked ? 'Yer iminden çıkar' : 'Yer imlerine ekle'}
          onClick={() => dispatch({ type: 'toggleBookmark', id: `story:${story.id}` })}
          className={cx('w-10 h-10 rounded-full bg-surface-container flex items-center justify-center transition-colors active:scale-95 shadow-sm', bookmarked ? 'text-tertiary' : 'text-on-surface-variant')}
        >
          <Icon name={bookmarked ? 'bookmark' : 'bookmark_border'} size={20} fill={bookmarked} />
        </button>
      </div>

      {aiAvailable() && (
        <button
          type="button"
          disabled={generating}
          onClick={generate}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-tertiary-container/40 to-primary-container/30 text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <Icon name={generating ? 'progress_activity' : 'auto_awesome'} size={20} className={cx('text-tertiary', generating && 'animate-spin')} />
          {generating ? 'Hikaye yazılıyor…' : 'Kendi Kelimelerimle Yeni Hikaye Yaz'}
        </button>
      )}
      {story.aiGenerated && (
        <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant -mt-2">
          <span className="flex items-center gap-1"><Icon name="auto_awesome" size={14} className="text-tertiary" /> Yapay zekâ ile senin kelimelerinden yazıldı</span>
          <button type="button" className="text-error" onClick={() => { dispatch({ type: 'deleteAiStory', id: story.id }); setStoryIndex(0); }}>Sil</button>
        </div>
      )}

      <section className="sticky top-16 z-30">
        <div className="bg-surface-container-high/90 backdrop-blur-md rounded-xl p-space-sm shadow-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-space-sm min-w-0">
            <button
              type="button"
              aria-label={playing ? 'Duraklat' : 'Sesli oku'}
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm active:scale-95 transition-transform flex-shrink-0"
            >
              <Icon name={playing ? 'pause' : 'play_arrow'} size={22} fill />
            </button>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface">{playing ? `Paragraf ${playing.p + 1} / ${parsed.length}` : 'Sesli Okuma'}</span>
              <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
                <span className={cx('w-1.5 h-1.5 rounded-full bg-secondary', playing && 'animate-pulse')} />
                Karaoke Vurgu {playing ? 'Aktif' : 'Hazır'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRate((r) => (r === 1 ? 0.8 : 1))}
            className="px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-md text-label-md hover:text-on-surface transition-all active:scale-95"
          >
            {rate.toFixed(1)}x
          </button>
        </div>
      </section>

      <section className="bg-surface-container rounded-xl p-space-sm flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Leitner Durumu:</span>
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">Kutu 1 ({boxCounts.k1})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">Kutu 2 ({boxCounts.k2})</span>
          </div>
        </div>
      </section>

      <article className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col">
        <div className="mb-space-md flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <Icon name="schedule" size={14} />
            <span>{story.minutes} Dk Okuma</span>
            <span>•</span>
            <span>{parsed.reduce((n, p) => n + p.plain.split(/\s+/).length, 0)} Kelime</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">{story.title}</h2>
        </div>
        <div className="font-body-lg text-body-lg text-on-surface leading-loose space-y-4">
          {parsed.map((p, pi) => (
            <div key={pi}>
              <p className={cx('rounded-xl transition-colors', playing?.p === pi && 'bg-primary/10 -mx-2 px-2')}>
                {p.segments.map((seg, si) => {
                  const active = playing?.p === pi && playing.char >= seg.start && playing.char < seg.start + seg.text.length;
                  if (!seg.wordId) {
                    if (playing?.p !== pi) return <span key={si}>{seg.text}</span>;
                    // Karaoke: okunan kelimeyi vurgula
                    const rel = playing.char - seg.start;
                    if (rel < 0 || rel >= seg.text.length) return <span key={si}>{seg.text}</span>;
                    const end = seg.text.slice(rel).search(/\s|$/);
                    return (
                      <span key={si}>
                        {seg.text.slice(0, rel)}
                        <span className="bg-primary/30 rounded">{seg.text.slice(rel, rel + end)}</span>
                        {seg.text.slice(rel + end)}
                      </span>
                    );
                  }
                  const card = state.cards[seg.wordId];
                  const box = card?.box;
                  const isOpen = open?.p === pi && open.id === seg.wordId;
                  return (
                    <button
                      key={si}
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => {
                        setOpen(isOpen ? null : { p: pi, id: seg.wordId! });
                        setInspected((list) => (list.includes(seg.wordId!) ? list : [...list, seg.wordId!]));
                      }}
                      className={cx(
                        'inline-flex items-baseline px-2 py-0.5 mx-0.5 rounded-lg font-medium align-middle active:scale-95 transition-all shadow-sm',
                        isOpen ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high',
                        !isOpen && (box ? BOX_COLORS[box].text : 'text-primary'),
                        active && 'ring-2 ring-primary',
                      )}
                    >
                      <span className="underline decoration-current/40 underline-offset-4">{seg.text}</span>
                      <span className={cx('ml-1 text-[9px] px-1 rounded', box ? cx(BOX_COLORS[box].soft) : 'bg-primary/20')}>{box ? `K${box}` : 'Yeni'}</span>
                    </button>
                  );
                })}
              </p>
              {open?.p === pi && words[open.id] && (
                <div className="mt-2 w-full rounded-xl bg-surface-container-highest p-space-md shadow-xl text-left flex flex-col gap-2 animate-fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span className="font-headline-sm text-headline-sm text-primary truncate">{words[open.id].word}</span>
                      <span className="font-label-md text-label-md text-on-surface-variant font-mono truncate">{words[open.id].ipa}</span>
                    </div>
                    {state.cards[open.id] ? (
                      <span className={cx('px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold shrink-0', BOX_COLORS[state.cards[open.id].box].soft, BOX_COLORS[state.cards[open.id].box].text)}>
                        Kutu {state.cards[open.id].box}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'introduce', wordId: open.id })}
                        className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-label-sm text-label-sm font-bold shrink-0"
                      >
                        + Kutu 1
                      </button>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface font-semibold">{words[open.id].meaning}</p>
                  <div className="bg-surface-container p-space-sm rounded-lg flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Paragraf Çevirisi</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant italic">“{story.paragraphs[pi].tr}”</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <SpeakButton text={words[open.id].word} label="Dinle" size={16} className="flex items-center gap-1 text-primary font-label-md text-label-md hover:underline" />
                    <button type="button" onClick={() => setOpen(null)} className="font-label-sm text-label-sm text-on-surface-variant">
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-space-md pt-space-sm flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
          <span className="flex items-center gap-1">
            <Icon name="touch_app" size={16} className="text-tertiary" />
            Detay ve telaffuz için kelimelere dokunun
          </span>
          <span className="text-primary font-semibold">
            {inspected.length}/{ids.length} İncelendi
          </span>
        </div>
      </article>

      {story.questions.map((q, qi) => (
        <section key={qi} className="bg-surface-container rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md font-bold">?</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Mini Anlama Kontrolü</h3>
            </div>
            <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-semibold">
              Soru {qi + 1} / {story.questions.length}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface">{q.q}</p>
          <div className="flex flex-col gap-2.5">
            {q.options.map((opt, oi) => {
              const chosen = answers[qi];
              const answered = chosen !== undefined;
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={answered && chosen === q.answer}
                  onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  className={cx(
                    'w-full text-left p-space-md rounded-xl flex items-center gap-3 transition-colors',
                    answered && oi === chosen && oi === q.answer && 'bg-secondary-container text-on-secondary-container',
                    answered && oi === chosen && oi !== q.answer && 'bg-error-container text-on-error-container',
                    (!answered || oi !== chosen) && 'bg-surface-container-high text-on-surface hover:bg-surface-variant',
                    answered && chosen === q.answer && oi !== chosen && 'opacity-50',
                  )}
                >
                  <span className="w-6 h-6 rounded-full bg-surface-variant/60 flex items-center justify-center font-label-sm text-label-sm font-bold flex-shrink-0">{'ABC'[oi]}</span>
                  <span className="font-body-sm text-body-sm">{opt}</span>
                </button>
              );
            })}
          </div>
          {answers[qi] === q.answer && (
            <div className="flex p-space-sm rounded-lg bg-secondary-container text-on-secondary-container font-label-md text-label-md items-center gap-2">
              <Icon name="check_circle" size={18} />
              <span>{q.explanation}</span>
            </div>
          )}
        </section>
      ))}

      <aside className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl px-gutter pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Icon name="bolt" size={18} className="text-secondary" />
              <span className="font-label-md text-label-md text-secondary font-bold">+{20 + inspected.length * 2} XP</span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">• {inspected.length} kelime incelendi</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{allCorrect ? 'Otomatik Terfi Hazır' : 'Soruları cevapla'}</span>
          </div>
          <button
            type="button"
            onClick={completed ? () => setStoryIndex((i) => (i + 1) % stories.length) : complete}
            className={cx(
              'w-full h-14 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all',
              completed ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary text-on-primary',
            )}
          >
            <span>{completed ? 'Sonraki Hikayeye Geç' : 'Hikayeyi Tamamladım'}</span>
            <Icon name={completed ? 'arrow_forward' : 'check'} size={20} />
          </button>
        </div>
      </aside>
    </SubScreen>
  );
}
