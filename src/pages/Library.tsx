import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TabScreen } from '../components/Layout';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { cx, Icon } from '../components/ui';
import { DECKS, PERSONAL_DECK_ID } from '../data/decks';
import { slugify } from '../data/words';
import { BOX_COLORS } from '../lib/leitner';
import { rankedSearch, wordSearchIndex } from '../lib/text';
import type { BoxNumber, CardState, Cefr, Word } from '../lib/types';
import { useStore } from '../store/AppStore';
import { allWords, cefrCounts, deckProgress } from '../store/selectors';

const CEFRS: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
type SortMode = 'default' | 'progress' | 'size';
const SORT_LABELS: Record<SortMode, string> = { default: 'Varsayılan', progress: 'İlerleme', size: 'Kelime Sayısı' };

const COLOR = {
  primary: { text: 'text-primary', bar: 'bg-primary', chip: 'bg-primary-container/20 text-primary' },
  secondary: { text: 'text-secondary', bar: 'bg-secondary', chip: 'bg-secondary-container/20 text-secondary' },
  tertiary: { text: 'text-tertiary', bar: 'bg-tertiary', chip: 'bg-tertiary-container/30 text-tertiary' },
};

export function WordRow({ word, box }: { word: Word; box?: BoxNumber }) {
  return (
    <Link
      to={`/kelime/${word.id}`}
      className="flex items-center justify-between gap-3 p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-space-xs">
          <span className="font-label-lg text-label-lg font-bold text-on-surface truncate">{word.word}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{word.ipa}</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{word.meaning}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">{word.cefr}</span>
        {box ? (
          <span className={cx('font-label-sm text-label-sm px-2 py-0.5 rounded-full', BOX_COLORS[box].soft, BOX_COLORS[box].text)}>K{box}</span>
        ) : (
          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-outline">Yeni</span>
        )}
      </div>
    </Link>
  );
}

/** Uzun kelime listelerini parça parça gösterir (telefonda yüzlerce satırı birden çizmemek için). */
export function PagedWordList({ words, cards, page = 50 }: { words: Word[]; cards: Record<string, CardState>; page?: number }) {
  const [limit, setLimit] = useState(page);
  return (
    <>
      {words.slice(0, limit).map((w) => (
        <WordRow key={w.id} word={w} box={cards[w.id]?.box} />
      ))}
      {words.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + page)}
          className="w-full py-3 rounded-xl bg-surface-container-high text-primary font-label-lg text-label-lg flex items-center justify-center gap-1.5"
        >
          <Icon name="expand_more" size={20} /> Daha fazla göster ({words.length - limit} kaldı)
        </button>
      )}
    </>
  );
}

