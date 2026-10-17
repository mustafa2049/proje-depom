export interface TextToken {
  text: string;
  /** Kelime ise tıklanabilir; değilse boşluk veya noktalama. */
  isWord: boolean;
  /** Token'ın metin içindeki başlangıç konumu. */
  start: number;
}

const WORD_PATTERN = /([\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*)/u;

/**
 * Paragrafı kelime ve kelime-dışı (boşluk, noktalama) parçalarına böler.
 * "don't" ve "well-known" tek kelime olarak kalır; "hello," kelime ve virgül olarak ayrılır.
 */
export function tokenizeText(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  let offset = 0;
  text.split(WORD_PATTERN).forEach((part, index) => {
    if (part.length === 0) {
      return;
    }
    tokens.push({ text: part, isWord: index % 2 === 1, start: offset });
    offset += part.length;
  });
  return tokens;
}

/** Verilen konumu içeren cümleyi döner (noktalama işaretleriyle sonlanan parça). */
export function sentenceAt(text: string, position: number): string {
  const sentencePattern = /[^.!?]+[.!?]*/g;
  let match: RegExpExecArray | null;
  while ((match = sentencePattern.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (position >= start && position < end) {
      return match[0].trim();
    }
  }
  return text.trim();
}

/** Sözlük sorgusu için kelimeyi normalize eder (sunucudaki normalizeWord ile aynı kural). */
export function cleanWord(raw: string): string {
  return raw
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}
