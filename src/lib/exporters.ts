import type { AppState, Word } from './types';

export function downloadFile(name: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Tüm ilerlemenin yeniden içe aktarılabilir JSON yedeği. */
export function exportBackup(state: AppState): void {
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(`lexilearn-yedek-${date}.json`, JSON.stringify(state, null, 2), 'application/json');
}

function tsvCell(text: string): string {
  return text.replace(/[\t\n\r]+/g, ' ').trim();
}

/**
 * Anki'nin "Metin dosyasından içe aktar" özelliğiyle uyumlu, sekmeyle ayrılmış dosya.
 * Sütunlar: Ön yüz, Arka yüz, Etiketler.
 */
export function exportAnki(state: AppState, words: Record<string, Word>): void {
  const lines = ['#separator:tab', '#html:true', '#columns:Front\tBack\tTags'];
  for (const card of Object.values(state.cards)) {
    const w = words[card.wordId];
    if (!w) continue;
    const front = `${w.word}${w.ipa ? `<br><small>${w.ipa}</small>` : ''}`;
    const ex = w.examples[0];
    const back = `${w.meaning}${ex ? `<br><i>${ex.en}</i>${ex.tr ? `<br>${ex.tr}` : ''}` : ''}`;
    lines.push([tsvCell(front), tsvCell(back), `lexilearn kutu${card.box} ${w.cefr}`].join('\t'));
  }
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(`lexilearn-anki-${date}.txt`, lines.join('\n'), 'text/tab-separated-values');
}
