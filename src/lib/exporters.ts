import { backupJson, saveFile } from './backup';
import { dayKey } from './leitner';
import type { AppState, Word } from './types';

/** Tüm ilerlemenin yeniden içe aktarılabilir JSON yedeği. Dönüş: kaydedildiği yerin açıklaması. */
export function exportBackup(state: AppState): Promise<string> {
  return saveFile(`lexilearn-yedek-${dayKey()}.json`, backupJson(state), 'application/json');
}

function tsvCell(text: string): string {
  return text.replace(/[\t\n\r]+/g, ' ').trim();
}

/**
 * Anki'nin "Metin dosyasından içe aktar" özelliğiyle uyumlu, sekmeyle ayrılmış dosya.
 * Sütunlar: Ön yüz, Arka yüz, Etiketler.
 */
export function exportAnki(state: AppState, words: Record<string, Word>): Promise<string> {
  const lines = ['#separator:tab', '#html:true', '#columns:Front\tBack\tTags'];
  for (const card of Object.values(state.cards)) {
    const w = words[card.wordId];
    if (!w) continue;
    const front = `${w.word}${w.ipa ? `<br><small>${w.ipa}</small>` : ''}`;
    const ex = w.examples[0];
    const back = `${w.meaning}${ex ? `<br><i>${ex.en}</i>${ex.tr ? `<br>${ex.tr}` : ''}` : ''}`;
    lines.push([tsvCell(front), tsvCell(back), `lexilearn kutu${card.box} ${w.cefr}`].join('\t'));
  }
  return saveFile(`lexilearn-anki-${dayKey()}.txt`, lines.join('\n'), 'text/plain');
}
