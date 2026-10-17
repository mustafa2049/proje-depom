import {
  AGAIN_RETRY_MINUTES,
  calculateNextReview,
  DEFAULT_EASE_FACTOR,
  REVIEW_QUALITY,
  type ReviewQuality,
  type SrsSnapshot,
} from './srsAlgorithm';

export interface IntervalPreview {
  quality: ReviewQuality;
  /** Buton üzerinde gösterilecek süre etiketi, örn. "10 dk" veya "6 gün". */
  label: string;
  /** Kartın bu puanla tekrar sorulacağı an. */
  nextReviewDate: Date;
}

export const NEW_CARD_STATE: SrsSnapshot = {
  repetitions: 0,
  easeFactor: DEFAULT_EASE_FACTOR,
  interval: 0,
};

/** Süreyi kullanıcı dostu Türkçe etikete çevirir. */
export function formatIntervalLabel(quality: ReviewQuality, interval: number): string {
  if (quality === REVIEW_QUALITY.AGAIN) {
    return `${AGAIN_RETRY_MINUTES} dk`;
  }
  return `${interval} gün`;
}

/**
 * Dört değerlendirme butonunun her biri için bir sonraki tekrar etiketini hesaplar.
 * Saf fonksiyondur; kart durumu değişmez.
 */
export function previewNextIntervals(
  state: SrsSnapshot | null,
  now: Date = new Date(),
): IntervalPreview[] {
  const snapshot = state ?? NEW_CARD_STATE;
  const qualities: ReviewQuality[] = [
    REVIEW_QUALITY.AGAIN,
    REVIEW_QUALITY.HARD,
    REVIEW_QUALITY.GOOD,
    REVIEW_QUALITY.EASY,
  ];

  return qualities.map((quality) => {
    const result = calculateNextReview(snapshot, quality, now);
    return {
      quality,
      label: formatIntervalLabel(quality, result.interval),
      nextReviewDate: result.nextReviewDate,
    };
  });
}
