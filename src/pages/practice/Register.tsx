import { useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { cx, Icon, SpeakButton } from '../../components/ui';
import { PERSONAL_DECK_ID } from '../../data/decks';
import { REGISTERS, type RegisterStage } from '../../data/modules';
import { slugify } from '../../data/words';
import { BOX_INTERVALS } from '../../lib/leitner';
import type { BoxNumber } from '../../lib/types';
import { useStore } from '../../store/AppStore';
import { useAddToBox } from '../../store/useAddToBox';

const STAGE_STYLES = [
  { bar: 'bg-error', soft: 'bg-error/40', icon: 'bg-error-container/30 text-error' },
  { bar: 'bg-tertiary', soft: 'bg-tertiary/40', icon: 'bg-tertiary-container/30 text-tertiary' },
  { bar: 'bg-primary', soft: 'bg-primary/40', icon: 'bg-surface-container-highest text-primary' },
  { bar: 'bg-primary', soft: 'bg-primary/40', icon: 'bg-primary-container text-on-primary-container' },
  { bar: 'bg-secondary', soft: 'bg-secondary/40', icon: 'bg-secondary-container/30 text-secondary' },
];

const ENV_TONE: Record<RegisterStage['envTone'], string> = {
  error: 'text-error bg-error/15',
  tertiary: 'text-tertiary bg-tertiary/15',
  neutral: 'text-on-surface bg-surface-container-highest',
  primary: 'text-primary bg-primary/15',
  secondary: 'text-secondary bg-secondary/15',
};

function Quote({ text }: { text: string }) {
  const parts = text.split(/\[\[|\]\]/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="text-primary font-semibold not-italic underline decoration-primary decoration-2 underline-offset-2">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export default function Register() {
  const { state } = useStore();
  const addToBox = useAddToBox();
  const [groupIndex, setGroupIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(3);
  const group = REGISTERS[groupIndex];
  const stage = group.stages[stageIndex];
  const plainQuote = stage.quote.replace(/\[\[|\]\]/g, '');
  const phraseIds = stage.phrases.map((p) => slugify(p));
  const allAdded = phraseIds.every((id) => state.cards[id]);
  const boxForStage = (Math.min(5, stageIndex + 1) as BoxNumber);

  const addPhrases = () => {
    stage.phrases.forEach((phrase, i) =>
      addToBox(
        {
          id: phraseIds[i],
          word: phrase,
          ipa: '',
          pos: 'phrase',
          cefr: stageIndex >= 4 ? 'C2' : stageIndex === 3 ? 'C1' : 'B1',
          meaning: `${group.title} • ${stage.label} ton`,
          examples: [{ en: plainQuote, tr: '' }],
          deckId: PERSONAL_DECK_ID,
        },
        i > 0,
      ),
    );
  };

  return (
    <SubScreen title="Resmiyet & Ton">
      <section className="bg-surface-container-high rounded-xl p-space-md shadow-md flex flex-col gap-space-xs relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm">
            <Icon name="tune" size={14} />
            LEXI-REGISTER ENGINE
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">B1 → C2 Spektrum</span>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">Resmiyet & Ton Spektrumu</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Hangi ifade nerede söylenir?</p>
        </div>
        <div className="mt-space-xs bg-surface-container p-space-sm rounded-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
              <Icon name="psychology_alt" size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">İfade & Anlam Grubu</p>
              <p className="font-label-lg text-label-lg text-on-surface truncate">{group.title}</p>
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-primary px-2 py-1 bg-primary/10 rounded-full shrink-0">5 Kademe</span>
        </div>
      </section>

      <section className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="thermostat" size={20} className="text-primary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Ton Termometresi</h3>
          </div>
          <span className="px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm shadow-sm">Kademe {stageIndex + 1} / 5</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 w-full h-3 rounded-full bg-surface-container-lowest p-0.5">
          {STAGE_STYLES.map((s, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Kademe ${i + 1}`}
              onClick={() => setStageIndex(i)}
              className={cx('h-full rounded-full transition-all duration-300', i === stageIndex ? cx(s.bar, 'shadow-sm') : s.soft)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {group.stages.map((s, i) => {
            const active = i === stageIndex;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setStageIndex(i)}
                className={cx(
                  'w-full text-left p-space-sm rounded-lg transition-all flex items-center justify-between gap-2',
                  active ? 'bg-surface-container-highest shadow-md' : 'bg-surface-container-low hover:bg-surface-container-high',
                )}
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className={cx('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-body-sm', STAGE_STYLES[i].icon)}>{s.emoji}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cx('font-label-md text-label-md', active ? 'text-primary font-bold' : 'text-on-surface')}>
                        {i + 1}. {s.label}
                      </span>
                      {active ? (
                        <span className="font-label-sm text-label-sm text-secondary font-semibold bg-secondary-container/20 px-1 rounded">SEÇİLİ</span>
                      ) : (
                        <span className="font-label-sm text-label-sm text-on-surface-variant">({s.en})</span>
                      )}
                    </div>
                    <p className={cx('font-body-sm text-body-sm truncate', active ? 'text-on-surface' : 'text-on-surface-variant')}>
                      <strong className={active ? 'text-primary-fixed-dim' : 'text-on-surface'}>“{s.phrases[0]}”</strong> • {s.phrases[1]}
                    </p>
                  </div>
                </div>
                <span className={cx('font-label-sm text-label-sm px-2 py-0.5 rounded shrink-0', active ? 'text-primary bg-primary/10' : 'text-on-surface-variant bg-surface-container-highest')}>
                  {s.audience}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-surface-container-high rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="devices" size={22} className="text-secondary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">Canlı Simülatör</h3>
          </div>
          <div className={cx('flex items-center gap-1 px-space-sm py-0.5 rounded-full font-label-sm text-label-sm shrink-0', ENV_TONE[stage.envTone])}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{stage.envBadge}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-sm shadow-inner">
          <div className="flex items-center justify-between text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <Icon name={stage.previewIcon} size={18} className="text-primary" />
              <span className="font-label-sm text-label-sm tracking-wide uppercase font-semibold text-primary">{stage.previewLabel}</span>
            </div>
            <SpeakButton text={plainQuote} size={16} className="w-8 h-8 rounded-full bg-surface-container text-primary" />
          </div>
          {stage.meta && (
            <div className="flex flex-col gap-0.5 bg-surface-container/30 px-space-sm py-1.5 rounded">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Kime: <span className="text-on-surface">{stage.meta.to}</span>
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Konu: <span className="text-on-surface">{stage.meta.subject}</span>
              </span>
            </div>
          )}
          <blockquote className="font-body-md text-body-md text-on-surface leading-relaxed italic bg-surface-container-low p-space-md rounded-lg">
            “<Quote text={stage.quote} />”
          </blockquote>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {stage.pills.map((p, i) => (
              <span key={p} className={cx('px-2 py-0.5 rounded-full font-label-sm text-label-sm', i === 2 ? (stageIndex <= 1 ? 'bg-error-container/30 text-error' : 'bg-secondary-container/20 text-secondary') : 'bg-surface-container text-on-surface-variant')}>
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-surface-container rounded-lg p-space-sm flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Icon name="compare_arrows" size={16} className="text-secondary" />
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Karşılaştırma Sekmesi</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-space-sm rounded">{stage.contrast}</p>
        </div>
      </section>

      <section className="bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-sm overflow-hidden">
        <div className="relative w-full h-32 rounded-lg overflow-hidden">
          <img className="w-full h-full object-cover" src="images/register-office.jpg" alt="" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-surface-container-highest/90 backdrop-blur-md px-2 py-1 rounded-full text-tertiary">
            <Icon name="insights" size={16} />
            <span className="font-label-sm text-label-sm font-semibold">Kritik Sosyolinguistik Nüans</span>
          </div>
        </div>
        <div className="bg-tertiary-container/15 rounded-lg p-space-md flex gap-space-sm">
          <Icon name="warning" size={24} className="text-tertiary flex-shrink-0" />
          <div className="flex flex-col gap-1 min-w-0">
            <h4 className="font-headline-sm text-headline-sm text-tertiary">Nüans İpuçları</h4>
            <p className="font-body-sm text-body-sm text-on-surface leading-snug">{group.nuance}</p>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-high rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
            <Icon name="inbox" size={18} className="text-primary" />
            Kalıplar Kutu 1’den başlar
          </span>
          <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full">{allAdded ? 'Destende' : 'Eklenmedi'}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => (
            <div
              key={b}
              className={cx('flex flex-col items-center gap-1 p-2 rounded-lg', b === boxForStage ? 'bg-primary-container text-on-primary-container shadow-md' : 'bg-surface-container-lowest opacity-50')}
            >
              <span className="font-label-sm text-label-sm">Kutu {b}</span>
              <span className="font-label-md text-label-md font-bold">{BOX_INTERVALS[b]} Gün</span>
            </div>
          ))}
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant">Vurgulanan kutu, bu resmiyet kademesinin zorluk düzeyini temsil eder.</p>
      </section>

      <footer className="flex flex-col gap-space-sm pt-space-xs">
        <button
          type="button"
          disabled={allAdded}
          onClick={addPhrases}
          className={cx(
            'w-full h-14 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-80',
            allAdded ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary',
          )}
        >
          <Icon name="library_add_check" size={20} />
          <span>{allAdded ? 'Kalıplar Destende' : `“${stage.phrases[0]}” Kalıplarını Desteme Ekle`}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setGroupIndex((g) => (g + 1) % REGISTERS.length);
            setStageIndex(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full h-12 bg-surface-container-highest hover:bg-surface-bright text-on-surface rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <span>Sonraki Kavram: {group.next}</span>
          <Icon name="arrow_forward" size={18} />
        </button>
      </footer>
    </SubScreen>
  );
}
