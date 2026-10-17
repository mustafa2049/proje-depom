import { describe, expect, it } from 'vitest';

import { buildDailySeries, buildWeeklyTrend, intensityFor, type SessionRow } from './statsService';

describe('intensityFor', () => {
  it('incelenen kart sayısına göre 0–4 yoğunluk üretir', () => {
    expect(intensityFor(0)).toBe(0);
    expect(intensityFor(1)).toBe(1);
    expect(intensityFor(5)).toBe(1);
    expect(intensityFor(6)).toBe(2);
    expect(intensityFor(15)).toBe(2);
    expect(intensityFor(16)).toBe(3);
    expect(intensityFor(30)).toBe(3);
    expect(intensityFor(31)).toBe(4);
    expect(intensityFor(500)).toBe(4);
  });
});

describe('buildDailySeries', () => {
  const start = new Date('2026-10-01T00:00:00.000Z');

  it('istenen gün sayısı kadar satır üretir, çalışılmayan günler sıfırdır', () => {
    const series = buildDailySeries([], start, 90);
    expect(series).toHaveLength(90);
    expect(series.every((day) => day.cardsReviewed === 0 && day.intensity === 0)).toBe(true);
    expect(series[0]?.date).toBe('2026-10-01');
    expect(series[89]?.date).toBe('2026-12-29');
  });

  it('aynı güne ait oturumları toplar ve yoğunluğu toplam kart sayısına göre hesaplar', () => {
    const sessions: SessionRow[] = [
      { date: new Date('2026-10-03T09:00:00.000Z'), cardsReviewed: 4, correctCount: 3, durationSec: 120, xpEarned: 30 },
      { date: new Date('2026-10-03T18:00:00.000Z'), cardsReviewed: 4, correctCount: 2, durationSec: 60, xpEarned: 20 },
    ];
    const series = buildDailySeries(sessions, start, 5);
    const day = series.find((item) => item.date === '2026-10-03');

    expect(day).toMatchObject({ cardsReviewed: 8, correctCount: 5, durationSec: 180, xpEarned: 50, intensity: 2 });
  });
});

describe('buildWeeklyTrend', () => {
  it('son 7 günün doğruluk ve XP özetini çıkarır; değerlendirme yoksa doğruluk null olur', () => {
    const daily = buildDailySeries(
      [{ date: new Date('2026-10-10T10:00:00.000Z'), cardsReviewed: 10, correctCount: 7, durationSec: 0, xpEarned: 80 }],
      new Date('2026-10-01T00:00:00.000Z'),
      10,
    );
    const trend = buildWeeklyTrend(daily);

    expect(trend.days).toHaveLength(7);
    expect(trend.days.find((day) => day.date === '2026-10-10')).toMatchObject({ accuracyPercent: 70, xpEarned: 80 });
    expect(trend.totalXp).toBe(80);
    expect(trend.accuracyPercent).toBe(70);
  });

  it('hiç değerlendirme yoksa genel doğruluk null döner', () => {
    const trend = buildWeeklyTrend(buildDailySeries([], new Date('2026-10-01T00:00:00.000Z'), 10));
    expect(trend.accuracyPercent).toBeNull();
    expect(trend.days.every((day) => day.accuracyPercent === null)).toBe(true);
  });
});
