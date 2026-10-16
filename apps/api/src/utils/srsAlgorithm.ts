/**
 * SM-2 (SuperMemo-2) aralıklı tekrar çekirdeği.
 *
 * Saf fonksiyonlar: veritabanı, ağ veya saat bağımlılığı yoktur.
 * Şimdiki zaman `now` parametresiyle dışarıdan verilir (test edilebilirlik).
 *
 * Kullanıcı değerlendirmesi (quality) → SM-2 ölçeği (0-5) eşlemesi:
 *   0 (Again) → 1 | 1 (Hard) → 3 | 2 (Good) → 4 | 3 (Easy) → 5
 */

export const REVIEW_QUALITY = {
  AGAIN: 0,
  HARD: 1,
  GOOD: 2,
  EASY: 3,
} as const;

export type ReviewQuality = (typeof REVIEW_QUALITY)[keyof typeof REVIEW_QUALITY];

export type Sm2Quality = 1 | 3 | 4 | 5;

export type SrsStatus = 'REVIEW' | 'RELEARNING';

export interface SrsSnapshot {
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export interface SrsResult extends SrsSnapshot {
  status: SrsStatus;
  nextReviewDate: Date;
}

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;

/** Aynı gün içinde (Again) yeniden sorulma gecikmesi, dakika cinsinden. */
export const AGAIN_RETRY_MINUTES = 10;

/** SM-2 ölçeğinde bu eşiğin altı "başarısız" sayılır. */
const PASS_THRESHOLD = 3;

const SM2_SCALE: Record<ReviewQuality, Sm2Quality> = {
  [REVIEW_QUALITY.AGAIN]: 1,
  [REVIEW_QUALITY.HARD]: 3,
  [REVIEW_QUALITY.GOOD]: 4,
  [REVIEW_QUALITY.EASY]: 5,
};

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

export function assertValidQuality(quality: number): asserts quality is ReviewQuality {
  if (!Number.isInteger(quality) || quality < REVIEW_QUALITY.AGAIN || quality > REVIEW_QUALITY.EASY) {
    throw new RangeError(`Geçersiz değerlendirme puanı: ${quality}. 0-3 arası tam sayı olmalı.`);
  }
}

function assertValidSnapshot(snapshot: SrsSnapshot): void {
  if (!Number.isInteger(snapshot.repetitions) || snapshot.repetitions < 0) {
    throw new RangeError(`repetitions negatif olamaz veya tam sayı değil: ${snapshot.repetitions}`);
  }
  if (!Number.isInteger(snapshot.interval) || snapshot.interval < 0) {
    throw new RangeError(`interval negatif olamaz veya tam sayı değil: ${snapshot.interval}`);
  }
  if (!Number.isFinite(snapshot.easeFactor) || snapshot.easeFactor < MIN_EASE_FACTOR) {
    throw new RangeError(`easeFactor en az ${MIN_EASE_FACTOR} ve sonlu olmalı: ${snapshot.easeFactor}`);
  }
}

/** Kullanıcı puanını (0-3) SM-2 ölçeğine (0-5) çevirir. */
export function mapQualityToSm2(quality: ReviewQuality): Sm2Quality {
  assertValidQuality(quality);
  return SM2_SCALE[quality];
}

/**
 * Ease Factor güncellemesi:
 *   EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), en az 1.3
 */
export function updateEaseFactor(easeFactor: number, sm2Quality: Sm2Quality): number {
  const distance = 5 - sm2Quality;
  const next = easeFactor + (0.1 - distance * (0.08 + distance * 0.02));
  return Math.max(MIN_EASE_FACTOR, next);
}

/** Verilen tarihin (UTC) gün başlangıcına `days` gün ekler. */
export function addDaysFromStartOfUtcDay(now: Date, days: number): Date {
  const startOfDay = Math.floor(now.getTime() / MS_PER_DAY) * MS_PER_DAY;
  return new Date(startOfDay + days * MS_PER_DAY);
}

/**
 * Bir kartın değerlendirilmesinden sonraki durumunu hesaplar.
 *
 * Kurallar:
 *  - Başarısız (Again): repetitions = 0, interval = 1, status = RELEARNING,
 *    tekrar aynı gün 10 dakika sonra sorulur.
 *  - Başarılı (Hard/Good/Easy):
 *      repetitions 0 → interval 1, repetitions 1 → interval 6,
 *      aksi halde interval = round(interval * EF'), repetitions += 1, status = REVIEW.
 *  - EF, interval hesabından ÖNCE güncellenir (SM-2 orijinal sıralaması).
 *  - nextReviewDate = bugünün (UTC) başlangıcı + interval gün.
 */
export function calculateNextReview(
  current: SrsSnapshot,
  quality: ReviewQuality,
  now: Date = new Date(),
): SrsResult {
  assertValidQuality(quality);
  assertValidSnapshot(current);

  const sm2Quality = mapQualityToSm2(quality);
  const easeFactor = updateEaseFactor(current.easeFactor, sm2Quality);

  if (sm2Quality < PASS_THRESHOLD) {
    return {
      repetitions: 0,
      easeFactor,
      interval: 1,
      status: 'RELEARNING',
      nextReviewDate: new Date(now.getTime() + AGAIN_RETRY_MINUTES * MS_PER_MINUTE),
    };
  }

  let interval: number;
  if (current.repetitions === 0) {
    interval = 1;
  } else if (current.repetitions === 1) {
    interval = 6;
  } else {
    interval = Math.round(current.interval * easeFactor);
  }

  return {
    repetitions: current.repetitions + 1,
    easeFactor,
    interval,
    status: 'REVIEW',
    nextReviewDate: addDaysFromStartOfUtcDay(now, interval),
  };
}
