import type { PrismaClient } from '@prisma/client';
import {
  addUtcDays,
  buildDailySeries,
  buildWeeklyTrend,
  HEATMAP_DAYS,
  RETENTION_DAYS,
  startOfUtcDay,
  type DailyActivity,
  type SrsBreakdown,
  type WeeklyTrend,
} from '@proje-depom/shared';

import { NotFoundError } from '../lib/errors';

import { buildCardWhere } from './deckService';

export {
  buildDailySeries,
  buildWeeklyTrend,
  HEATMAP_DAYS,
  intensityFor,
  RETENTION_DAYS,
  TREND_DAYS,
  type DailyActivity,
  type Intensity,
  type SessionRow,
  type SrsBreakdown,
  type WeeklyDay,
} from '@proje-depom/shared';

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
  weeklyTrend: WeeklyTrend;
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
