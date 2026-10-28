import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SubScreen } from '../components/Layout';
import { useToast } from '../components/Toast';
import { cx, Icon, SpeakButton } from '../components/ui';
import { DECKS, PERSONAL_DECK_ID } from '../data/decks';
import { POS_LABELS, slugify } from '../data/words';
import { aiAvailable } from '../lib/ai';
import { aiExtractVocab, aiWordInfo } from '../lib/aiTasks';
import { lookupOnline } from '../lib/dictionary';
import { BOX_COLORS, BOX_LABELS } from '../lib/leitner';
import { vibrate } from '../lib/speech';
import { cleanSubtitles, extractVocabulary, findWordId, tokenize } from '../lib/text';
import type { BoxNumber, Cefr, PartOfSpeech, Word } from '../lib/types';
import { useStore } from '../store/AppStore';
import { deckWordCount } from '../store/selectors';
import { useAddToBox } from '../store/useAddToBox';

type Mode = 'manual' | 'ocr' | 'subtitle' | 'text';

interface FormState {
  word: string;
  ipa: string;
  pos: PartOfSpeech;
  cefr: Cefr;
  meaning: string;
  ex1: string;
  ex1tr: string;
  ex2: string;
  ex2tr: string;
  synonyms: string;
}

const EMPTY: FormState = { word: '', ipa: '', pos: 'noun', cefr: 'B1', meaning: '', ex1: '', ex1tr: '', ex2: '', ex2tr: '', synonyms: '' };

function fromWord(w: Word): FormState {
  return {
    word: w.word,
    ipa: w.ipa,
    pos: w.pos,
    cefr: w.cefr,
    meaning: w.meaning,
    ex1: w.examples[0]?.en ?? '',
    ex1tr: w.examples[0]?.tr ?? '',
    ex2: w.examples[1]?.en ?? '',
    ex2tr: w.examples[1]?.tr ?? '',
    synonyms: (w.synonyms ?? []).join(', '),
  };
}

const inputClass =
  'w-full bg-surface-container-lowest text-on-surface px-4 py-3 rounded-xl outline-none shadow-inner focus:bg-surface-container-high focus:ring-1 focus:ring-primary transition-all placeholder:text-outline';

