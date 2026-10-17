import { describe, expect, it } from 'vitest';

import { formatIntervalLabel, previewNextIntervals } from './preview';
import { REVIEW_QUALITY, type SrsSnapshot } from './srsAlgorithm';

const NOW = new Date('2026-10-16T10:00:00.000Z');

describe('previewNextIntervals', () => {
  it('yeni kart için dört buton etiketini üretir (10 dk, 1 gün, 1 gün, 1 gün)', () => {
    const previews = previewNextIntervals(null, NOW);

    expect(previews.map((item) => item.quality)).toEqual([0, 1, 2, 3]);
    expect(previews.map((item) => item.label)).toEqual(['10 dk', '1 gün', '1 gün', '1 gün']);
  });

  it('olgun bir kartta Good ve Easy süreleri SM-2 ile hesaplanır', () => {
    const mature: SrsSnapshot = { repetitions: 3, easeFactor: 2.5, interval: 15 };
    const labels = previewNextIntervals(mature, NOW).map((item) => item.label);

    // Again: 10 dk | Hard: max(16, round(18)) = 18 | Good: round(15*2.5)=38 | Easy: EF 2.6 → round(15*2.6)=39
    expect(labels).toEqual(['10 dk', '18 gün', '38 gün', '39 gün']);
  });

  it('Again önizlemesi her zaman 10 dakikadır ve tarih şimdiye yakındır', () => {
    const [again] = previewNextIntervals({ repetitions: 5, easeFactor: 2.5, interval: 60 }, NOW);

    expect(again?.label).toBe('10 dk');
    expect(again?.nextReviewDate.getTime()).toBe(NOW.getTime() + 10 * 60_000);
  });

  it('önizleme durumu değiştirmez ve aynı girdi için aynı sonucu verir', () => {
    const state: SrsSnapshot = { repetitions: 2, easeFactor: 2.3, interval: 6 };
    const frozen = JSON.stringify(state);

    const first = previewNextIntervals(state, NOW);
    const second = previewNextIntervals(state, NOW);

    expect(JSON.stringify(state)).toBe(frozen);
    expect(first).toEqual(second);
  });
});

describe('formatIntervalLabel', () => {
  it('Again için dakika, diğerleri için gün etiketi üretir', () => {
    expect(formatIntervalLabel(REVIEW_QUALITY.AGAIN, 1)).toBe('10 dk');
    expect(formatIntervalLabel(REVIEW_QUALITY.HARD, 3)).toBe('3 gün');
  });
});
