import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AiCardTools, type AiCardTab } from '../components/AiCardTools';
import { SubScreen } from '../components/Layout';
import { useToast } from '../components/Toast';
import { BoxStrip, cx, EmptyState, Highlight, Icon, SpeakButton } from '../components/ui';
import { getDeck } from '../data/decks';
import { POS_LABELS } from '../data/words';
import { aiAvailable } from '../lib/ai';
import { BOX_COLORS, dueLabel, nextBox, previewInterval } from '../lib/leitner';
import type { ReviewOutcome } from '../lib/types';
import { useStore } from '../store/AppStore';

export default function WordDetail() {
  const { id = '' } = useParams();
  const { state, dispatch, words } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const word = words[id];
  const card = state.cards[id];
  const [editingMnemonic, setEditingMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState(word?.mnemonic ?? '');
  const [aiTab, setAiTab] = useState<AiCardTab | null>(null);

  if (!word) {
    return (
      <SubScreen title="Kelime">
        <EmptyState icon="search_off" title="Kelime bulunamadı" text="Bu kelime silinmiş olabilir." action={<Link className="text-primary" to="/kutuphane">Kütüphaneye dön</Link>} />
      </SubScreen>
    );
  }

  const pos = POS_LABELS[word.pos];
  const knowBox = nextBox(card?.box ?? 0, 'know');

  const rate = (outcome: ReviewOutcome) => {
    const to = nextBox(card?.box ?? 0, outcome);
    const days = previewInterval(card, outcome, state.profile.smartIntervals);
    dispatch({ type: 'review', wordId: word.id, outcome });
    toast(outcome === 'forgot' ? 'Kutu 1’e taşındı' : `Kutu ${to}’e taşındı`, {
      description: outcome === 'forgot' ? 'Yarın tekrar sorulacak.' : `${days} gün sonra tekrar edilecek.`,
      tone: outcome === 'forgot' ? 'info' : 'success',
    });
  };

  return (
    <SubScreen title={word.word}>
      <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="inventory_2" size={16} className="text-tertiary" />
            <span className="font-label-md text-label-md text-on-surface-variant">Aralıklı Tekrar Durumu</span>
          </div>
          {card ? (
            <span className={cx('px-2.5 py-0.5 rounded-full font-label-sm text-label-sm tracking-wide uppercase font-bold', BOX_COLORS[card.box].soft, BOX_COLORS[card.box].text)}>
              Kutu {card.box} • {dueLabel(card)}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-outline font-label-sm text-label-sm uppercase font-bold">Henüz kutuda değil</span>
          )}
        </div>
        <BoxStrip active={card?.box ?? 0} />
        {card && (
          <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>{card.reviews} tekrar • {card.correct} doğru</span>
            <span>{card.lapses} kez unutuldu</span>
          </div>
        )}
      </div>

      <section className="w-full bg-surface-container rounded-xl p-space-lg flex flex-col gap-space-md shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between w-full">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm tracking-wider font-semibold">
            {pos.tr.toLocaleUpperCase('tr')} • {pos.en.toUpperCase()} • {word.cefr}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{getDeck(word.deckId)?.title}</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5 pt-1">
          <h2 lang="en" className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold uppercase break-words max-w-full">{word.word}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            {word.ipa && <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">{word.ipa}</span>}
            <SpeakButton
              text={word.word}
              label="Dinle"
              className="px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center gap-1 text-primary shadow-sm"
            />
          </div>
          <div className="w-full mt-3 p-3 rounded-lg bg-surface-container-high flex flex-col items-center justify-center">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-bold mb-0.5">Temel Anlamı</span>
            <p className="font-headline-md text-headline-md text-on-surface font-bold text-center">{word.meaning}</p>
          </div>
        </div>

        {word.examples.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Icon name="format_quote" size={14} /> Örnek Cümleler
            </span>
            {word.examples.map((ex) => (
              <div key={ex.en} className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                    “<Highlight text={ex.en} term={word.word} className="px-1 py-0.5 rounded bg-secondary-container/40 text-secondary font-semibold" />”
                  </p>
                  <SpeakButton text={ex.en} size={16} className="w-7 h-7 shrink-0 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary" />
                </div>
                {ex.tr && <p className="font-body-sm text-body-sm text-on-surface-variant">→ {ex.tr}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="p-3.5 rounded-lg bg-tertiary-container/15 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-tertiary-container/30 flex items-center justify-center flex-shrink-0 text-tertiary">
            <Icon name="lightbulb" size={18} fill />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-tertiary font-bold">Hafıza İpucu (Mnemonic)</span>
              <button type="button" className="font-label-sm text-label-sm text-tertiary" onClick={() => setEditingMnemonic((v) => !v)}>
                {editingMnemonic ? 'Vazgeç' : word.mnemonic ? 'Düzenle' : 'Ekle'}
              </button>
            </div>
            {editingMnemonic ? (
              <div className="flex flex-col gap-2">
                <textarea
                  rows={3}
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="Kelimeyi aklında tutmana yardım edecek bir çağrışım yaz…"
                  className="p-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-tertiary"
                />
                <button
                  type="button"
                  className="self-end px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md"
                  onClick={() => {
                    dispatch({ type: 'updateWord', word: { ...word, mnemonic: mnemonic.trim() || undefined } });
                    setEditingMnemonic(false);
                    toast('Hafıza ipucu kaydedildi');
                  }}
                >
                  Kaydet
                </button>
              </div>
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                {word.mnemonic ?? 'Henüz bir ipucu yok. Kendi çağrışımını eklemek hatırlamayı kolaylaştırır.'}
              </p>
            )}
          </div>
        </div>

        {(word.synonyms?.length || word.collocations?.length) && (
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Eş Anlamlılar</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{word.synonyms?.join(', ') || '—'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Kalıp Kullanımlar</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">{word.collocations?.join(', ') || '—'}</span>
            </div>
          </div>
        )}

        {word.etymology && (
          <div className="p-3 rounded-lg bg-surface-container-low flex items-start gap-2.5">
            <Icon name="history_edu" size={20} className="text-primary mt-0.5" />
            <p className="font-body-sm text-body-sm text-on-surface-variant">{word.etymology}</p>
          </div>
        )}
      </section>

      {aiAvailable() && (
        <section className="bg-surface-container rounded-xl p-3 flex flex-col gap-2.5">
          <span className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
            <Icon name="auto_awesome" size={18} className="text-tertiary" /> Yapay Zekâ ile Çalış
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAiTab('examples')}
              className="py-2.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5"
            >
              <Icon name="format_quote" size={16} className="text-primary" /> Yeni örnek cümleler
            </button>
            <button
              type="button"
              onClick={() => setAiTab('sentence')}
              className="py-2.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5"
            >
              <Icon name="edit_note" size={16} className="text-secondary" /> Kendi cümleni kur
            </button>
          </div>
          <AiCardTools word={word} open={aiTab !== null} onClose={() => setAiTab(null)} tab={aiTab ?? 'examples'} />
        </section>
      )}

      <div className="w-full flex flex-col gap-2 pt-1">
        <span className="font-label-sm text-label-sm text-center text-on-surface-variant uppercase tracking-wider font-semibold">Performans Değerlendirmeni Seç</span>
        <div className="grid grid-cols-3 gap-2.5 w-full">
          <button type="button" onClick={() => rate('forgot')} className="flex flex-col items-center justify-center min-h-[56px] py-2 px-1.5 rounded-xl bg-surface-container-high hover:bg-error-container/20 active:scale-95 transition-all shadow-md group">
            <div className="flex items-center gap-1 text-error mb-0.5">
              <Icon name="replay" size={18} />
              <span className="font-label-md text-label-md font-bold">Unuttum</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-error transition-colors">Kutu 1</span>
          </button>
          <button type="button" onClick={() => rate('easy')} className="flex flex-col items-center justify-center min-h-[56px] py-2 px-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest active:scale-95 transition-all shadow-md group">
            <div className="flex items-center gap-1 text-primary mb-0.5">
              <Icon name="bolt" size={18} />
              <span className="font-label-md text-label-md font-bold">Çok Kolay</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">Kutu 5 Arşiv</span>
          </button>
          <button type="button" onClick={() => rate('know')} className="flex flex-col items-center justify-center min-h-[56px] py-2 px-1.5 rounded-xl bg-surface-container-high hover:bg-secondary-container/20 active:scale-95 transition-all shadow-md group">
            <div className="flex items-center gap-1 text-secondary mb-0.5">
              <Icon name="check_circle" size={18} fill />
              <span className="font-label-md text-label-md font-bold">Biliyorum</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-secondary transition-colors">
              Kutu {knowBox} (+{previewInterval(card, 'know', state.profile.smartIntervals)} Gün)
            </span>
          </button>
        </div>
      </div>

      {word.custom && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`"${word.word}" kelimesi ve ilerlemesi silinsin mi?`)) {
              dispatch({ type: 'deleteWord', wordId: word.id });
              toast('Kelime silindi', { tone: 'info', icon: 'delete' });
              navigate('/kutuphane', { replace: true });
            }
          }}
          className="w-full py-3 rounded-xl text-error font-label-lg text-label-lg flex items-center justify-center gap-1.5 hover:bg-error-container/20"
        >
          <Icon name="delete" size={18} /> Kelimeyi Sil
        </button>
      )}
    </SubScreen>
  );
}
