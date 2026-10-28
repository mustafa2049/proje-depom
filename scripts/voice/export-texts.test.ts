/**
 * Uygulamada okunan sabit İngilizce metinleri ses üretimi için dışa aktarır (bkz. README.md).
 * Yalnızca VOICE_EXPORT ortam değişkeni verilince çalışır:
 *   VOICE_EXPORT=/tmp/texts.json npx vitest run scripts/voice/export-texts.test.ts
 */
import { writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { CONFUSABLES } from '../../src/data/confusables';
import { COLLOCATIONS, FAMILIES, REGISTERS, SCENES, STORIES, VISUAL_SCENES } from '../../src/data/modules';
import { SEED_WORDS } from '../../src/data/words';
import { voiceKey } from '../../src/lib/voice';

interface SpokenText {
  key: string;
  text: string;
  /** word: tek başına okunan kelime/kalıp (sonuna nokta eklenir); sentence: cümle */
  kind: 'word' | 'sentence';
  /** Eş yazımlı kelimelerde doğru okunuşu seçmek için sözlükteki tür */
  pos?: string;
  /** Kaynak; story/scene metinleri için kelime zamanları saklanır */
  src: string;
}

const out = process.env.VOICE_EXPORT;

it.runIf(Boolean(out))('konuşulan metinleri dışa aktar', () => {
  const items: SpokenText[] = [];
  const add = (text: string, kind: SpokenText['kind'], src: string, pos?: string) => {
    if (text.trim()) items.push({ key: voiceKey(text), text, kind, src, pos });
  };
  for (const w of SEED_WORDS) {
    add(w.word, 'word', `word:${w.id}`, w.pos);
    for (const e of w.examples) add(e.en, 'sentence', `example:${w.id}`);
  }
  // StoryReader'daki parseParagraph ile aynı düz metin
  for (const s of STORIES) for (const p of s.paragraphs) add(p.en.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, id: string, surface?: string) => surface ?? id), 'sentence', `story:${s.id}`);
  for (const sc of SCENES) {
    add(sc.en, 'sentence', `scene:${sc.id}`);
    for (const g of Object.values(sc.glossary ?? {})) add(g.word, 'word', `sceneword:${sc.id}`, g.pos);
  }
  for (const r of REGISTERS) for (const st of r.stages) add(st.quote.replace(/\[\[|\]\]/g, ''), 'sentence', `register:${r.id}`);
  const valid = (kind: string) => kind !== 'trap' && kind !== 'weak';
  for (const c of COLLOCATIONS) {
    add(c.noun, 'word', `colloc:${c.id}`);
    for (const v of c.verbs) if (valid(v.kind)) for (const m of c.modifiers) if (valid(m.kind)) add(`${v.text} ${m.text} ${c.noun}`, 'word', `chunk:${c.id}`);
  }
  for (const v of VISUAL_SCENES)
    for (const h of v.hotspots) {
      add(h.name.toLowerCase(), 'word', `visual:${h.id}`);
      add(h.example, 'sentence', `visualex:${h.id}`);
    }
  for (const f of FAMILIES) for (const n of f.nodes) add(n.word, 'word', `family:${f.id}`, n.pos);
  for (const c of CONFUSABLES) for (const s of c.sides) add(s.word, 'word', `confusable:${c.id}`);
  // Ayarlardaki telaffuz hızı örneği
  add('pronunciation', 'word', 'profile');
  writeFileSync(out!, JSON.stringify(items));
  console.log(`${items.length} metin → ${out}`);
});
