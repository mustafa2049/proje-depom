import { addUtcDays, utcDateKey } from '../dates';

export const HEATMAP_DAYS = 90;
export const TREND_DAYS = 7;
export const RETENTION_DAYS = 30;

export type Intensity = 0 | 1 | 2 | 3 | 4;

export interface DailyActivity {
  date: string;
  cardsReviewed: number;
  correctCount: number;
  durationSec: number;
  xpEarned: number;
  intensity: Intensity;
}

export interface SrsBreakdown {
  new: number;
  learning: number;
  review: number;
  relearning: number;
}

export interface WeeklyDay {
  date: string;
  accuracyPercent: number | null;
  xpEarned: number;
  cardsReviewed: number;
}

export interface WeeklyTrend {
  days: WeeklyDay[];
  totalXp: number;
  accuracyPercent: number | null;
}

/**
 * Isı haritası yoğunluğu (0–4), incelenen kart sayısına göre:
 * 0 → yok, 1–5 → düşük, 6–15 → orta, 16–30 → yüksek, 31+ → çok yüksek.
 */
export function intensityFor(cardsReviewed: number): Intensity {
  if (cardsReviewed <= 0) return 0;
  if (cardsReviewed <= 5) return 1;
  if (cardsReviewed <= 15) return 2;
  if (cardsReviewed <= 30) return 3;
  return 4;
}

export interface SessionRow {
  date: Date;
  cardsReviewed: number;
  correctCount: number;
  durationSec: number;
  xpEarned: number;
}

/**
 * Verilen başlangıç gününden itibaren `days` günlük seriyi oluşturur; çalışılmayan günler sıfır döner.
 */
export function buildDailySeries(sessions: readonly SessionRow[], windowStart: Date, days: number): DailyActivity[] {
  const byDay = new Map<string, DailyActivity>();
  for (const session of sessions) {
    const key = utcDateKey(session.date);
    const entry = byDay.get(key) ?? {
      date: key,
      cardsReviewed: 0,
      correctCount: 0,
      durationSec: 0,
      xpEarned: 0,
      intensity: 0 as Intensity,
    };
    entry.cardsReviewed += session.cardsReviewed;
    entry.correctCount += session.correctCount;
    entry.durationSec += session.durationSec;
    entry.xpEarned += session.xpEarned;
    entry.intensity = intensityFor(entry.cardsReviewed);
    byDay.set(key, entry);
  }

  const series: DailyActivity[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const key = utcDateKey(addUtcDays(windowStart, offset));
    series.push(
      byDay.get(key) ?? { date: key, cardsReviewed: 0, correctCount: 0, durationSec: 0, xpEarned: 0, intensity: 0 },
    );
  }
  return series;
}

/** Son 7 günün doğruluk ve XP özeti. Hiç değerlendirme yapılmayan günün doğruluğu null'dır. */
export function buildWeeklyTrend(daily: readonly DailyActivity[]): WeeklyTrend {
  const days: WeeklyDay[] = daily.slice(-TREND_DAYS).map((day) => ({
    date: day.date,
    accuracyPercent: day.cardsReviewed > 0 ? Math.round((day.correctCount / day.cardsReviewed) * 1000) / 10 : null,
    xpEarned: day.xpEarned,
    cardsReviewed: day.cardsReviewed,
  }));

  const reviewed = days.reduce((sum, day) => sum + day.cardsReviewed, 0);
  const correct = daily.slice(-TREND_DAYS).reduce((sum, day) => sum + day.correctCount, 0);
  return {
    days,
    totalXp: days.reduce((sum, day) => sum + day.xpEarned, 0),
    accuracyPercent: reviewed > 0 ? Math.round((correct / reviewed) * 1000) / 10 : null,
  };
}

/** Doğru / toplam oranını tek ondalıklı yüzde olarak döner; hiç değerlendirme yoksa null. */
export function percentOrNull(correct: number, total: number): number | null {
  return total > 0 ? Math.round((correct / total) * 1000) / 10 : null;
}
