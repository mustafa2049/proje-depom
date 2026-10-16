import { Prisma, type PrismaClient } from '@prisma/client';

import { addUtcDays, startOfUtcDay, utcDateKey, utcDayBounds } from '../lib/dates';
import { ConflictError, NotFoundError } from '../lib/errors';
import {
  calculateNextReview,
  CORRECT_THRESHOLD,
  DEFAULT_EASE_FACTOR,
  REVIEW_QUALITY,
  XP_BY_QUALITY,
  type ReviewQuality,
} from '@proje-depom/shared';

import { buildCardWhere, toCardView, type CardView, type SrsProgressView } from './deckService';

export interface StudyQueueOptions {
  limit: number;
  deckId?: string | undefined;
}

export interface StudyQueueItem {
  card: CardView;
  srs: SrsProgressView | null;
  isNew: boolean;
}

export interface StudyQueue {
  items: StudyQueueItem[];
  summary: {
    dueTotal: number;
    dailyGoal: number;
    newIntroducedToday: number;
    newRemainingToday: number;
    limit: number;
  };
}

/**
 * Bugünün çalışma kuyruğu:
 *  1. `nextReviewDate` bugünün sonundan önce olan tekrar kartları (yeniden sorulacak öncelikli kartlar).
 *  2. Kalan kapasite ve günlük yeni kart kotası (`dailyGoalCards` − bugün başlatılan yeni kartlar)
 *     kadar, hiç çalışılmamış kartlar.
 */
export async function getStudyQueue(
  db: PrismaClient,
  userId: string,
  options: StudyQueueOptions,
  now: Date = new Date(),
): Promise<StudyQueue> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { dailyGoalCards: true },
  });
  if (!user) {
    throw new NotFoundError('Kullanıcı bulunamadı');
  }

  const { start, end } = utcDayBounds(now);
  const dueWhere: Prisma.UserCardSRSWhereInput = {
    userId,
    status: { not: 'NEW' },
    nextReviewDate: { lt: end },
    card: buildCardWhere(userId, options.deckId),
  };

  const [dueTotal, dueRows, newIntroducedToday] = await Promise.all([
    db.userCardSRS.count({ where: dueWhere }),
    db.userCardSRS.findMany({
      where: dueWhere,
      orderBy: { nextReviewDate: 'asc' },
      take: options.limit,
      include: { card: true },
    }),
    db.userCardSRS.count({ where: { userId, firstReviewedAt: { gte: start } } }),
  ]);

  const newRemainingToday = Math.max(0, user.dailyGoalCards - newIntroducedToday);
  const newSlots = Math.min(newRemainingToday, options.limit - dueRows.length);

  const newCards =
    newSlots > 0
      ? await db.card.findMany({
          where: {
            AND: [buildCardWhere(userId, options.deckId), { userProgress: { none: { userId } } }],
          },
          orderBy: [{ deck: { level: 'asc' } }, { term: 'asc' }],
          take: newSlots,
        })
      : [];

  const items: StudyQueueItem[] = [
    ...dueRows.map((row) => ({
      card: toCardView(row.card),
      srs: {
        status: row.status,
        repetitions: row.repetitions,
        easeFactor: row.easeFactor,
        interval: row.interval,
        nextReviewDate: row.nextReviewDate,
      },
      isNew: false,
    })),
    ...newCards.map((card) => ({ card: toCardView(card), srs: null, isNew: true })),
  ];

  return {
    items,
    summary: {
      dueTotal,
      dailyGoal: user.dailyGoalCards,
      newIntroducedToday,
      newRemainingToday,
      limit: options.limit,
    },
  };
}

export interface ReviewInput {
  cardId: string;
  quality: ReviewQuality;
  durationMs: number;
  /** Çevrimdışı değerlendirmelerde gerçek yapılma zamanı; verilmezse sunucu zamanı kullanılır. */
  reviewedAt?: Date | undefined;
}

