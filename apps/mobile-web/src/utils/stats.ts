import type { StatsOverview } from '../types/api';

export interface TodayActivity {
  cardsReviewed: number;
  xpEarned: number;
}

/** Heatmap verisinden bugünün (UTC) etkinliğini çıkarır; kayıt yoksa sıfırlar. */
export function todayActivity(overview: StatsOverview | null, now: Date = new Date()): TodayActivity {
  const todayKey = now.toISOString().slice(0, 10);
  const today = overview?.heatmap.find((day) => day.date === todayKey);
  return {
    cardsReviewed: today?.cardsReviewed ?? 0,
    xpEarned: today?.xpEarned ?? 0,
  };
}
