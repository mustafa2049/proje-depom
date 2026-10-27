import { useMemo, useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { useToast } from '../../components/Toast';
import { BoxStrip, cx, Icon, shuffle } from '../../components/ui';
import { JOURNAL_PROMPTS } from '../../data/modules';
import { SEED_WORDS } from '../../data/words';
import { BOX_INTERVALS, clampBox, isDue, nextBox } from '../../lib/leitner';
import { splitByTerm } from '../../lib/text';
import { analyzeWriting } from '../../lib/writing';
import type { AppState, Word } from '../../lib/types';
import { useStore } from '../../store/AppStore';
import { streak } from '../../store/selectors';

const ADVANCED = new Set(SEED_WORDS.filter((w) => w.cefr === 'C1' || w.cefr === 'C2' || w.cefr === 'B2').map((w) => w.word.toLowerCase()));

function pickTargets(state: AppState, words: Record<string, Word>): string[] {
  const singles = (id: string) => words[id] && !words[id].word.includes(' ') && ['adjective', 'verb', 'noun', 'adverb'].includes(words[id].pos);
  const learning = Object.values(state.cards)
    .filter((c) => c.box <= 3 && singles(c.wordId))
    .sort((a, b) => Number(isDue(b)) - Number(isDue(a)) || a.box - b.box);
  const ids = shuffle(learning.slice(0, 8)).slice(0, 3).map((c) => c.wordId);
  if (ids.length < 3) {
    const extra = shuffle(SEED_WORDS.filter((w) => w.deckId === 'academic' && singles(w.id) && !ids.includes(w.id))).map((w) => w.id);
    ids.push(...extra.slice(0, 3 - ids.length));
  }
  return ids;
}

/** Metinde hedef kelimeleri vurgulayan önizleme. */
function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  let parts: { text: string; match: boolean }[] = [{ text, match: false }];
  for (const term of terms) {
    parts = parts.flatMap((p) => (p.match ? [p] : splitByTerm(p.text, term)));
  }
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-secondary-container/30 text-secondary font-semibold">
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

export default function Journal() {
  const { state, dispatch, words } = useStore();
  const toast = useToast();
  const [targets, setTargets] = useState(() => pickTargets(state, words));
  const [prompt, setPrompt] = useState(() => JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(true);
  const [saved, setSaved] = useState(false);
  const targetWords = useMemo(() => targets.map((id) => words[id]).filter(Boolean), [targets, words]);
  const analysis = useMemo(() => analyzeWriting(text, targetWords.map((w) => w.word), ADVANCED), [text, targetWords]);
  const allUsed = analysis.usedTargets.length === targetWords.length;
  const ready = allUsed && analysis.sentences >= 2;
  const minBox = Math.min(...targetWords.map((w) => state.cards[w.id]?.box ?? 1));
  const goal = nextBox(clampBox(minBox), 'know');

  const save = () => {
    if (!ready || saved) return;
    for (const w of targetWords) dispatch({ type: 'review', wordId: w.id, outcome: 'know' });
    dispatch({ type: 'saveJournal', entry: { id: String(Date.now()), createdAt: Date.now(), prompt, text, targetWordIds: targets } });
    dispatch({ type: 'addXp', amount: 35 });
    setSaved(true);
    toast('Günlüğe kaydedildi!', { description: '3 kelime bir üst kutuya taşındı • +35 XP' });
  };

  const restart = () => {
    setTargets(pickTargets(state, words));
    setText('');
    setSaved(false);
    setEditing(true);
  };

  return (
    <SubScreen title="3 Cümlelik Mikro Yazma">
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          <span className="font-label-md text-label-md text-secondary">Kelimeleri Üretime Dönüştür</span>
        </div>
        <div className="flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
          <Icon name="bolt" size={14} fill className="text-tertiary" />
          <span>Seri: {streak(state)} Gün</span>
        </div>
      </section>

      <section className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between text-on-surface-variant">
          <span className="font-label-sm text-label-sm uppercase tracking-wider">Günün 3 Zorunlu Kelimesi</span>
          <button type="button" disabled={saved} onClick={() => setTargets(pickTargets(state, words))} className="font-label-sm text-label-sm text-primary flex items-center gap-0.5 disabled:opacity-40">
            <Icon name="shuffle" size={14} /> Değiştir
          </button>
        </div>
        <div className="grid grid-cols-3 gap-space-xs">
          {targetWords.map((w) => {
            const used = analysis.usedTargets.includes(w.word);
            return (
              <div key={w.id} className={cx('flex flex-col p-space-sm rounded-xl shadow-sm transition-colors', used ? 'bg-secondary-container/15' : 'bg-surface-container')}>
                <div className="flex items-center justify-between mb-0.5 gap-1">
                  <span className="font-headline-sm text-[16px] text-on-surface font-semibold truncate">{w.word}</span>
                  <Icon name={used ? 'check_circle' : 'radio_button_unchecked'} size={18} fill={used} className={used ? 'text-secondary' : 'text-outline'} />
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{w.meaning}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-low shadow-sm">
        <div className="flex items-center justify-between mb-space-xs">
          <div className="flex items-center gap-space-xs text-primary">
            <Icon name="lightbulb" size={20} />
            <span className="font-label-md text-label-md tracking-wide uppercase">Yönlendirici Görev</span>
          </div>
          <button
            type="button"
            aria-label="Başka görev"
            onClick={() => setPrompt(JOURNAL_PROMPTS[(JOURNAL_PROMPTS.indexOf(prompt) + 1) % JOURNAL_PROMPTS.length])}
            className="text-on-surface-variant"
          >
            <Icon name="refresh" size={18} />
          </button>
        </div>
        <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">“{prompt}”</p>
      </section>

      <section className="flex flex-col rounded-xl bg-surface-container p-space-md shadow-md gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <Icon name="edit_note" size={18} className="text-on-surface-variant" />
            <span className="font-label-md text-label-md text-on-surface-variant">Canlı Metin Editörü</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className={cx('px-2 py-0.5 rounded-full bg-surface-container-highest font-label-sm text-label-sm', analysis.sentences >= 2 ? 'text-secondary' : 'text-on-surface-variant')}>
              {analysis.sentences} Cümle
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">{analysis.words} Kelime</span>
          </div>
        </div>
        {editing ? (
          <textarea
            aria-label="Günlük metni"
            value={text}
            disabled={saved}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={`Örn: At first, my team was ${targetWords[0]?.word ?? '…'} to adopt the new system…`}
            className="p-space-md rounded-lg bg-surface-container-lowest font-body-lg text-body-lg text-on-surface leading-relaxed min-h-[140px] outline-none focus:ring-1 focus:ring-primary resize-y placeholder:text-outline"
          />
        ) : (
          <div className="p-space-md rounded-lg bg-surface-container-lowest font-body-lg text-body-lg text-on-surface leading-relaxed min-h-[120px] whitespace-pre-wrap">
            <HighlightedText text={text} terms={targetWords.map((w) => w.word)} />
          </div>
        )}
        <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
          <div className="flex items-center gap-1">
            <Icon name={allUsed ? 'verified' : 'pending'} size={16} className={allUsed ? 'text-secondary' : 'text-tertiary'} />
            <span>{allUsed ? 'Hedef kelimelerin tamamı tespit edildi' : `${analysis.usedTargets.length}/${targetWords.length} hedef kelime kullanıldı`}</span>
          </div>
          <button type="button" onClick={() => setEditing((e) => !e)} className="text-primary hover:underline flex items-center gap-0.5">
            <span>{editing ? 'Önizle' : 'Düzenle'}</span>
            <Icon name={editing ? 'visibility' : 'edit'} size={14} />
          </button>
        </div>
      </section>

      {analysis.words >= 5 && (
        <section className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-high shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                <Icon name="psychology" size={18} />
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Akıllı Analiz</h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Kural tabanlı, cihaz içinde çalışır</p>
              </div>
            </div>
            <span className={cx('px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-semibold', analysis.issues.length ? 'bg-tertiary-container/30 text-tertiary' : 'bg-secondary-container/30 text-secondary')}>
              {analysis.issues.length ? `${analysis.issues.length} Öneri` : 'Optimum Akış'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
            <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-0.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Tahmini CEFR Seviyesi</span>
              <span className="font-headline-lg text-headline-lg text-primary font-bold">{analysis.level}</span>
              <span className="font-label-sm text-label-sm text-secondary">{analysis.levelNote}</span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-0.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Yazım & Doğallık</span>
              <span className="font-headline-lg text-headline-lg text-secondary font-bold">%{analysis.naturalness}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{analysis.issues.length} uyarı</span>
            </div>
          </div>
          {analysis.issues.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {analysis.issues.map((i) => (
                <div key={i.message} className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-lowest">
                  <Icon name={i.type === 'l1' ? 'translate' : 'spellcheck'} size={16} className={i.type === 'l1' ? 'text-error mt-0.5' : 'text-tertiary mt-0.5'} />
                  <span className="font-body-sm text-body-sm text-on-surface">{i.message}</span>
                </div>
              ))}
            </div>
          )}
          {analysis.suggestions.length > 0 && (
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <div className="flex items-center gap-1 text-tertiary">
                <Icon name="auto_awesome" size={18} fill />
                <span className="font-label-md text-label-md font-semibold">Üst Seviye Yükseltme Önerileri</span>
              </div>
              {analysis.suggestions.map((s) => (
                <div key={s.from} className="p-space-sm rounded-lg bg-surface-container-lowest flex flex-col gap-space-xs">
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                    <span className="line-through">{s.from}</span>
                    <span className="opacity-70 font-normal">• {s.note}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-primary font-body-md text-body-md font-medium">
                      <Icon name="arrow_forward" size={16} className="text-tertiary" />
                      <span>{s.to}</span>
                    </div>
                    <button
                      type="button"
                      disabled={saved}
                      onClick={() => setText((t) => t.replace(s.from, s.to))}
                      className="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm transition-colors"
                    >
                      Uygula
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="flex flex-col p-space-md rounded-xl bg-surface-container-low shadow-sm gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant">Leitner Durumu</span>
          <span className="font-label-sm text-label-sm text-secondary font-semibold">
            Kutu {minBox} → Kutu {goal} ({BOX_INTERVALS[goal]} Günlük Aralık)
          </span>
        </div>
        <BoxStrip active={goal} labels={false} />
      </section>

      <section className="flex flex-col gap-space-xs pt-space-xs">
        <button
          type="button"
          disabled={!ready && !saved}
          onClick={saved ? restart : save}
          className={cx(
            'w-full min-h-14 py-3 px-3 rounded-xl font-headline-sm text-[16px] font-semibold flex items-center justify-center gap-space-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-40',
            saved ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary',
          )}
        >
          <Icon name={saved ? 'edit_square' : 'bookmark_added'} size={22} />
          <span>{saved ? 'Yeni Günlük Yaz' : `Günlüğe Kaydet & 3 Kelimeyi Yükselt`}</span>
          {!saved && <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold">+35 XP</span>}
        </button>
        <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
          {ready || saved ? 'Bu çıktı kelimelerin bir sonraki tekrarını ileri öteler.' : 'Kaydetmek için 3 kelimenin tamamını en az 2 cümlede kullan.'}
        </p>
      </section>

      {state.journal.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Önceki Günlüklerin</h3>
          {state.journal.slice(0, 3).map((j) => (
            <div key={j.id} className="bg-surface-container rounded-xl p-space-md flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">{new Date(j.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
              <p className="font-body-sm text-body-sm text-on-surface">
                <HighlightedText text={j.text} terms={j.targetWordIds.map((id) => words[id]?.word).filter(Boolean)} />
              </p>
            </div>
          ))}
        </section>
      )}
    </SubScreen>
  );
}
