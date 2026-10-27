import { useRef, useState } from 'react';
import { getDeck } from '../data/decks';
import { POS_LABELS } from '../data/words';
import { BOX_COLORS, dueLabel } from '../lib/leitner';
import type { CardState, Word } from '../lib/types';
import { cx, Highlight, Icon, SpeakButton } from './ui';

export type SwipeDirection = 'left' | 'right' | 'up';

/** Ön/arka yüzlü, dokununca dönen ve kaydırılabilen kelime kartı. */
export function Flashcard({
  word,
  card,
  flipped,
  onFlip,
  onSwipe,
  exiting,
  reverse = false,
}: {
  word: Word;
  card?: CardState;
  flipped: boolean;
  onFlip: () => void;
  onSwipe?: (dir: SwipeDirection) => void;
  exiting?: SwipeDirection | null;
  /** Türkçe → İngilizce: ön yüzde anlam sorulur, arka yüzde kelime gösterilir */
  reverse?: boolean;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const [dx, setDx] = useState(0);
  const pos = POS_LABELS[word.pos];
  const deck = getDeck(word.deckId);
  const example = word.examples[0];

  const exitStyle =
    exiting === 'right'
      ? 'translateX(70px) rotate(4deg)'
      : exiting === 'left'
        ? 'translateX(-70px) rotate(-4deg)'
        : exiting === 'up'
          ? 'translateY(-50px) scale(0.95)'
          : dx
            ? `translateX(${dx}px) rotate(${dx / 25}deg)`
            : 'none';

  return (
    <div className="relative w-full my-2">
      <div className="absolute inset-x-3 -bottom-2 h-12 bg-surface-container-highest/60 rounded-xl -z-10 translate-y-1" />
      <div className="absolute inset-x-6 -bottom-4 h-12 bg-surface-container-low/40 rounded-xl -z-20 translate-y-2" />
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Kartın ön yüzüne dön' : 'Kartı çevir'}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onFlip();
        }}
        onTouchStart={(e) => {
          start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchMove={(e) => {
          if (!start.current) return;
          const ddx = e.touches[0].clientX - start.current.x;
          const ddy = e.touches[0].clientY - start.current.y;
          if (Math.abs(ddx) > Math.abs(ddy)) setDx(ddx);
        }}
        onTouchEnd={() => {
          const threshold = 70;
          if (dx > threshold) onSwipe?.('right');
          else if (dx < -threshold) onSwipe?.('left');
          setDx(0);
          start.current = null;
        }}
        style={{ transform: exitStyle, opacity: exiting ? 0 : 1 }}
        className={cx(
          'relative w-full min-h-[380px] rounded-xl bg-surface-container p-space-md flex flex-col justify-between cursor-pointer shadow-xl overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary',
          dx === 0 && 'transition-all duration-300',
          dx > 40 && 'ring-2 ring-secondary/40',
          dx < -40 && 'ring-2 ring-error/40',
        )}
      >
        <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between w-full relative z-10 gap-2">
          {card ? (
            <div className={cx('flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md', BOX_COLORS[card.box].soft, BOX_COLORS[card.box].text)}>
              <Icon name="schedule" size={15} />
              <span>Kutu {card.box} • {dueLabel(card)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-label-md text-label-md">
              <Icon name="fiber_new" size={15} />
              <span>Yeni Kelime</span>
            </div>
          )}
          {/* Ters kartta telaffuz ön yüzde cevabı ele verir; yalnızca arka yüzde gösterilir */}
          {(!reverse || flipped) && (
            <SpeakButton
              text={word.word}
              label="Dinle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-primary hover:bg-surface-bright"
            />
          )}
        </div>

        <div className="flex flex-col items-center justify-center text-center my-auto py-space-sm relative z-10 w-full">
          {!flipped && reverse ? (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-sm text-label-sm tracking-wide">
                {pos.tr.toLocaleUpperCase('tr')} • {word.cefr} • İNGİLİZCESİ NE?
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold mt-1 break-words max-w-full">{word.meaning}</h2>
              {example?.tr && <p className="font-body-sm text-body-sm text-on-surface-variant italic max-w-xs">“{example.tr}”</p>}
              <div className="mt-4 flex items-center gap-1 text-outline font-label-sm text-label-sm">
                <Icon name="touch_app" size={16} />
                <span>İngilizcesini düşün, sonra kartı çevir</span>
              </div>
            </div>
          ) : !flipped ? (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-fixed-dim font-label-sm text-label-sm tracking-wide">
                {pos.tr.toLocaleUpperCase('tr')} / {pos.en.toUpperCase()} • {word.cefr}
              </div>
              <h2 lang="en" className="font-headline-lg text-display-lg text-on-surface tracking-tight font-bold mt-1 uppercase break-words max-w-full">
                {word.word}
              </h2>
              {word.ipa && <span className="font-body-md text-body-md text-on-surface-variant font-mono">{word.ipa}</span>}
              <div className="mt-4 flex items-center gap-1 text-outline font-label-sm text-label-sm">
                <Icon name="touch_app" size={16} />
                <span>Kartı çevirmek için dokunun</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full text-left animate-fade-in">
              <div className="w-full text-center pb-1">
                {reverse ? (
                  <>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold block mb-1">İngilizcesi</span>
                    <h3 lang="en" className="font-headline-lg text-headline-lg text-secondary font-bold uppercase break-words">{word.word}</h3>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                      {word.ipa && <span className="font-mono">{word.ipa} • </span>}
                      {word.meaning}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold block mb-1">Türkçe Karşılık</span>
                    <h3 className="font-headline-md text-headline-md text-secondary font-bold">{word.meaning || '—'}</h3>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                      {word.word} {word.ipa && <span className="font-mono">{word.ipa}</span>}
                    </p>
                  </>
                )}
              </div>
              {example && (
                <div className="w-full p-3 rounded-lg bg-surface-container-high/80 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                    <Icon name="format_quote" size={14} className="text-primary" />
                    <span>Bağlam / Örnek Cümle</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface font-medium leading-snug">
                    “<Highlight text={example.en} term={word.word} />”
                  </p>
                  {example.tr && <p className="font-body-sm text-body-sm text-on-surface-variant italic">{example.tr}</p>}
                </div>
              )}
              {(word.synonyms?.length || word.collocations?.length) && (
                <div className="grid grid-cols-2 gap-2 w-full pt-1">
                  <div className="p-2.5 rounded-lg bg-surface-container-low min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-0.5">Eş Anlamlılar</span>
                    <p className="font-label-md text-label-md text-on-surface truncate">{word.synonyms?.join(', ') || '—'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-0.5">Kolokasyon</span>
                    <p className="font-label-md text-label-md text-on-surface truncate">{word.collocations?.[0] ?? '—'}</p>
                  </div>
                </div>
              )}
              {word.mnemonic && (
                <div className="w-full p-3 rounded-lg bg-tertiary-container/15 flex items-start gap-2.5">
                  <Icon name="lightbulb" size={18} fill className="text-tertiary mt-0.5" />
                  <p className="font-body-sm text-body-sm text-on-surface leading-snug">{word.mnemonic}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between w-full pt-2 text-outline-variant font-label-sm text-label-sm relative z-10">
          <div className="flex items-center gap-1 text-outline">
            <Icon name="history_edu" size={14} />
            <span>{deck?.title ?? 'Kişisel'}</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <span>{flipped ? 'Ön Yüze Dön' : 'Arka Yüzü Gör'}</span>
            <Icon name="cached" size={16} className={cx('transition-transform duration-300', flipped && 'rotate-180')} />
          </div>
        </div>
      </div>
    </div>
  );
}