export default function Library() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [cefr, setCefr] = useState<Cefr | null>(null);
  const [sort, setSort] = useState<SortMode>('default');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ word: '', meaning: '', example: '' });
  const rawBox = Number(params.get('kutu'));
  const boxParam: BoxNumber | 0 = rawBox >= 1 && rawBox <= 5 ? (rawBox as BoxNumber) : 0;

  // Kelime listesi yalnızca kendi kelimeler değişince yeniden kurulur (her tekrar sonrası değil)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = useMemo(() => allWords(state), [state.customWords]);
  const index = useMemo(() => wordSearchIndex(words), [words]);
  const counts = cefrCounts(state);
  const filtering = query.trim() !== '' || cefr !== null || boxParam > 0;
  // Türkçe karakter duyarsız ("kacinilmaz" → "kaçınılmaz"); tam ve baştan eşleşmeler önce gelir
  const results = useMemo(
    () => rankedSearch(index, query).filter((w) => (!cefr || w.cefr === cefr) && (!boxParam || state.cards[w.id]?.box === boxParam)),
    [index, query, cefr, boxParam, state.cards],
  );

  const decks = useMemo(() => {
    const list = DECKS.map((d) => ({ deck: d, progress: deckProgress(state, d.id) })).filter((x) => x.progress.total > 0 || x.deck.id === PERSONAL_DECK_ID);
    if (sort === 'progress') list.sort((a, b) => b.progress.percent - a.progress.percent);
    if (sort === 'size') list.sort((a, b) => b.progress.total - a.progress.total);
    return list;
  }, [state, sort]);

  const saveQuick = () => {
    const word = form.word.trim();
    const meaning = form.meaning.trim();
    if (!word || !meaning) {
      toast('Kelime ve çeviri gerekli', { tone: 'error' });
      return;
    }
    const id = slugify(word);
    if (words.some((w) => w.id === id && !w.custom)) {
      dispatch({ type: 'introduce', wordId: id });
      toast('Bu kelime zaten kütüphanede', { description: 'Kutu 1’e eklendi.', tone: 'info' });
    } else {
      dispatch({
        type: 'addWord',
        word: {
          id,
          word,
          meaning,
          ipa: '',
          pos: word.includes(' ') ? 'phrase' : 'noun',
          cefr: 'B1',
          examples: form.example.trim() ? [{ en: form.example.trim(), tr: '' }] : [],
          deckId: PERSONAL_DECK_ID,
        },
      });
      toast('Kelime destene başarıyla eklendi!', { description: 'Kutu 1 • Bugün tekrar edilecek' });
    }
    setForm({ word: '', meaning: '', example: '' });
    setAddOpen(false);
  };

  return (
    <TabScreen subtitle="Kütüphane">
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm bg-surface-container-high rounded-xl p-space-sm shadow-sm transition-all focus-within:bg-surface-container-highest">
          <Icon name="search" size={22} className="text-outline ml-1" />
          <input
            aria-label="Kütüphanede kelime ara"
            className="bg-transparent border-0 outline-none text-on-surface placeholder:text-outline font-body-md text-body-md w-full min-w-0"
            placeholder="Kelime, deyim veya anlam ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery('')} className="p-1 text-on-surface-variant">
              <Icon name="cancel" size={20} />
            </button>
          )}
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-surface-container-highest to-surface-container p-space-md shadow-md">
          <div className="flex items-center justify-between gap-space-sm relative z-10">
            <div className="flex flex-col min-w-0 pr-space-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon name="add_circle" size={18} className="text-primary" />
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Kişisel Sözlük</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Kendi Kelimeni Ekle</span>
              <Link to="/kutuphane/ekle" className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 underline decoration-outline/50">
                Otomatik doldurma, kamera & altyazı analizi →
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-on-primary font-label-lg text-label-lg px-4 py-2.5 rounded-full shadow-lg active:scale-95 transition-transform"
            >
              <Icon name="add" size={18} />
              <span>Ekle</span>
            </button>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col gap-space-xs -mx-margin">
        <div className="flex items-center justify-between px-margin">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">CEFR Düzeyleri</span>
          <span className="font-label-sm text-label-sm text-secondary">{words.length} Toplam</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto px-margin py-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setCefr(null)}
            className={cx(
              'flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors',
              cefr === null ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface',
            )}
          >
            Tümü <span className="opacity-70 ml-0.5 font-normal">({DECKS.length} Deste)</span>
          </button>
          {CEFRS.filter((c) => counts[c]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCefr(cefr === c ? null : c)}
              className={cx(
                'flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1.5',
                cefr === c ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface',
              )}
            >
              {cefr === c && <span className="w-1.5 h-1.5 rounded-full bg-on-primary animate-pulse" />}
              {c} <span className="opacity-70 font-normal">{counts[c]}</span>
            </button>
          ))}
        </div>
      </div>

      {boxParam !== 0 && (
        <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-space-md py-2.5">
          <span className={cx('font-label-lg text-label-lg', BOX_COLORS[boxParam].text)}>Kutu {boxParam} filtresi</span>
          <button type="button" onClick={() => setParams({})} className="font-label-md text-label-md text-primary flex items-center gap-1">
            Temizle <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {filtering ? (
        <section className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-0.5">{results.length} sonuç</span>
          <PagedWordList key={`${query}|${cefr}|${boxParam}`} words={results} cards={state.cards} />
          {!results.length && (
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-6">
              Eşleşen kelime yok.{' '}
              <button type="button" className="text-primary underline" onClick={() => navigate(`/kutuphane/ekle?kelime=${encodeURIComponent(query)}`)}>
                “{query}” kelimesini ekle
              </button>
            </p>
          )}
        </section>
      ) : (
        <>
          <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-space-md py-2.5 shadow-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
                <Icon name="cloud_done" size={20} className="text-secondary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">Çevrimdışı Kullanılabilir</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{words.length} kelime cihazda • Telaffuz cihaz sesiyle</span>
              </div>
            </div>
          </div>

          <section className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Tematik Desteler</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-primary">{decks.length} Paket</span>
              </div>
              <button
                type="button"
                onClick={() => setSort(sort === 'default' ? 'progress' : sort === 'progress' ? 'size' : 'default')}
                className="font-label-md text-label-md text-primary flex items-center gap-0.5 hover:underline"
              >
                {SORT_LABELS[sort]}
                <Icon name="swap_vert" size={16} />
              </button>
            </div>
            {decks.map(({ deck: d, progress: p }) => {
              const c = COLOR[d.color];
              const almost = p.percent >= 90;
              return (
                <div key={d.id} className="bg-surface-container rounded-xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col gap-space-sm">
                  <Link to={`/kutuphane/deste/${d.id}`} aria-label={`${d.title} destesindeki kelimeler`} className="flex items-start gap-space-md">
                    {d.image ? (
                      <img className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-surface-container-high shadow-sm" src={d.image} alt="" loading="lazy" />
                    ) : (
                      <div className={cx('w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0', c.text)}>
                        <Icon name={d.icon ?? 'style'} size={32} />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={cx('px-2 py-0.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1', c.chip)}>
                          <Icon name={d.tagIcon} size={13} />
                          {d.tag}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{p.total} Kelime</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                        {d.emoji} {d.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">{d.description}</p>
                    </div>
                    <Icon name="chevron_right" size={20} className="text-on-surface-variant self-center shrink-0" />
                  </Link>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex justify-between items-center text-label-sm font-label-sm">
                      <span className="text-on-surface-variant">{almost ? 'Tamamlanmak Üzere' : 'Öğrenme İlerlemesi'}</span>
                      <span className={cx('font-bold', c.text)}>%{p.percent}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className={cx('h-full rounded-full transition-all', c.bar)} style={{ width: `${p.percent}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <Icon name="signal_cellular_alt" size={16} className={c.text} />
                      <span>{d.level}</span>
                    </div>
                    {p.total > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'enrollDeck', deckId: d.id });
                          navigate(`/ogren/oturum?deste=${d.id}`);
                        }}
                        className={cx(
                          'flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors active:scale-95',
                          almost ? 'bg-tertiary text-on-tertiary shadow-sm' : cx('bg-surface-container-highest hover:bg-primary hover:text-on-primary', c.text),
                        )}
                      >
                        <span>{almost ? 'Tekrar Et' : 'Çalış'}</span>
                        <Icon name={almost ? 'replay' : 'play_arrow'} size={18} />
                      </button>
                    ) : (
                      <button type="button" onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-highest text-primary font-label-md text-label-md">
                        <span>Kelime Ekle</span>
                        <Icon name="add" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Yeni Kelime Kaydet" icon="bookmark_add">
        <div className="flex flex-col gap-space-sm">
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">İngilizce Kelime / Kalıp</span>
            <input
              className="h-12 px-space-md rounded-xl bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Örn: Serendipity"
              value={form.word}
              onChange={(e) => setForm({ ...form, word: e.target.value })}
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Türkçe Çevirisi</span>
            <input
              className="h-12 px-space-md rounded-xl bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Örn: Mutlu tesadüf"
              value={form.meaning}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Örnek Cümle (Opsiyonel)</span>
            <textarea
              className="p-space-md rounded-xl bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
              placeholder="Finding this book was sheer serendipity."
              rows={2}
              value={form.example}
              onChange={(e) => setForm({ ...form, example: e.target.value })}
            />
          </label>
          <div className="flex items-center justify-between pt-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Hedef Deste:</span>
            <span className="px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm">⭐ Kişisel Destem</span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm pt-2">
          <button type="button" onClick={() => setAddOpen(false)} className="flex-1 h-12 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-highest transition-colors">
            Vazgeç
          </button>
          <button
            type="button"
            onClick={saveQuick}
            className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-md flex items-center justify-center gap-1.5"
          >
            <Icon name="check" size={20} />
            <span>Kaydet</span>
          </button>
        </div>
      </Sheet>
    </TabScreen>
  );
}
