export interface TextSegment {
  text: string;
  highlighted: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Örnek cümlede hedef kelime/kalıbı (büyük-küçük harf duyarsız) vurgulanacak parçalara ayırır.
 * Kelime bulunmazsa tek parça döner.
 */
export function splitHighlight(text: string, term: string): TextSegment[] {
  const needle = term.trim();
  if (!needle) {
    return [{ text, highlighted: false }];
  }

  const pattern = new RegExp(`(${escapeRegExp(needle)})`, 'gi');
  return text
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, highlighted: part.toLowerCase() === needle.toLowerCase() }));
}
