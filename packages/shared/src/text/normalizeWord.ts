/** Kelimeyi karşılaştırma için normalize eder: boşlukları ve kenar noktalamayı temizler, küçük harfe çevirir. */
export function normalizeWord(raw: string): string {
  // Bazı JS motorlarında (eski Hermes sürümleri) String.prototype.normalize bulunmayabilir.
  const composed = typeof raw.normalize === 'function' ? raw.normalize('NFC') : raw;
  return composed
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}
