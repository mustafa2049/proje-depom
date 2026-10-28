import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SubScreen } from '../components/Layout';
import { cx, EmptyState, Icon, PrimaryButton } from '../components/ui';
import type { Cefr } from '../lib/types';
import { useStore } from '../store/AppStore';
import { CEFR_LEVELS, currentLevel, LEVEL_NAMES, levelPathWords } from '../store/selectors';
import { WordCollection } from './DeckDetail';

const LEVEL_TEXT: Record<Cefr, string> = {
  A1: 'Kendini tanıtma, aile, sayılar, renkler ve günlük temel ihtiyaçlar.',
  A2: 'Alışveriş, yol tarifi, iş ve okul gibi günlük rutinler.',
  B1: 'Seyahat, deneyimler ve görüşler; çoğu günlük durumda kendini ifade etme.',
  B2: 'Soyut konular, tartışma ve iş hayatı; akıcı ve doğal iletişim.',
  C1: 'Akademik ve profesyonel metinler, ince anlam farkları.',
  C2: 'Edebî ve nüanslı, anadile yakın kelime dağarcığı.',
};

/** Bir CEFR seviyesindeki tüm kelimeler (seviye yolu sırasıyla). */
export default function LevelDetail() {
  const { level: param = '' } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const level = CEFR_LEVELS.find((l) => l === param.toUpperCase());

  // Seviye yolu sırası: "Yeni" filtresinde kelimeler tanıtılacakları sırayla görünür
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => (level ? levelPathWords(state).filter((w) => w.cefr === level) : []), [state.customWords, level]);

  if (!level) {
    return (
      <SubScreen title="Seviye">
        <EmptyState icon="search_off" title="Seviye bulunamadı" text="A1, A2, B1, B2, C1 veya C2 olmalı." action={<Link className="text-primary" to="/kutuphane">Kütüphaneye dön</Link>} />
      </SubScreen>
    );
  }

  const started = words.filter((w) => state.cards[w.id]).length;
  const mastered = words.filter((w) => (state.cards[w.id]?.box ?? 0) >= 4).length;
  const percent = words.length ? Math.round((started / words.length) * 100) : 0;
  const levelMode = state.profile.newWordOrder === 'level';
  const isStart = state.profile.startLevel === level;
  const isCurrent = levelMode && currentLevel(state) === level;
  const index = CEFR_LEVELS.indexOf(level);

  return (
    <SubScreen title={`Seviye ${level}`}>
      <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md">
        <div className="flex items-start gap-space-md">
          <div className="w-20 h-20 rounded-xl bg-primary-container/30 text-primary flex flex-col items-center justify-center shrink-0">
            <span className="font-display-lg text-headline-lg font-bold leading-none">{level}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">{index + 1}/6</span>
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider flex items-center gap-1">
              <Icon name="route" size={14} /> Seviye yolu {isCurrent && '• şu an burada'}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{LEVEL_NAMES[level]}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{LEVEL_TEXT[level]}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(
            [
              ['Kelime', words.length, 'text-on-surface'],
              ['Başladın', started, 'text-primary'],
              ['Kalıcı', mastered, 'text-secondary'],
            ] as const
          ).map(([label, n, color]) => (
            <div key={label} className="bg-surface-container-high rounded-lg py-2">
              <span className={cx('font-headline-sm text-headline-sm font-bold block', color)}>{n}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-label-sm text-label-sm">
            <span className="text-on-surface-variant">Kutuya giren kelimeler</span>
            <span className="text-secondary font-bold">%{percent}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
        {words.length > 0 && (
          <PrimaryButton onClick={() => navigate(`/ogren/oturum?seviye=${level}`)}>
            <Icon name="play_arrow" size={22} fill /> {level} Seviyesini Çalış
          </PrimaryButton>
        )}
        {levelMode && !isStart && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'setProfile', patch: { startLevel: level } })}
            className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-1.5"
          >
            <Icon name="flag" size={18} className="text-tertiary" /> Seviye yolumu {level}’den başlat
          </button>
        )}
      </section>

      <WordCollection words={words} emptyHint="Bu seviyede kelime yok." />
    </SubScreen>
  );
}
