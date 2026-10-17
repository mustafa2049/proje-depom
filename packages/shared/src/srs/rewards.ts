import { REVIEW_QUALITY, type ReviewQuality } from './srsAlgorithm';

/** Değerlendirmeye göre kazanılan XP. İstemci (çevrimdışı tahmin) ve API aynı tabloyu kullanır. */
export const XP_BY_QUALITY: Record<ReviewQuality, number> = {
  [REVIEW_QUALITY.AGAIN]: 1,
  [REVIEW_QUALITY.HARD]: 5,
  [REVIEW_QUALITY.GOOD]: 10,
  [REVIEW_QUALITY.EASY]: 12,
};

/** Bir değerlendirmeyi "doğru" saymak için en düşük puan (Good ve üstü). */
export const CORRECT_THRESHOLD: ReviewQuality = REVIEW_QUALITY.GOOD;
