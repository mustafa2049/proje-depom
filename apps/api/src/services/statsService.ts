import type { PrismaClient } from '@prisma/client';

import { addUtcDays, startOfUtcDay, utcDateKey } from '../lib/dates';
import { NotFoundError } from '../lib/errors';

export const HEATMAP_DAYS = 30;

export interface DailyActivity {
  date: string;
  cardsReviewed: number;
  correctCount: number;
  durationSec: number;
  xpEarned: number;
}

export interface StatsOverview {
  streakCount: number;
  dailyGoalCards: number;
  lastStudyDate: Date | null;
  learnedCards: number;
  trackedCards: number;
  retentionRate: number | null;
  totalXp: number;
  heatmap: DailyActivity[];
}

/**
 * Kullanıcı istatistikleri:
 *  - learnedCards: REVIEW durumundaki kart sayısı.
 *  - retentionRate: son 30 günde doğru değerlendirme oranı (correctCount / cardsReviewed), yüzde olarak.
 *  - heatmap: son 30 günün günlük etkinliği (gün yoksa sıfır değerli satır).
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

  const windowStart = addUtcDays(startOfUtcDay(now), -(HEATMAP_DAYS - 1));

  const [learnedCards, trackedCards, sessions, xpAggregate] = await Promise.all([
    db.userCardSRS.count({ where: { userId, status: 'REVIEW' } }),
    db.userCardSRS.count({ where: { userId } }),
    db.studySession.findMany({
      where: { userId, date: { gte: windowStart } },
      select: { date: true, cardsReviewed: true, correctCount: true, durationSec: true, xpEarned: true },
    }),
    db.studySession.aggregate({ where: { userId }, _sum: { xpEarned: true } }),
  ]);

  const reviewed = sessions.reduce((sum, session) => sum + session.cardsReviewed, 0);
  const correct = sessions.reduce((sum, session) => sum + session.correctCount, 0);

  const byDay = new Map<string, DailyActivity>();
  for (const session of sessions) {
    const key = utcDateKey(session.date);
    const entry = byDay.get(key) ?? {
      date: key,
      cardsReviewed: 0,
      correctCount: 0,
      durationSec: 0,
      xpEarned: 0,
    };
    entry.cardsReviewed += session.cardsReviewed;
    entry.correctCount += session.correctCount;
    entry.durationSec += session.durationSec;
    entry.xpEarned += session.xpEarned;
    byDay.set(key, entry);
  }

  const heatmap: DailyActivity[] = [];
  for (let offset = 0; offset < HEATMAP_DAYS; offset += 1) {
    const key = utcDateKey(addUtcDays(windowStart, offset));
    heatmap.push(
      byDay.get(key) ?? { date: key, cardsReviewed: 0, correctCount: 0, durationSec: 0, xpEarned: 0 },
    );
  }

  return {
    streakCount: user.streakCount,
    dailyGoalCards: user.dailyGoalCards,
    lastStudyDate: user.lastStudyDate,
    learnedCards,
    trackedCards,
    retentionRate: reviewed > 0 ? Math.round((correct / reviewed) * 1000) / 10 : null,
    totalXp: xpAggregate._sum.xpEarned ?? 0,
    heatmap,
  };
}
