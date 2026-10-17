import type { ReviewQuality } from '@proje-depom/shared';

export type KeyAction =
  | { type: 'flip' }
  | { type: 'review'; quality: ReviewQuality }
  | { type: 'speak' }
  | { type: 'none' };

/**
 * Web klavye kısayollarını eylemlere çevirir.
 *  - Space / Enter: kartı çevirir (çevrilmemişse)
 *  - 1, 2, 3, 4: Again, Hard, Good, Easy (yalnızca kart çevrilmişse)
 *  - R: telaffuzu yeniden oynatır
 */
export function mapKeyToAction(key: string, isFlipped: boolean): KeyAction {
  if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
    return isFlipped ? { type: 'none' } : { type: 'flip' };
  }

  if (key === 'r' || key === 'R') {
    return { type: 'speak' };
  }

  const digitQuality: Record<string, ReviewQuality> = { '1': 0, '2': 1, '3': 2, '4': 3 };
  const quality = digitQuality[key];
  if (quality !== undefined && isFlipped) {
    return { type: 'review', quality };
  }

  return { type: 'none' };
}
