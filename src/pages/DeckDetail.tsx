import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SubScreen } from '../components/Layout';
import { Toggle } from '../components/StudySettings';
import { cx, EmptyState, Icon, PrimaryButton } from '../components/ui';
import { getDeck, PERSONAL_DECK_ID } from '../data/decks';
import { rankedSearch, wordSearchIndex } from '../lib/text';
import { useStore } from '../store/AppStore';
import { allWords, deckProgress } from '../store/selectors';
import { PagedWordList } from './Library';

type Filter = 'all' | 'new' | 'learning' | 'mastered';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'new', label: 'Yeni' },
  { id: 'learning', label: 'Öğreniliyor' },
  { id: 'mastered', label: 'Kalıcı' },
];

/** Bir destedeki tüm kelimeler: durum filtresi, arama ve desteyi etkinleştirme. */
export default function DeckDetail() {
  const { id = '' } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const deck = getDeck(id);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => allWords(state).filter((w) => w.deckId === id), [state.customWords, id]);
  const index = useMemo(() => wordSearchIndex(words), [words]);

  if (!deck) {
    return (
      <SubScreen title="Deste">
        <EmptyState icon="search_off" title="Deste bulunamadı" text="Bu deste kaldırılmış olabilir." action={<Link className="text-primary" to="/kutuphane">Kütüphaneye dön</Link>} />
      </SubScreen>
    );
  }

  const status = (wid: string): Filter => {
    const c = state.cards[wid];
    return !c ? 'new' : c.box >= 4 ? 'mastered' : 'learning';
  };
  const counts: Record<Filter, number> = { all: words.length, new: 0, learning: 0, mastered: 0 };
  for (const w of words) counts[status(w.id)]++;
  const shown = rankedSearch(index, query).filter((w) => filter === 'all' || status(w.id) === filter);
  const enrolled = state.enrolledDecks.includes(deck.id);
  const p = deckProgress(state, deck.id);

  return (
    <SubScreen title={deck.title}>
      <section className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md">
        <div className="flex items-start gap-space-md">
          {deck.image ? (
            <img className="w-20 h-20 rounded-xl object-cover shrink-0 bg-surface-container-high" src={deck.image} alt="" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
              <Icon name={deck.icon ?? 'style'} size={36} />
            </div>
          )}
          <div className="flex flex-col min-w-0 gap-0.5">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider flex items-center gap-1">
              <Icon name={deck.tagIcon} size={14} /> {deck.tag} • {deck.level}
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {deck.emoji} {deck.title}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{deck.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(
            [
              ['Kelime', counts.all, 'text-on-surface'],
              ['Başladın', p.started, 'text-primary'],
              ['Kalıcı', counts.mastered, 'text-secondary'],
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
            <span className="text-on-surface-variant">Öğrenme ilerlemesi</span>
            <span className="text-secondary font-bold">%{p.percent}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${p.percent}%` }} />
          </div>
        </div>
        {deck.id !== PERSONAL_DECK_ID && (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-label-lg text-label-lg text-on-surface">Günlük yeni kelimeler</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">Açıkken günlük plandaki yeni kelimeler bu desteden de gelir.</p>
            </div>
            <Toggle label="Desteyi günlük plana ekle" checked={enrolled} onChange={(v) => dispatch({ type: v ? 'enrollDeck' : 'unenrollDeck', deckId: deck.id })} />
          </div>
        )}
        {counts.all > 0 && (
          <PrimaryButton
            onClick={() => {
              dispatch({ type: 'enrollDeck', deckId: deck.id });
              navigate(`/ogren/oturum?deste=${deck.id}`);
            }}
          >
            <Icon name="play_arrow" size={22} fill /> Bu Desteyi Çalış
          </PrimaryButton>
        )}
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm bg-surface-container-high rounded-xl px-3 py-2 focus-within:bg-surface-container-highest">
          <Icon name="search" size={20} className="text-outline" />
          <input
            aria-label="Destede ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bu destede ara…"
            className="bg-transparent outline-none text-on-surface placeholder:text-outline font-body-md text-body-md w-full min-w-0"
          />
          {query && (
            <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery('')} className="text-on-surface-variant">
              <Icon name="cancel" size={18} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-margin px-margin">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cx(
                'shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors',
                filter === f.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant',
              )}
            >
              {f.label} <span className="opacity-70 font-normal">{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-space-xs">
          <PagedWordList key={`${filter}|${query}`} words={shown} cards={state.cards} />
          {!shown.length && (
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-6">
              {counts.all === 0 ? (
                <>
                  Bu destede henüz kelime yok.{' '}
                  <Link to="/kutuphane/ekle" className="text-primary underline">
                    Kelime ekle
                  </Link>
                </>
              ) : (
                'Bu filtrede kelime yok.'
              )}
            </p>
          )}
        </div>
      </section>
    </SubScreen>
  );
}
