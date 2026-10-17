import type { PrismaClient } from '@prisma/client';

import { addUtcDays, startOfUtcDay, utcDateKey } from '../lib/dates';
import { NotFoundError } from '../lib/errors';

import { buildCardWhere } from './deckService';

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

export interface StatsOverview {
  streakCount: number;
  dailyGoalCards: number;
  lastStudyDate: Date | null;
  learnedCards: number;
  trackedCards: number;
  retentionRate: number | null;
  totalXp: number;
  srsBreakdown: SrsBreakdown;
  heatmap: DailyActivity[];
  weeklyTrend: {
    days: WeeklyDay[];
    totalXp: number;
    accuracyPercent: number | null;
  };
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
export function buildWeeklyTrend(daily: readonly DailyActivity[]): StatsOverview['weeklyTrend'] {
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

/**
 * Kullanıcı istatistikleri:
 *  - srsBreakdown: kullanıcının erişebildiği kartların durum dağılımı (new dahil).
 *  - retentionRate: son 30 günde doğru değerlendirme oranı (yüzde).
 *  - heatmap: son 90 günün günlük etkinliği ve yoğunluğu.
 *  - weeklyTrend: son 7 günün doğruluk ve XP özeti.
 */
export async function getStatsOverview(
  db: PrismaClient,
  userId: string,
  now: Date = new Date(),
): Promise<StatsOverview> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { streakCount: true, dailyGoalCards: true, lastStudyDate: true },
  });
  if (!user) {
    throw new NotFoundError('Kullanıcı bulunamadı');
  }

  const cardWhere = buildCardWhere(userId);
  const windowStart = addUtcDays(startOfUtcDay(now), -(HEATMAP_DAYS - 1));
  const retentionStart = addUtcDays(startOfUtcDay(now), -(RETENTION_DAYS - 1));

  const [visibleCards, statusGroups, sessions, retentionSessions, xpAggregate] = await Promise.all([
    db.card.count({ where: cardWhere }),
    db.userCardSRS.groupBy({
      by: ['status'],
      where: { userId, card: cardWhere },
      _count: { _all: true },
    }),
    db.studySession.findMany({
      where: { userId, date: { gte: windowStart } },
      select: { date: true, cardsReviewed: true, correctCount: true, durationSec: true, xpEarned: true },
    }),
    db.studySession.aggregate({
      where: { userId, date: { gte: retentionStart } },
      _sum: { cardsReviewed: true, correctCount: true },
    }),
    db.studySession.aggregate({ where: { userId }, _sum: { xpEarned: true } }),
  ]);

  const counts = new Map(statusGroups.map((group) => [group.status, group._count._all]));
  const tracked = [...counts.values()].reduce((sum, value) => sum + value, 0);
  const srsBreakdown: SrsBreakdown = {
    new: Math.max(0, visibleCards - tracked) + (counts.get('NEW') ?? 0),
    learning: counts.get('LEARNING') ?? 0,
    review: counts.get('REVIEW') ?? 0,
    relearning: counts.get('RELEARNING') ?? 0,
  };

  const reviewed = retentionSessions._sum.cardsReviewed ?? 0;
  const correct = retentionSessions._sum.correctCount ?? 0;
  const heatmap = buildDailySeries(sessions, windowStart, HEATMAP_DAYS);

  return {
    streakCount: user.streakCount,
    dailyGoalCards: user.dailyGoalCards,
    lastStudyDate: user.lastStudyDate,
    learnedCards: srsBreakdown.review,
    trackedCards: tracked,
    retentionRate: reviewed > 0 ? Math.round((correct / reviewed) * 1000) / 10 : null,
    totalXp: xpAggregate._sum.xpEarned ?? 0,
    srsBreakdown,
    heatmap,
    weeklyTrend: buildWeeklyTrend(heatmap),
  };
}
