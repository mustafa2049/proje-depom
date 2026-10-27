import { useState } from 'react';
import { SubScreen } from '../../components/Layout';
import { BoxStrip, cx, Highlight, Icon, SpeakButton } from '../../components/ui';
import { FAMILIES, type FamilyNode } from '../../data/modules';
import { POS_LABELS } from '../../data/words';
import { BOX_COLORS, dueLabel } from '../../lib/leitner';
import { useStore } from '../../store/AppStore';
import { glossaryToWord, useAddToBox } from '../../store/useAddToBox';

const ROLE_COLORS = {
  tertiary: { text: 'text-tertiary-fixed-dim', stop: '#ffb95f' },
  secondary: { text: 'text-secondary', stop: '#4edea3' },
  error: { text: 'text-error', stop: '#ffb4ab' },
  primary: { text: 'text-primary', stop: '#c0c1ff' },
};

// Düğüm konumları: sol üst, sağ üst, sol alt, sağ alt
const POSITIONS = ['top-4 left-3', 'top-4 right-3', 'bottom-4 left-3', 'bottom-4 right-3'];
const PATHS = [
  'M 50 50 C 36 50, 28 32, 22 22',
  'M 50 50 C 64 50, 72 32, 78 22',
  'M 50 50 C 36 50, 28 68, 22 78',
  'M 50 50 C 64 50, 72 68, 78 78',
];