export default function AddWord() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>('manual');
  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY, word: params.get('kelime') ?? '' }));
  const [deckId, setDeckId] = useState(PERSONAL_DECK_ID);
  const [box, setBox] = useState<BoxNumber>(1);
  const [loading, setLoading] = useState(false);
  const [filled, setFilled] = useState<'local' | 'online' | 'partial' | 'ai' | null>(null);
  // Yapay zekânın ürettiği ama formda alanı olmayan bilgiler (kayıtta karta eklenir)
  const [aiExtra, setAiExtra] = useState<Pick<Word, 'mnemonic' | 'collocations'>>({});
  const deckCounts = deckWordCount(state);

  const existing = words[slugify(form.word)];

  const autofill = async (text = form.word) => {
    const q = text.trim();
    if (!q) return;
    const local = words[slugify(q)];
    if (local) {
      setForm(fromWord(local));
      setDeckId(local.deckId);
      setFilled('local');
      return;
    }
    setLoading(true);
    setFilled(null);
    setAiExtra({});
    if (aiAvailable()) {
      try {
        const w = await aiWordInfo(q, deckId);
        setForm({ ...fromWord(w), word: q });
        setAiExtra({ mnemonic: w.mnemonic, collocations: w.collocations });
        setFilled('ai');
        setLoading(false);
        return;
      } catch {
        // Yapay zekâ başarısızsa ücretsiz sözlüklere dön.
      }
    }
    const res = await lookupOnline(q, deckId);
    setLoading(false);
    if (!res) {
      toast('Otomatik doldurulamadı', {
        description: navigator.onLine ? 'Kelime sözlükte bulunamadı; alanları elle doldurabilirsin.' : 'İnternet bağlantısı yok.',
        tone: 'error',
      });
      return;
    }
    setForm({ ...fromWord(res.word), word: q });
    setFilled(res.source);
  };

  const pickWord = (w: string) => {
    setMode('manual');
    setForm({ ...EMPTY, word: w });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void autofill(w);
  };

  const save = () => {
    const word = form.word.trim();
    if (!word || !form.meaning.trim()) {
      toast('Kelime ve Türkçe karşılık gerekli', { tone: 'error' });
      return;
    }
    const id = slugify(word);
    const examples = [
      { en: form.ex1.trim(), tr: form.ex1tr.trim() },
      { en: form.ex2.trim(), tr: form.ex2tr.trim() },
    ].filter((e) => e.en);
    const base = words[id];
    const payload: Word = {
      ...(base ?? {}),
      id,
      word,
      ipa: form.ipa.trim(),
      pos: form.pos,
      cefr: form.cefr,
      meaning: form.meaning.trim(),
      examples,
      synonyms: form.synonyms.split(',').map((s) => s.trim()).filter(Boolean),
      ...(filled === 'ai' ? aiExtra : {}),
      deckId,
    };
    dispatch({ type: 'addWord', word: payload, box });
    vibrate(50);
    toast('Desteğe Eklendi!', { description: `${word} → Kutu ${box}` });
    setForm(EMPTY);
    setFilled(null);
    setAiExtra({});
  };

  return (
    <SubScreen title="Kendi Kelimeni Ekle" bottomPadding="pb-36">
      <section className="bg-surface-container-low p-1.5 rounded-2xl flex items-center justify-between shadow-sm gap-1">
        {(
          [
            ['manual', 'edit', 'Manuel'],
            ['ocr', 'document_scanner', 'Kamera'],
            ['subtitle', 'subtitles', 'Altyazı'],
            ...(aiAvailable() ? ([['text', 'auto_awesome', 'Metin (AI)']] as const) : []),
          ] as const
        ).map(([m, icon, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cx(
              'flex-1 py-2.5 px-2 rounded-xl font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all',
              mode === m ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high',
            )}
          >
            <Icon name={icon} size={18} />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </section>

      {mode === 'ocr' && <OcrPanel onPick={pickWord} />}
      {mode === 'subtitle' && <SubtitlePanel onPick={pickWord} />}
      {mode === 'text' && <TextDeckPanel />}

      {mode === 'manual' && (
        <>
          <section className="bg-surface-container rounded-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-2" htmlFor="target-word">
                <Icon name="translate" size={20} className="text-primary" />
                Hedef Kelime (İngilizce)
              </label>
              {existing && !existing.custom && (
                <span className="font-label-sm text-label-sm text-tertiary px-2.5 py-0.5 rounded-full bg-tertiary-container/20">Kütüphanede var</span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                id="target-word"
                className={cx(inputClass, 'font-headline-sm text-headline-sm py-3.5 pr-12')}
                placeholder="Kelime yazın..."
                value={form.word}
                autoComplete="off"
                autoCapitalize="none"
                onChange={(e) => {
                  setForm({ ...form, word: e.target.value });
                  setFilled(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && autofill()}
              />
              {form.word && (
                <button type="button" aria-label="Kelimeyi temizle" onClick={() => { setForm(EMPTY); setFilled(null); }} className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1">
                  <Icon name="cancel" size={20} />
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={!form.word.trim() || loading}
              onClick={() => autofill()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary-container font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.99] transition-transform disabled:opacity-50"
            >
              <Icon name={loading ? 'progress_activity' : 'auto_awesome'} size={20} className={loading ? 'animate-spin' : undefined} />
              <span>{loading ? 'Sözlükte aranıyor…' : 'Fonetik, Anlam ve Örnek Cümle Doldur'}</span>
            </button>
            {filled && (
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                {filled === 'ai'
                  ? 'Yapay zekâ (Groq) ile dolduruldu; hafıza ipucu da karta eklenecek. Kaydetmeden önce kontrol et.'
                  : filled === 'local'
                  ? 'Yerel sözlükten dolduruldu.'
                  : filled === 'online'
                    ? 'İnternet sözlüğünden dolduruldu (Free Dictionary + MyMemory çeviri). Lütfen kontrol et.'
                    : 'Kısmen dolduruldu — eksik alanları tamamla.'}
              </p>
            )}

            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  aria-label="Fonetik (IPA)"
                  className={cx(inputClass, 'font-mono text-primary py-2')}
                  placeholder="/fəˈnetɪk/"
                  value={form.ipa}
                  onChange={(e) => setForm({ ...form, ipa: e.target.value })}
                />
                {form.word && <SpeakButton text={form.word} className="w-10 h-10 shrink-0 rounded-full bg-surface-container-highest flex items-center justify-center text-primary" />}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select aria-label="Sözcük türü" className={cx(inputClass, 'py-2')} value={form.pos} onChange={(e) => setForm({ ...form, pos: e.target.value as PartOfSpeech })}>
                  {Object.entries(POS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.tr} ({v.en})
                    </option>
                  ))}
                </select>
                <select aria-label="CEFR seviyesi" className={cx(inputClass, 'py-2')} value={form.cefr} onChange={(e) => setForm({ ...form, cefr: e.target.value as Cefr })}>
                  {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as Cefr[]).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Türkçe Karşılık</span>
                <input
                  className={cx(inputClass, 'font-headline-sm text-headline-sm text-secondary py-2.5')}
                  placeholder="Örn: Mutlu tesadüf"
                  value={form.meaning}
                  onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                />
              </label>
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 pt-1">
                <Icon name="format_quote" size={14} className="text-primary" />
                Örnek Cümleler
              </span>
              {(['1', '2'] as const).map((n) => (
                <div key={n} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-surface-container-highest/40">
                  <input
                    aria-label={`Örnek cümle ${n}`}
                    className="bg-transparent outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline"
                    placeholder={n === '1' ? 'Finding this book was pure serendipity.' : 'İkinci örnek (opsiyonel)'}
                    value={form[`ex${n}`]}
                    onChange={(e) => setForm({ ...form, [`ex${n}`]: e.target.value })}
                  />
                  <input
                    aria-label={`Örnek cümle ${n} çevirisi`}
                    className="bg-transparent outline-none font-label-md text-label-md text-on-surface-variant italic placeholder:text-outline"
                    placeholder="Çeviri (opsiyonel)"
                    value={form[`ex${n}tr`]}
                    onChange={(e) => setForm({ ...form, [`ex${n}tr`]: e.target.value })}
                  />
                </div>
              ))}
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Eş Anlamlılar (virgülle)</span>
                <input className={cx(inputClass, 'py-2')} placeholder="chance, fluke" value={form.synonyms} onChange={(e) => setForm({ ...form, synonyms: e.target.value })} />
              </label>
            </div>
          </section>

          <section className="bg-surface-container rounded-2xl p-5 shadow-lg flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between" htmlFor="deck-picker">
                <span className="flex items-center gap-2">
                  <Icon name="style" size={20} className="text-secondary" />
                  Hedef Deste / Paket
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{deckCounts[deckId] ?? 0} Kelime Mevcut</span>
              </label>
              <div className="relative">
                <select
                  id="deck-picker"
                  className="w-full appearance-none bg-surface-container-low text-on-surface py-3.5 px-4 pr-10 rounded-xl font-body-md text-body-md outline-none shadow-inner cursor-pointer hover:bg-surface-container-high transition-colors"
                  value={deckId}
                  onChange={(e) => setDeckId(e.target.value)}
                >
                  {DECKS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.emoji} {d.title}
                    </option>
                  ))}
                </select>
                <Icon name="expand_more" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
                  <Icon name="inbox" size={20} className="text-tertiary" />
                  Başlangıç Leitner Kutusu
                </span>
                <span className="font-label-sm text-label-sm bg-error-container/40 text-on-error-container px-2 py-0.5 rounded-full font-bold">Önerilen: Kutu 1</span>
              </div>
              <div role="radiogroup" aria-label="Leitner kutu seçimi" className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as BoxNumber[]).map((b) => {
                  const active = b === box;
                  return (
                    <button
                      key={b}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setBox(b)}
                      className={cx(
                        'flex flex-col items-center justify-between py-2.5 px-1 rounded-xl transition-all',
                        active ? 'bg-surface-container-highest shadow-md scale-[1.03]' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high',
                      )}
                    >
                      <div
                        className={cx(
                          'w-5 h-5 rounded-full font-label-sm text-label-sm flex items-center justify-center font-bold',
                          active ? cx(BOX_COLORS[b].bg, 'text-surface') : 'bg-surface-variant text-on-surface-variant',
                        )}
                      >
                        {b}
                      </div>
                      <span className={cx('font-label-sm text-label-sm mt-1', active ? 'text-on-surface' : 'text-on-surface')}>Kutu {b}</span>
                      <span className={cx('font-label-sm text-label-sm mt-0.5', active ? BOX_COLORS[b].text : 'text-on-surface-variant')}>
                        {b === 5 ? 'Kalıcı' : BOX_LABELS[b]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant text-center pt-1">
                Yeni eklenen kelimeler en yüksek tekrar sıklığı için <strong className="text-on-surface">Kutu 1</strong> ile başlar.
              </p>
            </div>
          </section>
        </>
      )}

      {mode === 'manual' && (
        <div className="fixed bottom-0 inset-x-0 z-40 px-margin pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 bg-gradient-to-t from-surface via-surface/95 to-transparent">
          <div className="max-w-md mx-auto bg-surface/90 backdrop-blur-md p-2 rounded-2xl shadow-xl flex flex-col gap-2">
            <button
              type="button"
              onClick={save}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-primary-container via-primary to-inverse-primary text-on-primary-container font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
            >
              <Icon name="bookmark_add" size={24} />
              <span>Kelimeyi Desteğe Ekle (+ Kutu {box})</span>
            </button>
            <div className="flex items-center justify-center gap-2 text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-sm text-label-sm">
                {box === 1 ? 'Akıllı SRS: bugün ilk tekrarına düşecek' : `Akıllı SRS: ${BOX_LABELS[box]} sonra tekrar edilecek`}
              </span>
              <button type="button" onClick={() => navigate('/kutuphane')} className="font-label-sm text-label-sm text-primary ml-1">
                Kütüphane
              </button>
            </div>
          </div>
        </div>
      )}
    </SubScreen>
  );
}

function TappableText({ text, onPick }: { text: string; onPick: (w: string) => void }) {
  const { state } = useStore();
  const tokens = useMemo(() => tokenize(text), [text]);
  return (
    <div className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed p-3 bg-surface-container-low rounded-lg shadow-inner whitespace-pre-wrap max-h-80 overflow-y-auto">
      {tokens.map((t, i) => {
        if (!t.isWord) return <span key={i}>{t.text}</span>;
        const known = findWordId(t.text, state.cards);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick(t.text.toLowerCase())}
            className={cx(
              'inline px-0.5 rounded transition-all hover:bg-primary hover:text-on-primary',
              known ? 'text-secondary' : 'text-on-surface',
            )}
          >
            {t.text}
          </button>
        );
      })}
    </div>
  );
}

function OcrPanel({ onPick }: { onPick: (w: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const run = async (file: File) => {
    setError('');
    setText('');
    setPreview(URL.createObjectURL(file));
    setProgress(0);
    try {
      const Tesseract = await import('tesseract.js');
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });
      setText(result.data.text.trim());
      if (!result.data.text.trim()) setError('Görselde okunabilir metin bulunamadı.');
    } catch {
      setError('Metin tanıma başarısız oldu. İlk kullanımda dil verisi indirildiği için internet bağlantısı gerekir.');
    } finally {
      setProgress(null);
    }
  };

  return (
    <section className="bg-surface-container rounded-2xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
            <Icon name="photo_camera" size={20} />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Kamera ile Tara</h2>
            <p className="font-label-md text-label-md text-on-surface-variant">Kitaptan veya ekrandan kelime çek</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="py-2 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <Icon name="add_a_photo" size={16} className="text-secondary" />
          <span>Fotoğraf Çek</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void run(f);
            e.target.value = '';
          }}
        />
      </div>
      {preview && <img src={preview} alt="Taranan sayfa" className="w-full max-h-48 object-contain rounded-lg bg-surface-container-lowest" />}
      {progress !== null && (
        <div className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Metin tanınıyor… %{progress}</span>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      {text ? (
        <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <Icon name="menu_book" size={14} /> Taranan Metin
            </span>
            <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full">OCR Tamamlandı</span>
          </div>
          <TappableText text={text} onPick={onPick} />
          <div className="flex items-center gap-1.5">
            <Icon name="touch_app" size={16} className="text-tertiary" />
            <p className="font-label-sm text-label-sm text-tertiary-fixed-dim">Bir kelimeye dokun; anlamı otomatik doldurulup kart formuna aktarılır. Yeşil kelimeler zaten kutularında.</p>
          </div>
        </div>
      ) : (
        progress === null && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Bir kitap sayfasının veya ekranın fotoğrafını çek. Metin cihazında tanınır (Tesseract OCR), sonra bilmediğin kelimelere dokunarak kart oluşturabilirsin.
          </p>
        )
      )}
    </section>
  );
}

function SubtitlePanel({ onPick }: { onPick: (w: string) => void }) {
  const { state, words } = useStore();
  const [raw, setRaw] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const vocab = useMemo(() => extractVocabulary(cleanSubtitles(raw)).slice(0, 60), [raw]);

  return (
    <section className="bg-surface-container rounded-2xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
            <Icon name="subtitles" size={20} />
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Altyazı Analizi</h2>
            <p className="font-label-md text-label-md text-on-surface-variant">.srt / .vtt dosyası yükle veya metin yapıştır</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="py-2 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-label-md text-label-md flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Icon name="upload_file" size={16} className="text-secondary" />
          Dosya
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".srt,.vtt,.txt,text/plain"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setRaw(await f.text());
            e.target.value = '';
          }}
        />
      </div>
      <textarea
        aria-label="Altyazı metni"
        rows={5}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={'1\n00:00:01,000 --> 00:00:03,500\nIt was pure serendipity that we ran into each other!'}
        className="p-3 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary resize-y placeholder:text-outline"
      />
      {vocab.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Öğrenmeye Değer Kelimeler</span>
            <span className="font-label-sm text-label-sm text-secondary">{vocab.length} aday</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {vocab.map((v) => {
              const id = findWordId(v.word, words);
              const inBox = id ? state.cards[id] : undefined;
              return (
                <button
                  key={v.word}
                  type="button"
                  onClick={() => onPick(v.word)}
                  className={cx(
                    'px-2.5 py-1 rounded-full font-label-md text-label-md flex items-center gap-1 transition-colors',
                    inBox ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary',
                  )}
                >
                  {v.word}
                  <span className="opacity-60 font-normal">×{v.count}</span>
                  {inBox && <Icon name="check" size={14} />}
                </button>
              );
            })}
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Sık kullanılan temel kelimeler filtrelendi. Yeşil olanlar zaten kutularında.</p>
        </div>
      )}
    </section>
  );
}

