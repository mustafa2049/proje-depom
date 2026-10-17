export interface Chip {
  id: string;
  word: string;
}

/** Kelime sıralama: yerleştirilen kelimeler birleşik cümleyle karşılaştırılır (büyük-küçük harf ve boşluk duyarlı). */
export function buildSentence(placed: readonly string[]): string {
  return placed.join(' ');
}

export function checkWordOrder(placed: readonly string[], answer: string): boolean {
  return buildSentence(placed) === answer.trim();
}

/** Bankadaki (henüz yerleştirilmemiş) kelime listesinden belirtilen dizindeki kelimeyi çıkarır ve yerleştirilenlere ekler. */
export function placeWord(
  bank: readonly Chip[],
  placed: readonly Chip[],
  id: string,
): { bank: Chip[]; placed: Chip[] } {
  const item = bank.find((chip) => chip.id === id);
  if (!item) {
    return { bank: [...bank], placed: [...placed] };
  }
  return {
    bank: bank.filter((chip) => chip.id !== id),
    placed: [...placed, item],
  };
}

/** Yerleştirilmiş bir kelimeyi geri alır (bankanın sonuna eklenir). */
export function returnWord(
  bank: readonly Chip[],
  placed: readonly Chip[],
  id: string,
): { bank: Chip[]; placed: Chip[] } {
  const item = placed.find((chip) => chip.id === id);
  if (!item) {
    return { bank: [...bank], placed: [...placed] };
  }
  return {
    bank: [...bank, item],
    placed: placed.filter((chip) => chip.id !== id),
  };
}

/** Kelime listesini kimliklerle birlikte oluşturur (aynı kelime birden fazla kez olabilir). */
export function toChips(words: readonly string[]): Chip[] {
  return words.map((word, index) => ({ id: `${index}-${word}`, word }));
}