export default function WordFamily() {
  const { state, words } = useStore();
  const addToBox = useAddToBox();
  const [familyIndex, setFamilyIndex] = useState(0);
  const family = FAMILIES[familyIndex];
  const [selectedIdx, setSelectedIdx] = useState(1);
  const node: FamilyNode = family.nodes[selectedIdx];
  const nodeWord = words[node.id] ?? glossaryToWord(node, node.id);
  const card = state.cards[node.id];
  const centerCard = state.cards[family.center.id];

  return (
    <SubScreen title="Kelime Kökü & Aile Ağacı">
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar -mx-margin px-margin">
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md flex items-center gap-1 shadow-sm">
            <Icon name="account_tree" size={14} />
            Kök: {family.root}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md whitespace-nowrap">{family.rootParts}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {FAMILIES.map((f, i) => (
          <button
            key={f.id}
            lang="en"
            type="button"
            onClick={() => {
              setFamilyIndex(i);
              setSelectedIdx(1);
            }}
            className={cx('px-3 py-1.5 rounded-full font-label-md text-label-md uppercase', i === familyIndex ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant')}
          >
            {f.center.word}
          </button>
        ))}
      </div>

      <div className="relative w-full h-[370px] bg-surface-container-low rounded-xl overflow-hidden p-3 shadow-md flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            {family.nodes.map((n, i) => (
              <linearGradient key={n.id} id={`grad-${i}`} x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#8083ff" stopOpacity={i === selectedIdx ? 0.9 : 0.4} />
                <stop offset="100%" stopColor={ROLE_COLORS[n.roleColor].stop} stopOpacity={i === selectedIdx ? 0.9 : 0.4} />
              </linearGradient>
            ))}
          </defs>
          {PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={`url(#grad-${i})`}
              strokeDasharray={i === selectedIdx ? undefined : '4 4'}
              strokeWidth={i === selectedIdx ? 2.5 : 1.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="relative z-10 flex flex-col items-center bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl text-center max-w-[170px]">
          <div className="flex items-center gap-1 mb-1">
            <Icon name="hub" size={14} />
            <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-80">Kök Çekirdek</span>
          </div>
          <p lang="en" className="font-headline-sm text-headline-sm font-bold tracking-tight uppercase">{family.center.word}</p>
          <span className="font-label-md text-label-md opacity-90 mt-0.5">{family.center.ipa}</span>
          <div className="mt-1.5 px-2 py-0.5 rounded-full bg-surface-container-lowest text-primary-fixed font-label-sm text-label-sm">
            {POS_LABELS[family.center.pos].tr} • {family.center.meaning}
          </div>
          {!centerCard && (
            <button type="button" onClick={() => addToBox(words[family.center.id] ?? glossaryToWord(family.center, family.center.id))} className="mt-1.5 font-label-sm text-label-sm underline opacity-90">
              + Kutu 1’e ekle
            </button>
          )}
        </div>
        {family.nodes.map((n, i) => {
          const c = state.cards[n.id];
          const sel = i === selectedIdx;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelectedIdx(i)}
              className={cx(
                'absolute z-10 flex flex-col items-start p-2.5 rounded-lg text-left w-[42%] max-w-[150px] transition-all active:scale-95',
                POSITIONS[i],
                sel ? 'bg-surface-container-highest shadow-md shadow-secondary/10 ring-1 ring-secondary/30' : 'bg-surface-container-high hover:bg-surface-variant shadow-sm',
              )}
            >
              <div className="flex items-center justify-between w-full mb-1 gap-1">
                <span className={cx('font-label-sm text-label-sm flex items-center gap-1', ROLE_COLORS[n.roleColor].text, sel && 'font-bold')}>
                  {sel && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                  {n.role}
                </span>
                <span className={cx('px-1.5 rounded-full font-label-sm text-[9px]', c ? cx(BOX_COLORS[c.box].soft, BOX_COLORS[c.box].text) : 'bg-surface-container text-on-surface-variant')}>
                  {c ? `Kutu ${c.box}` : 'Yeni'}
                </span>
              </div>
              <p className={cx('font-label-lg text-label-lg text-on-surface truncate w-full capitalize', sel ? 'font-bold' : 'font-semibold')}>{n.word}</p>
              <span className={cx('font-label-sm text-label-sm truncate w-full font-normal', sel ? 'text-secondary' : 'text-on-surface-variant')}>{n.meaning}</span>
            </button>
          );
        })}
      </div>

      <section className="bg-surface-container rounded-xl p-4 shadow-lg flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface capitalize">{node.word}</h2>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                {node.role} • {POS_LABELS[node.pos].en}
              </span>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant mt-0.5">
              {node.ipa} • ‘{node.meaning}’
            </p>
          </div>
          <SpeakButton text={node.word} size={22} className="w-11 h-11 shrink-0 rounded-full bg-surface-container-highest hover:bg-primary-container text-primary hover:text-on-primary-container flex items-center justify-center shadow-sm" />
        </div>

        <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Leitner Hafıza Kademesi</span>
            <span className={cx('font-label-sm text-label-sm font-semibold', card ? BOX_COLORS[card.box].text : 'text-outline')}>
              {card ? `Kademe ${card.box} / 5 (${dueLabel(card)})` : 'Henüz eklenmedi'}
            </span>
          </div>
          <BoxStrip active={card?.box ?? 0} labels={false} />
        </div>

        {node.example && (
          <div className="bg-surface-container-high rounded-lg p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-primary">
              <Icon name="format_quote" size={16} />
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Örnek Bağlam</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-snug">
              “<Highlight text={node.example.en} term={node.word} className="text-secondary font-semibold" />”
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug italic">“{node.example.tr}”</p>
          </div>
        )}

        {node.collocations && (
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Sık Kullanılan Kolokasyonlar</span>
            <div className="flex flex-wrap gap-1.5">
              {node.collocations.map((c) => (
                <span key={c} className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            disabled={!!card}
            onClick={() => addToBox(nodeWord)}
            className={cx(
              'w-full h-[52px] rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md',
              card ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary',
            )}
          >
            <Icon name={card ? 'task_alt' : 'add_circle'} size={20} />
            <span>{card ? `✓ Kutu ${card.box}’te Kayıtlı` : '+ Bu Türevi Kutu 1’e Ekle'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedIdx((i) => (i + 1) % 4)}
            className="w-full h-[48px] bg-surface-container-highest text-on-surface hover:text-primary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Icon name="explore" size={18} />
            <span>Sonraki Dalı Keşfet ({selectedIdx + 1}/4)</span>
          </button>
        </div>
      </section>

      <div className="bg-surface-container-low rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
          <Icon name="lightbulb" size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="font-label-md text-label-md font-semibold text-on-surface">{family.insightTitle}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{family.insight}</p>
        </div>
      </div>
    </SubScreen>
  );
}
