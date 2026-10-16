import { describe, expect, it } from 'vitest';
import {
  AGAIN_RETRY_MINUTES,
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
  REVIEW_QUALITY,
  addDaysFromStartOfUtcDay,
  calculateNextReview,
  mapQualityToSm2,
  updateEaseFactor,
  type SrsSnapshot,
} from './srsAlgorithm';

const NOW = new Date('2026-10-16T10:00:00.000Z');
const FRESH: SrsSnapshot = {
  repetitions: 0,
  easeFactor: DEFAULT_EASE_FACTOR,
  interval: 0,
};

describe('mapQualityToSm2', () => {
  it('kullanıcı puanlarını SM-2 ölçeğine (0-5) eşler', () => {
    expect(mapQualityToSm2(REVIEW_QUALITY.AGAIN)).toBe(1);
    expect(mapQualityToSm2(REVIEW_QUALITY.HARD)).toBe(3);
    expect(mapQualityToSm2(REVIEW_QUALITY.GOOD)).toBe(4);
    expect(mapQualityToSm2(REVIEW_QUALITY.EASY)).toBe(5);
  });

  it('geçersiz puanlarda RangeError fırlatır', () => {
    expect(() => mapQualityToSm2(4 as never)).toThrow(RangeError);
    expect(() => mapQualityToSm2(-1 as never)).toThrow(RangeError);
    expect(() => mapQualityToSm2(1.5 as never)).toThrow(RangeError);
  });
});

describe('updateEaseFactor', () => {
  it('spec formülüne göre EF günceller', () => {
    // q=1 → 5-1=4: 0.1 - 4*(0.08 + 4*0.02) = -0.54
    expect(updateEaseFactor(2.5, 1)).toBeCloseTo(1.96, 10);
    // q=3 → 5-3=2: 0.1 - 2*(0.08 + 2*0.02) = -0.14
    expect(updateEaseFactor(2.5, 3)).toBeCloseTo(2.36, 10);
    // q=4 → 1: 0.1 - 1*(0.08 + 1*0.02) = 0
    expect(updateEaseFactor(2.5, 4)).toBeCloseTo(2.5, 10);
    // q=5 → 0: 0.1
    expect(updateEaseFactor(2.5, 5)).toBeCloseTo(2.6, 10);
  });

  it('EF değerini 1.3 altına düşürmez', () => {
    expect(updateEaseFactor(1.3, 1)).toBe(MIN_EASE_FACTOR);
    expect(updateEaseFactor(1.3, 3)).toBe(MIN_EASE_FACTOR);
  });
});

describe('calculateNextReview — Again (0)', () => {
  it('kartı sıfırlar, RELEARNING yapar ve aynı gün 10 dakika sonrasına koyar', () => {
    const result = calculateNextReview(
      { repetitions: 5, easeFactor: 2.5, interval: 40 },
      REVIEW_QUALITY.AGAIN,
      NOW,
    );

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.status).toBe('RELEARNING');
    expect(result.easeFactor).toBeCloseTo(1.96, 10);
    expect(result.nextReviewDate.getTime()).toBe(
      NOW.getTime() + AGAIN_RETRY_MINUTES * 60_000,
    );
  });

  it('EF 1.3 iken de minimum sınırın altına inmez', () => {
    const result = calculateNextReview(
      { repetitions: 2, easeFactor: 1.3, interval: 6 },
      REVIEW_QUALITY.AGAIN,
      NOW,
    );
    expect(result.easeFactor).toBe(MIN_EASE_FACTOR);
  });
});

