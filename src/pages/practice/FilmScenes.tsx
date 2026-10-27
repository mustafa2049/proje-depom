import { useEffect, useMemo, useRef, useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { cx, Icon, SpeakButton } from '../../components/ui';
import { POS_LABELS } from '../../data/words';
import { SCENES, type GlossaryEntry } from '../../data/modules';
import { lookupOnline } from '../../lib/dictionary';
import { BOX_COLORS } from '../../lib/leitner';
import { speak, stopSpeaking } from '../../lib/speech';
import { findWordId, tokenize } from '../../lib/text';
import type { Word } from '../../lib/types';
import { useStore } from '../../store/AppStore';
import { glossaryToWord, useAddToBox } from '../../store/useAddToBox';
import { PERSONAL_DECK_ID } from '../../data/decks';

const SPEEDS = [0.75, 1.0, 1.25];

export default function FilmScenes() {
  const { state, words } = useStore();
  const addToBox = useAddToBox();
  const [index, setIndex] = useState(0);
  const scene = SCENES[index];
  const [speed, setSpeed] = useState(1.0);
  const [loop, setLoop] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<string>(scene.target);
  const [online, setOnline] = useState<Word | null>(null);
  const [looking, setLooking] = useState(false);
  const playToken = useRef(0);
  const tokens = useMemo(() => tokenize(scene.en), [scene]);

  useEffect(() => {
    setSelected(scene.target);
    setOnline(null);
    setProgress(0);
    stopSpeaking();
    setPlaying(false);
  }, [scene]);

  useEffect(() => () => stopSpeaking(), []);

  const play = () => {
    if (playing) {
      playToken.current++;
      stopSpeaking();
      setPlaying(false);
      return;
    }
    const token = ++playToken.current;
    setPlaying(true);
    const run = () =>
      speak(scene.en, {
        rate: 0.9 * speed,
        onBoundary: (i) => setProgress(Math.round((i / scene.en.length) * 100)),
        onEnd: () => {
          if (playToken.current !== token) return;
          setProgress(100);
          if (loop) setTimeout(() => playToken.current === token && run(), 900);
          else setPlaying(false);
        },
      });
    run();
  };

  /** Dokunulan kelimenin sözlük kaydı: önce sahneye özel bağlantı, sonra çekirdek sözlük, sonra sahne sözlüğü. */
  const resolve = (token: string): { word?: Word; gloss?: GlossaryEntry } => {
    const lower = token.toLowerCase();
    const linked = scene.links?.[lower];
    if (linked && words[linked]) return { word: words[linked] };
    const id = findWordId(lower, words);
    if (id) return { word: words[id] };
    const g = scene.glossary?.[lower];
    if (g) return { gloss: g };
    return {};
  };

  const selection = (() => {
    const direct = words[selected];
    if (direct) return { word: direct };
    return resolve(selected);
  })();
  const info: Word | null = selection.word ?? (selection.gloss ? glossaryToWord(selection.gloss) : online);
  const card = info ? state.cards[info.id] : undefined;

  const pick = async (token: string) => {
    setSelected(token.toLowerCase());
    setOnline(null);
    const r = resolve(token);
    if (!r.word && !r.gloss) {
      setLooking(true);
      const res = await lookupOnline(token.toLowerCase(), PERSONAL_DECK_ID);
      setLooking(false);
      setOnline(res?.word.meaning ? res.word : null);
    }
  };

  return (
    <SubScreen title="Dizi & Film Replikleri">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm tracking-wide">{scene.show}</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">{scene.level}</span>
        </div>
        <span className="text-on-surface-variant font-label-md text-label-md">
          Sahne <span className="text-on-surface">{index + 1}</span> / {SCENES.length}
        </span>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden bg-surface-container shadow-xl">
        <div className="relative aspect-video w-full">
          <img className="w-full h-full object-cover" src={scene.image} alt="Kafe sahnesi" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
          <button
            type="button"
            aria-label={playing ? 'Durdur' : 'Repliği oynat'}
            onClick={play}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-surface-container-high/80 backdrop-blur-md flex items-center justify-center text-on-surface shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Icon name={playing ? 'pause' : 'play_arrow'} size={32} className="text-primary" />
          </button>
          <div className="absolute bottom-2 inset-x-3 flex items-center gap-2">
            <div className="relative flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-on-surface-variant font-label-sm text-label-sm tabular-nums">{speed.toFixed(2)}x</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-surface-container-low">
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={cx('px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-colors', s === speed ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant hover:text-on-surface')}
              >
                {s === 0.75 && <Icon name="cruelty_free" size={14} />}
                {s.toFixed(s === 1 ? 1 : 2)}x
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLoop((l) => !l)}
            className={cx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant active:scale-95 transition-all', loop ? 'text-secondary' : 'text-on-surface-variant')}
          >
            <Icon name={loop ? 'repeat' : 'repeat_one'} size={18} />
            <span className="font-label-sm text-label-sm font-semibold">{loop ? 'Döngü Aktif' : 'Tek Sefer'}</span>
          </button>
        </div>
      </div>

      <section className="w-full bg-surface-container-low rounded-xl p-4 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Icon name="subtitles" size={16} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Etkileşimli Replik</span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm">👆 Kelimelere Dokun</span>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center leading-relaxed">
          {tokens
            .filter((t) => t.isWord)
            .map((t, i) => {
              const lower = t.text.toLowerCase();
              const isTarget = (scene.links?.[lower] ?? findWordId(lower, words)) === scene.target;
              const isSel = selected === lower || (isTarget && selected === scene.target);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(t.text)}
                  className={cx(
                    'relative px-1.5 py-1 rounded font-body-md text-body-md transition-all active:scale-95',
                    isTarget
                      ? 'px-2.5 rounded-lg bg-primary-container text-on-primary-container font-bold shadow-md'
                      : isSel
                        ? 'bg-surface-bright text-on-surface'
                        : 'bg-surface-container-high/60 text-on-surface hover:bg-surface-container-high',
                  )}
                >
                  {t.text}
                  {isTarget && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                    </span>
                  )}
                </button>
              );
            })}
        </div>
        <p className="text-on-surface-variant font-body-sm text-body-sm leading-snug pt-1">“{scene.tr}”</p>
      </section>

      <section className="w-full bg-surface-container rounded-xl p-4 shadow-lg flex flex-col gap-3.5">
        <div className="w-8 h-1 rounded-full bg-surface-variant mx-auto" />
        {looking ? (
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
            <Icon name="progress_activity" size={18} className="animate-spin" /> “{selected}” sözlükte aranıyor…
          </p>
        ) : info ? (
          <>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-on-surface font-headline-md text-headline-md tracking-tight">{info.word}</h2>
                  <SpeakButton text={info.word} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-bright" />
                </div>
                <span className="text-on-surface-variant font-label-md text-label-md">{info.ipa}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed-dim/20 text-primary-fixed font-label-sm text-label-sm font-semibold">
                  {POS_LABELS[info.pos].tr} • {info.cefr}
                </span>
                {info.id === scene.target && <span className="text-secondary font-label-sm text-label-sm">Hedef Kelime</span>}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded-lg flex flex-col gap-1.5">
              <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Bağlamsal Anlam</span>
              <p className="text-on-surface font-body-md text-body-md font-medium leading-relaxed">{info.meaning}</p>
            </div>
            {scene.hint && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-high/50">
                <Icon name="lightbulb" size={18} className="text-tertiary" />
                <div className="flex flex-col">
                  <span className="text-on-surface font-label-sm text-label-sm font-semibold">Bağlantılı İfade:</span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">
                    <strong className="text-on-surface">{scene.hint.phrase}</strong> = {scene.hint.meaning}
                  </span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => addToBox(info)}
              disabled={!!card}
              className={cx(
                'w-full h-14 rounded-xl font-label-lg text-label-lg font-semibold flex items-center justify-between px-4 shadow-lg active:scale-[0.98] transition-all',
                card ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary hover:opacity-95',
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon name={card ? 'task_alt' : 'all_inbox'} size={22} />
                <span>{card ? `✓ Kutu ${card.box}’te Kayıtlı` : 'Kutu 1’e Ekle (Bugün Tekrar)'}</span>
              </div>
              <span className={cx('px-2 py-0.5 rounded font-label-sm text-label-sm font-bold', card ? cx(BOX_COLORS[card.box].text, 'bg-surface/20') : 'bg-on-primary/10')}>
                Kutu {card?.box ?? 1}
              </span>
            </button>
          </>
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            “{selected}” için sözlük kaydı bulunamadı{navigator.onLine ? '' : ' (çevrimdışısın)'}. Kütüphane → Kendi Kelimeni Ekle ile elle ekleyebilirsin.
          </p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="h-12 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 active:bg-surface-variant transition-colors disabled:opacity-40"
        >
          <Icon name="skip_previous" size={20} />
          <span>Önceki Sahne</span>
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % SCENES.length)}
          className="h-12 rounded-xl bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold flex items-center justify-center gap-2 active:opacity-90 transition-opacity"
        >
          <span>Sonraki Replik</span>
          <Icon name="skip_next" size={20} />
        </button>
      </div>
      <p className="text-center font-label-sm text-label-sm text-on-surface-variant">Replikler cihazının İngilizce sesiyle seslendirilir.</p>
    </SubScreen>
  );
}
