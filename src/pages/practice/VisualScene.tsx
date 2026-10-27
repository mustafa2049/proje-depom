import { useEffect, useMemo, useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { cx, Icon, shuffle, SpeakButton } from '../../components/ui';
import { PERSONAL_DECK_ID } from '../../data/decks';
import { VISUAL_SCENES, type Hotspot } from '../../data/modules';
import { slugify } from '../../data/words';
import { vibrate } from '../../lib/speech';
import type { Word } from '../../lib/types';
import { useStore } from '../../store/AppStore';
import { useAddToBox } from '../../store/useAddToBox';

const QUIZ_SECONDS = 60;

function toWord(h: Hotspot): Word {
  const word = h.name.toLowerCase();
  return {
    id: slugify(word),
    word,
    ipa: h.ipa,
    pos: 'noun',
    cefr: 'B1',
    meaning: h.meaning,
    examples: [{ en: h.example, tr: h.exampleTr.replace(/^\(|\)$/g, '') }],
    collocations: h.collocations.map((c) => c.en),
    deckId: PERSONAL_DECK_ID,
  };
}

export default function VisualScene() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const addToBox = useAddToBox();
  const scene = VISUAL_SCENES[0];
  const [selected, setSelected] = useState(scene.hotspots[1].id);
  const [quiz, setQuiz] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [found, setFound] = useState(0);
  const [left, setLeft] = useState(QUIZ_SECONDS);
  const [wrongPin, setWrongPin] = useState<string | null>(null);
  const current = scene.hotspots.find((h) => h.id === selected)!;
  const quizTarget = quiz ? scene.hotspots.find((h) => h.id === order[qIndex]) : undefined;
  const cardWord = useMemo(() => toWord(current), [current]);
  const card = state.cards[cardWord.id];

  useEffect(() => {
    if (!quiz) return;
    if (left <= 0 || qIndex >= order.length) {
      setQuiz(false);
      const xp = found * 5;
      if (xp) dispatch({ type: 'addXp', amount: xp });
      toast(left <= 0 ? 'Süre doldu!' : 'Görsel bulmaca tamamlandı!', {
        description: `${found} / ${order.length} nesne bulundu${xp ? ` • +${xp} XP` : ''}`,
        icon: 'sports_esports',
        tone: found === order.length ? 'success' : 'info',
      });
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [quiz, left, qIndex, order.length, found, dispatch, toast]);

  const startQuiz = () => {
    setOrder(shuffle(scene.hotspots.map((h) => h.id)));
    setQIndex(0);
    setFound(0);
    setLeft(QUIZ_SECONDS);
    setQuiz(true);
    toast('Kör Test Başladı', { description: 'Sorulan nesneyi görsel üzerinde bulup dokun!', icon: 'gps_fixed', tone: 'info' });
  };

  const tapPin = (h: Hotspot) => {
    if (!quiz) {
      setSelected(h.id);
      return;
    }
    if (h.id === quizTarget?.id) {
      vibrate(30);
      setFound((f) => f + 1);
      setSelected(h.id);
      setQIndex((i) => i + 1);
    } else {
      vibrate(90);
      setWrongPin(h.id);
      setTimeout(() => setWrongPin(null), 500);
    }
  };

  return (
    <SubScreen title="Görsel Sahne Sözlüğü">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span lang="en" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-wider">
            <Icon name="map" size={14} /> Hotspot Dictionary
          </span>
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> {scene.hotspots.length} Nesne Hazır
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{scene.title}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">{scene.subtitle}</p>
      </div>

      <div className="flex p-1 rounded-xl bg-surface-container-low gap-1">
        <button
          type="button"
          onClick={() => setQuiz(false)}
          className={cx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-label-md text-label-md transition-all', !quiz ? 'bg-surface-container-high text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface')}
        >
          <Icon name="visibility" size={18} /> Etiketler Açık
        </button>
        <button
          type="button"
          onClick={startQuiz}
          className={cx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-label-md text-label-md transition-all', quiz ? 'bg-surface-container-high text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface')}
        >
          <Icon name="gps_fixed" size={18} /> Kör Test: Görselde Bul
        </button>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden shadow-xl bg-surface-container-lowest" style={{ aspectRatio: scene.aspect }}>
        <img src={scene.image} alt="Havalimanı terminali illüstrasyonu" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/70 via-transparent to-surface-container-lowest/30 pointer-events-none" />
        {quiz && quizTarget && (
          <div className="absolute top-2 inset-x-2 bg-surface-container-high/95 backdrop-blur-md rounded-lg p-2.5 shadow-md flex items-center justify-between z-30 animate-fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                <Icon name="travel_explore" size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-label-sm text-label-sm text-on-surface-variant">HEDEF NESNEYİ DOKUNARAK BUL</div>
                <div className="font-label-lg text-label-lg text-on-surface truncate">“{quizTarget.name.toLowerCase()}”</div>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className={cx('font-label-md text-label-md font-bold', left <= 10 ? 'text-error' : 'text-tertiary')}>{left}s</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {qIndex + 1}/{order.length}
              </span>
            </div>
          </div>
        )}
        {scene.hotspots.map((h, i) => {
          const active = !quiz && h.id === selected;
          return (
            <button
              key={h.id}
              type="button"
              aria-label={`Nokta ${i + 1}: ${quiz ? 'gizli nesne' : h.name}`}
              onClick={() => tapPin(h)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <span className="relative flex items-center justify-center w-9 h-9">
                <span className={cx('absolute inline-flex h-full w-full rounded-full opacity-75', active ? 'animate-ping bg-secondary/40' : wrongPin === h.id ? 'bg-error/60' : 'bg-primary/30')} />
                <span
                  className={cx(
                    'relative inline-flex items-center justify-center rounded-full font-label-md text-label-md font-bold shadow-lg border-2',
                    active ? 'w-9 h-9 bg-secondary text-on-secondary border-secondary-fixed' : 'w-7 h-7 bg-surface-container-highest/90 text-primary border-primary/50',
                  )}
                >
                  {quiz ? '?' : i + 1}
                </span>
              </span>
              {!quiz && (
                <span
                  className={cx(
                    'absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-label-sm text-label-sm px-2 py-0.5 rounded-full shadow pointer-events-none flex items-center gap-1',
                    active ? '-top-6 bg-secondary text-on-secondary font-bold' : 'top-9 bg-surface-container-highest/90 backdrop-blur-sm text-on-surface',
                  )}
                >
                  {active && <Icon name="check_circle" size={12} />}
                  {h.short}
                </span>
              )}
            </button>
          );
        })}
        <div className="absolute bottom-2 left-2 bg-surface-container-high/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow pointer-events-none">
          <Icon name="near_me" size={14} className="text-tertiary" />
          <span className="font-label-sm text-label-sm text-on-surface">{scene.region}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Sahnedeki Sıcak Noktalar</span>
          <span className="font-label-sm text-label-sm text-secondary">Seçim: #{scene.hotspots.indexOf(current) + 1}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {scene.hotspots.map((h, i) => {
            const active = h.id === selected;
            return (
              <button
                key={h.id}
                type="button"
                disabled={quiz}
                onClick={() => setSelected(h.id)}
                className={cx('flex items-center gap-2 p-2.5 rounded-xl text-left transition-colors disabled:opacity-50', active ? 'bg-secondary-container/20' : 'bg-surface-container hover:bg-surface-container-high')}
              >
                <span className={cx('w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm flex-shrink-0', active ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-container-highest text-primary')}>
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className={cx('font-label-md text-label-md truncate capitalize', active ? 'text-secondary font-semibold' : 'text-on-surface')}>{h.name.toLowerCase()}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{h.meaning}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <section className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary font-label-sm text-label-sm">
                Hotspot #{scene.hotspots.indexOf(current) + 1} • {current.badge}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">• İsim (Noun)</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1 break-words">{current.name}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant font-mono">{current.ipa}</p>
          </div>
          <SpeakButton text={current.name.toLowerCase()} size={24} className="w-12 h-12 shrink-0 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center" />
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-high">
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <Icon name="translate" size={20} />
          </div>
          <div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">Türkçe Karşılık</div>
            <div className="font-headline-sm text-headline-sm text-on-surface">{current.meaning}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-tertiary">
            <Icon name="hub" size={16} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Bağlantılı Eylemler & Kritik Kalıplar</span>
          </div>
          {current.collocations.map((c) => (
            <div key={c.en} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-high">
              <Icon name="check_small" size={18} className="text-secondary" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                <span className="text-on-surface font-semibold">{c.en}</span> — {c.tr}
              </p>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg bg-surface-container-high flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-primary">
            <Icon name="format_quote" size={16} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Örnek Kullanım</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface italic">“{current.example}”</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{current.exampleTr}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!!card}
            onClick={() => addToBox(cardWord)}
            className={cx(
              'w-full h-11 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
              card ? 'bg-secondary text-on-secondary' : 'bg-primary-container/30 text-primary hover:bg-primary-container/50',
            )}
          >
            <Icon name={card ? 'task_alt' : 'library_add'} size={20} />
            <span>{card ? `Kutu ${card.box}’te Kayıtlı` : '+ Bu Kelimeyi & Kalıbı Kutu 1’e Ekle'}</span>
          </button>
          <SpeakButton
            text={current.example}
            label="Örnek Cümleyi Dinle"
            className="w-full h-12 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-2 font-label-lg text-label-lg"
          />
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={startQuiz}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-secondary-container via-secondary to-primary text-on-secondary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          <Icon name="sports_esports" size={22} />
          <span>Görsel Bulmaca Testini Başlat</span>
        </button>
        <p className="text-center font-label-sm text-label-sm text-on-surface-variant flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Hafıza pekiştirme için {QUIZ_SECONDS} saniyelik görsel nesne bulma modu
        </p>
      </div>
    </SubScreen>
  );
}