export interface ReviewResult {
  cardId: string;
  status: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
  xpEarned: number;
  streakCount: number;
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

/**
 * Kart değerlendirmesini atomik olarak kaydeder:
 *  - UserCardSRS (yoksa oluşturulur) SM-2 sonucuyla güncellenir; eşzamanlı güncellemeler
 *    `lastReviewedAt` karşılaştırmasıyla (compare-and-swap) korunur.
 *  - Günün StudySession kaydı artırılır (veya oluşturulur).
 *  - Kullanıcının seri (streak) bilgisi güncellenir.
 */
export async function reviewCard(
  db: PrismaClient,
  userId: string,
  input: ReviewInput,
  serverNow: Date = new Date(),
): Promise<ReviewResult> {
  const now = input.reviewedAt ?? serverNow;
  try {
    return await db.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: { AND: [{ id: input.cardId }, buildCardWhere(userId)] },
        select: { id: true },
      });
      if (!card) {
        throw new NotFoundError('Kart bulunamadı');
      }

      const existing = await tx.userCardSRS.findUnique({
        where: { userId_cardId: { userId, cardId: input.cardId } },
      });

      const snapshot = existing
        ? { repetitions: existing.repetitions, easeFactor: existing.easeFactor, interval: existing.interval }
        : { repetitions: 0, easeFactor: DEFAULT_EASE_FACTOR, interval: 0 };

      const result = calculateNextReview(snapshot, input.quality, now);
      const srsData = {
        status: result.status,
        repetitions: result.repetitions,
        easeFactor: result.easeFactor,
        interval: result.interval,
        nextReviewDate: result.nextReviewDate,
        lastReviewedAt: now,
      };

      if (existing) {
        const updated = await tx.userCardSRS.updateMany({
          where: { id: existing.id, lastReviewedAt: existing.lastReviewedAt },
          data: srsData,
        });
        if (updated.count === 0) {
          throw new ConflictError('Kart başka bir istekte güncellendi, lütfen tekrar deneyin');
        }
      } else {
        await tx.userCardSRS.create({
          data: { userId, cardId: input.cardId, firstReviewedAt: now, ...srsData },
        });
      }

      const xpEarned = XP_BY_QUALITY[input.quality];
      await upsertTodaySession(tx, userId, {
        correct: input.quality >= CORRECT_THRESHOLD,
        durationSec: Math.round(input.durationMs / 1000),
        xpEarned,
      }, now);
      const streakCount = await updateStreak(tx, userId, now);

      return {
        cardId: input.cardId,
        status: result.status,
        repetitions: result.repetitions,
        easeFactor: result.easeFactor,
        interval: result.interval,
        nextReviewDate: result.nextReviewDate,
        xpEarned,
        streakCount,
      };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('Kart başka bir istekte güncellendi, lütfen tekrar deneyin');
    }
    throw error;
  }
}

async function upsertTodaySession(
  tx: Prisma.TransactionClient,
  userId: string,
  delta: { correct: boolean; durationSec: number; xpEarned: number },
  now: Date,
): Promise<void> {
  const session = await tx.studySession.findFirst({
    where: { userId, date: { gte: startOfUtcDay(now) } },
    orderBy: { date: 'desc' },
  });

  const increments = {
    cardsReviewed: { increment: 1 },
    correctCount: { increment: delta.correct ? 1 : 0 },
    durationSec: { increment: delta.durationSec },
    xpEarned: { increment: delta.xpEarned },
  };

  if (session) {
    await tx.studySession.update({ where: { id: session.id }, data: increments });
    return;
  }

  await tx.studySession.create({
    data: {
      userId,
      date: now,
      cardsReviewed: 1,
      correctCount: delta.correct ? 1 : 0,
      durationSec: delta.durationSec,
      xpEarned: delta.xpEarned,
    },
  });
}

/**
 * Seri kuralları (UTC günleri):
 *  - Bugün zaten çalışılmışsa seri korunur.
 *  - Dün çalışılmışsa seri 1 artar.
 *  - Daha eski bir tarihte çalışılmışsa (ya da hiç çalışılmamışsa) seri 1 olur.
 */
async function updateStreak(tx: Prisma.TransactionClient, userId: string, now: Date): Promise<number> {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { streakCount: true, lastStudyDate: true },
  });

  const today = utcDateKey(now);
  const yesterday = utcDateKey(addUtcDays(startOfUtcDay(now), -1));
  const lastStudyDay = user.lastStudyDate ? utcDateKey(user.lastStudyDate) : null;

  let streakCount: number;
  if (lastStudyDay === today) {
    streakCount = Math.max(user.streakCount, 1);
  } else if (lastStudyDay === yesterday) {
    streakCount = user.streakCount + 1;
  } else {
    streakCount = 1;
  }

  await tx.user.update({
    where: { id: userId },
    data: { streakCount, lastStudyDate: now },
  });

  return streakCount;
}