describe('calculateNextReview — başarılı puanlar (Hard/Good/Easy)', () => {
  it('Hard: ilk tekrarda interval 1, EF düşer, status REVIEW', () => {
    const result = calculateNextReview(FRESH, REVIEW_QUALITY.HARD, NOW);

    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeCloseTo(2.36, 10);
    expect(result.status).toBe('REVIEW');
    expect(result.nextReviewDate.toISOString()).toBe('2026-10-17T00:00:00.000Z');
  });

  it('Good: 1 → 6 → 15 → 38 gün aralık dizisi (EF 2.5 sabit)', () => {
    let state: SrsSnapshot = FRESH;
    const intervals: number[] = [];

    for (let i = 0; i < 4; i += 1) {
      const result = calculateNextReview(state, REVIEW_QUALITY.GOOD, NOW);
      intervals.push(result.interval);
      state = {
        repetitions: result.repetitions,
        easeFactor: result.easeFactor,
        interval: result.interval,
      };
    }

    // round(6*2.5)=15, round(15*2.5)=round(37.5)=38
    expect(intervals).toEqual([1, 6, 15, 38]);
    expect(state.easeFactor).toBeCloseTo(2.5, 10);
    expect(state.repetitions).toBe(4);
  });

  it('Easy: EF her seferinde 0.1 yükselir ve aralığı agresif büyütür', () => {
    let state: SrsSnapshot = FRESH;
    const intervals: number[] = [];
    const efs: number[] = [];

    for (let i = 0; i < 3; i += 1) {
      const result = calculateNextReview(state, REVIEW_QUALITY.EASY, NOW);
      intervals.push(result.interval);
      efs.push(result.easeFactor);
      state = {
        repetitions: result.repetitions,
        easeFactor: result.easeFactor,
        interval: result.interval,
      };
    }

    expect(efs[0]).toBeCloseTo(2.6, 10);
    expect(efs[1]).toBeCloseTo(2.7, 10);
    expect(efs[2]).toBeCloseTo(2.8, 10);
    // Easy ile 2. tekrarda interval 6, 3. tekrarda round(6*2.8)=17
    expect(intervals).toEqual([1, 6, 17]);
  });

  it('uzun aralıklarda interval, güncellenmiş EF ile çarpılır', () => {
    const result = calculateNextReview(
      { repetitions: 5, easeFactor: 2.5, interval: 100 },
      REVIEW_QUALITY.GOOD,
      NOW,
    );
    expect(result.repetitions).toBe(6);
    expect(result.interval).toBe(250);
    expect(result.status).toBe('REVIEW');
  });

  it('Hard, uzun aralıkta Good\'dan daha kısa aralık üretir', () => {
    const snapshot: SrsSnapshot = { repetitions: 4, easeFactor: 2.5, interval: 30 };
    const hard = calculateNextReview(snapshot, REVIEW_QUALITY.HARD, NOW);
    const good = calculateNextReview(snapshot, REVIEW_QUALITY.GOOD, NOW);
    expect(hard.interval).toBeLessThan(good.interval);
  });
});

describe('calculateNextReview — doğrulama', () => {
  it('geçersiz puanda RangeError fırlatır', () => {
    expect(() => calculateNextReview(FRESH, 7 as never, NOW)).toThrow(RangeError);
  });

  it('negatif repetitions değerinde RangeError fırlatır', () => {
    expect(() =>
      calculateNextReview({ ...FRESH, repetitions: -1 }, REVIEW_QUALITY.GOOD, NOW),
    ).toThrow(RangeError);
  });

  it('minimumun altındaki EF değerinde RangeError fırlatır', () => {
    expect(() =>
      calculateNextReview({ ...FRESH, easeFactor: 1.1 }, REVIEW_QUALITY.GOOD, NOW),
    ).toThrow(RangeError);
  });

  it('sonlu olmayan EF değerinde RangeError fırlatır', () => {
    expect(() =>
      calculateNextReview({ ...FRESH, easeFactor: Number.NaN }, REVIEW_QUALITY.GOOD, NOW),
    ).toThrow(RangeError);
  });
});

describe('addDaysFromStartOfUtcDay', () => {
  it('gün sınırında (23:59 UTC) bile bir sonraki günün başlangıcına yuvarlar', () => {
    const lateNight = new Date('2026-10-16T23:59:59.000Z');
    expect(addDaysFromStartOfUtcDay(lateNight, 1).toISOString()).toBe(
      '2026-10-17T00:00:00.000Z',
    );
    expect(addDaysFromStartOfUtcDay(lateNight, 0).toISOString()).toBe(
      '2026-10-16T00:00:00.000Z',
    );
  });
});
