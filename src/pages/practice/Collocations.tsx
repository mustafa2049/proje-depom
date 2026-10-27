import { useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { BoxStrip, cx, Icon, SpeakButton } from '../../components/ui';
import { PERSONAL_DECK_ID } from '../../data/decks';
import { COLLOCATIONS, L1_TRAPS, type Chip } from '../../data/modules';
import { slugify } from '../../data/words';
import { BOX_COLORS, dueLabel } from '../../lib/leitner';
import { vibrate } from '../../lib/speech';
import { useStore } from '../../store/AppStore';
import { streak } from '../../store/selectors';
import { useAddToBox } from '../../store/useAddToBox';

function chipClass(chip: Chip, selected: boolean, kind: 'verb' | 'mod') {
  if (selected) {
    if (chip.kind === 'trap' || chip.kind === 'weak') return 'bg-error-container text-on-error-container shadow-md font-bold';
    return kind === 'verb' ? 'bg-secondary-container text-on-secondary-container shadow-md font-bold' : 'bg-primary-container text-on-primary shadow-md font-bold';
  }
  if (chip.kind === 'trap') return 'bg-surface-container-high text-error hover:bg-error-container/30';
  if (chip.kind === 'weak') return 'bg-surface-container-low text-outline hover:text-on-surface opacity-70';
  return 'bg-surface-container-high text-on-surface hover:bg-surface-bright';
}

export default function Collocations() {
  const { state, dispatch } = useStore();
  const addToBox = useAddToBox();
  const [targetIndex, setTargetIndex] = useState(0);
  const target = COLLOCATIONS[targetIndex];
  const [verb, setVerb] = useState<Chip | null>(null);
  const [mod, setMod] = useState<Chip | null>(null);
  const [note, setNote] = useState<{ text: string; tone: 'error' | 'info' } | null>(null);
  const [rewarded, setRewarded] = useState<string[]>([]);

  const valid = (c: Chip | null) => !!c && c.kind !== 'trap' && c.kind !== 'weak';
  const locked = valid(verb) && valid(mod);
  const chunk = locked ? `${verb!.text} ${mod!.text} ${target.noun}` : '';
  const chunkId = slugify(chunk);
  const card = locked ? state.cards[chunkId] : undefined;
  const nextIndex = (targetIndex + 1) % COLLOCATIONS.length;

  const choose = (c: Chip, kind: 'verb' | 'mod') => {
    if (kind === 'verb') setVerb(c);
    else setMod(c);
    if (c.kind === 'trap' || c.kind === 'weak') {
      vibrate(90);
      setNote({ text: c.note ?? 'Bu kalıp doğal değil.', tone: 'error' });
    } else if (c.note) {
      setNote({ text: c.note, tone: 'info' });
    } else setNote(null);
  };

  const sentence = locked ? target.sentence.split('{chunk}') : null;
  const tr = locked ? target.sentenceTr.replace('{tr}', mod!.tr ?? '') : '';

  const add = () => {
    if (!locked) return;
    const created = addToBox({
      id: chunkId,
      word: chunk,
      ipa: '',
      pos: 'phrase',
      cefr: 'B2',
      meaning: mod!.chunkTr ?? target.meaning,
      examples: [{ en: target.sentence.replace('{chunk}', chunk), tr }],
      collocations: target.verbs.filter((v) => v.kind === 'correct' || v.kind === 'alt').map((v) => `${v.text} … ${target.noun}`),
      deckId: PERSONAL_DECK_ID,
    });
    if (created && !rewarded.includes(chunkId)) {
      dispatch({ type: 'addXp', amount: 15 });
      setRewarded((r) => [...r, chunkId]);
    }
  };

  const goNext = () => {
    setTargetIndex(nextIndex);
    setVerb(null);
    setMod(null);
    setNote(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SubScreen title="Kalıp & Kolokasyon">
      <section className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between gap-space-sm flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm">
            <span>🧩</span>
            <span>KOLOKASYON & CHUNK İNŞA EDİCİ</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-tertiary font-label-sm text-label-sm shadow-sm">
            <span>🔥</span>
            <span className="text-on-surface">{streak(state)} Günlük Seri</span>
          </div>
        </div>
        <div className="mt-space-xs">
          <h2 className="font-headline-md text-headline-md text-on-surface">Doğal Kalıp Eşleştirici</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Türkçeden motamot çeviri tuzaklarını yık, anadili İngilizce olanlar gibi doğal kalıplar (lexical chunks) inşa et.
          </p>
        </div>
      </section>

      <section className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span lang="en" className="font-display-lg text-display-lg text-on-surface tracking-tight uppercase">{target.noun}</span>
              <SpeakButton text={chunk || target.noun} className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-surface-bright" />
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="font-label-md text-label-md text-on-surface-variant">{target.ipa}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-secondary">{target.posLabel}</span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">{target.meaning}</span>
            </div>
          </div>
          <div className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider shrink-0">Hedef Çekirdek</div>
        </div>

        <div className="bg-surface-container-high rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-outline text-label-sm font-label-sm">
            <span>MANYETİK YUVA</span>
            {locked ? (
              <span className="text-secondary font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                Kilitlendi
              </span>
            ) : (
              <span>Fiil + sıfat seç</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className={cx('font-headline-sm text-headline-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm min-w-[60px] justify-center', verb ? (valid(verb) ? 'bg-secondary-container/20 text-secondary' : 'bg-error-container/30 text-error line-through') : 'bg-surface-container-lowest text-outline')}>
              <span>{verb?.text ?? '___'}</span>
              {verb && <Icon name={valid(verb) ? 'check_circle' : 'cancel'} size={16} />}
            </div>
            <span className="text-outline-variant font-bold text-lg">+</span>
            <div className={cx('font-headline-sm text-headline-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm min-w-[60px] justify-center', mod ? (valid(mod) ? 'bg-primary-container/20 text-primary' : 'bg-error-container/30 text-error line-through') : 'bg-surface-container-lowest text-outline')}>
              <span>{mod?.text ?? '___'}</span>
              {mod && <Icon name={valid(mod) ? 'auto_awesome' : 'cancel'} size={16} />}
            </div>
            <span className="text-outline-variant font-bold text-lg">+</span>
            <div lang="en" className="bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm px-3.5 py-1.5 rounded-lg shadow-inner uppercase">{target.noun}</div>
          </div>
          {locked ? (
            <div className="mt-1 bg-secondary-container/15 rounded-lg p-2.5 flex items-start gap-2 text-on-surface">
              <Icon name="verified" size={20} className="text-secondary shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <p className="font-label-md text-label-md text-secondary font-bold">Kusursuz Kolokasyon!</p>
                <p className="font-body-sm text-[13px] text-on-surface-variant leading-snug">{target.l1Note}</p>
              </div>
            </div>
          ) : (
            note && (
              <div className={cx('mt-1 rounded-lg p-2.5 flex items-start gap-2', note.tone === 'error' ? 'bg-error-container/30 text-error' : 'bg-tertiary-container/15 text-on-surface')}>
                <Icon name={note.tone === 'error' ? 'error' : 'info'} size={18} className={note.tone === 'error' ? 'shrink-0' : 'text-tertiary shrink-0'} />
                <p className="font-body-sm text-[13px] leading-snug">
                  {note.tone === 'error' && <strong>DİKKAT TUZAK: </strong>}
                  {note.text}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Parça Havuzu (Chunk Pool)</h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Dokun ve eşle</span>
        </div>
        {(
          [
            ['verb', 'A) Fiil Seçenekleri', target.verbs, verb],
            ['mod', 'B) Sıfat / Belirteçle Güçlendir', target.modifiers, mod],
          ] as const
        ).map(([kind, label, chips, sel]) => (
          <div key={kind} className="flex flex-col gap-1.5">
            <span className="font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">{label}</span>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => {
                const selected = sel?.text === c.text;
                return (
                  <button
                    key={c.text}
                    type="button"
                    onClick={() => choose(c, kind)}
                    className={cx('px-3.5 py-2.5 rounded-xl font-label-lg text-label-lg flex items-center gap-1.5 active:scale-95 transition-all', chipClass(c, selected, kind))}
                  >
                    <span className={cx(c.kind === 'trap' && !selected && 'line-through decoration-error/70')}>{c.text.replace(/^an? /, '')}</span>
                    {c.tag && (
                      <span
                        className={cx(
                          'text-[10px] px-1.5 py-0.5 rounded',
                          c.kind === 'trap' ? 'text-error font-bold bg-error-container/20' : c.kind === 'nuance' ? 'text-tertiary bg-tertiary-container/20' : 'text-secondary bg-secondary-container/20',
                        )}
                      >
                        {c.tag}
                      </span>
                    )}
                    {selected && valid(c) && <Icon name="check" size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-tertiary">⚡</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Bunu Deme ➔ Bunu De</h3>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded-full font-bold">L1 Tuzağı</span>
        </div>
        <p className="font-body-sm text-[13px] text-on-surface-variant">Zihnimiz Türkçedeki fiilleri birebir çevirmeye meyillidir. Bu ikilileri göz hafızana kazı:</p>
        <div className="flex flex-col gap-2 mt-1">
          {L1_TRAPS.map((t) => (
            <div key={t.wrong} className="bg-surface-container p-2.5 rounded-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-error font-bold text-xs shrink-0">❌</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant line-through truncate">{t.wrong}</span>
              </div>
              <span className="text-outline text-xs shrink-0">➔</span>
              <div className="flex items-center gap-1.5 text-right min-w-0">
                <span className="text-secondary font-bold text-xs shrink-0">✓</span>
                <span className="font-label-lg text-label-lg text-secondary font-semibold truncate">{t.right}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {locked && sentence && (
        <section className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-sm animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">Bağlamsal Kullanım</span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full font-bold">SRS Hazır</span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2">
            <div className="font-headline-sm text-[17px] text-on-surface leading-snug">
              “{sentence[0]}
              <span className="text-secondary font-bold underline decoration-secondary/50">{chunk}</span>
              {sentence[1]}”
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant italic">“{tr}”</div>
          </div>
          <div className="flex items-center justify-between text-outline text-label-sm font-label-sm pt-1">
            <div className="flex items-center gap-1.5">
              <Icon name="schedule" size={16} className="text-tertiary" />
              <span>
                Leitner Durumu: <strong className={card ? BOX_COLORS[card.box].text : 'text-on-surface'}>{card ? `Kutu ${card.box} (${dueLabel(card)})` : 'Henüz eklenmedi'}</strong>
              </span>
            </div>
            <span className="text-secondary font-semibold">+15 XP</span>
          </div>
          {card && <BoxStrip active={card.box} labels={false} />}
        </section>
      )}

      <section className="flex flex-col gap-space-sm pt-space-xs">
        <button
          type="button"
          disabled={!locked || !!card}
          onClick={add}
          className={cx(
            'w-full h-14 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50',
            card ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary',
          )}
        >
          <Icon name={card ? 'check' : 'add'} size={22} />
          <span>{card ? 'Desteye Eklendi!' : '+ Bu Kalıbı Leitner Desteme Ekle'}</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          className="w-full h-12 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>
            Sonraki Kelimeye Geç: <strong lang="en" className="uppercase">“{COLLOCATIONS[nextIndex].noun}”</strong>
          </span>
          <Icon name="arrow_forward" size={18} />
        </button>
      </section>
    </SubScreen>
  );
}