/** Yapıştırılan metinden yapay zekâyla öğrenmeye değer kelimeleri çıkarıp toplu ekleme. */
function TextDeckPanel() {
  const { state, words } = useStore();
  const toast = useToast();
  const addToBox = useAddToBox();
  const [text, setText] = useState('');
  const [level, setLevel] = useState<Cefr>('B1');
  const [deckId, setDeckId] = useState(PERSONAL_DECK_ID);
  const [items, setItems] = useState<Word[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const extract = async () => {
    setLoading(true);
    try {
      const known = Object.keys(state.cards).map((id) => words[id]?.word).filter((w): w is string => !!w);
      const found = (await aiExtractVocab(text, level, deckId, known)).filter((w, i, all) => all.findIndex((x) => x.id === w.id) === i);
      // Sözlükte zaten olan kelimeler için hazır (doğrulanmış) kart kullanılır
      const merged = found.map((w) => words[w.id] ?? w);
      setItems(merged);
      setSelected(merged.filter((w) => !state.cards[w.id]).map((w) => w.id));
      if (!merged.length) toast('Öğrenmeye değer kelime bulunamadı', { tone: 'info', icon: 'search_off' });
    } catch (e) {
      toast('Kelimeler çıkarılamadı', { description: (e as Error).message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addSelected = () => {
    const added = items.filter((w) => selected.includes(w.id)).filter((w) => addToBox(w, true)).length;
    vibrate(50);
    toast(`${added} kelime Kutu 1’e eklendi`, { description: 'Bugünkü çalışmanda karşına çıkacaklar.', icon: 'library_add' });
    setSelected([]);
  };

  return (
    <section className="bg-surface-container rounded-2xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
          <Icon name="auto_awesome" size={20} />
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Metinden Deste Oluştur</h2>
          <p className="font-label-md text-label-md text-on-surface-variant">Haber, şarkı sözü, e-posta… yapıştır, yapay zekâ seçsin</p>
        </div>
      </div>
      <textarea
        aria-label="İngilizce metin"
        lang="en"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste any English text here…"
        className="p-3 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary resize-y placeholder:text-outline"
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Seviyem</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Cefr)}
            className="bg-surface-container-low text-on-surface py-2.5 px-3 rounded-xl font-body-sm text-body-sm outline-none"
          >
            {(['A2', 'B1', 'B2', 'C1'] as Cefr[]).map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Deste</span>
          <select
            value={deckId}
            onChange={(e) => setDeckId(e.target.value)}
            className="bg-surface-container-low text-on-surface py-2.5 px-3 rounded-xl font-body-sm text-body-sm outline-none"
          >
            {DECKS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.emoji} {d.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={extract}
        disabled={loading || text.trim().split(/\s+/).length < 8}
        className="h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 disabled:opacity-40"
      >
        <Icon name={loading ? 'progress_activity' : 'auto_awesome'} size={20} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Kelimeler seçiliyor…' : 'Kelimeleri Çıkar'}
      </button>

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{items.length} kelime bulundu</span>
            <button
              type="button"
              onClick={() => setSelected(selected.length ? [] : items.filter((w) => !state.cards[w.id]).map((w) => w.id))}
              className="font-label-md text-label-md text-primary"
            >
              {selected.length ? 'Seçimi kaldır' : 'Tümünü seç'}
            </button>
          </div>
          {items.map((w) => {
            const inBox = state.cards[w.id];
            const on = selected.includes(w.id);
            return (
              <button
                key={w.id}
                type="button"
                disabled={!!inBox}
                onClick={() => setSelected((s) => (on ? s.filter((x) => x !== w.id) : [...s, w.id]))}
                className={cx(
                  'text-left p-3 rounded-xl flex items-start gap-3 transition-colors',
                  inBox ? 'bg-surface-container-low opacity-60' : on ? 'bg-primary-container/20 ring-1 ring-primary/50' : 'bg-surface-container-low',
                )}
              >
                <Icon
                  name={inBox ? 'inventory_2' : on ? 'check_box' : 'check_box_outline_blank'}
                  size={20}
                  fill={on}
                  className={cx('mt-0.5', inBox ? 'text-secondary' : on ? 'text-primary' : 'text-outline')}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span lang="en" className="font-label-lg text-label-lg text-on-surface">{w.word}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {POS_LABELS[w.pos].tr} • {w.cefr}
                    </span>
                    {words[w.id] && !w.custom && <span className="font-label-sm text-label-sm text-secondary">sözlükte var</span>}
                    {inBox && <span className="font-label-sm text-label-sm text-secondary">Kutu {inBox.box}’te</span>}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">{w.meaning}</p>
                  {w.examples[0] && (
                    <p lang="en" className="font-body-sm text-body-sm text-on-surface-variant italic truncate">
                      {w.examples[0].en}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          <button
            type="button"
            onClick={addSelected}
            disabled={!selected.length}
            className="h-12 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Icon name="library_add" size={20} /> {selected.length} kelimeyi kutuya ekle
          </button>
        </div>
      )}
    </section>
  );
}
