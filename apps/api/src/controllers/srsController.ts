import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { AppContext } from '../app-context';
import { parseWith } from '../lib/validation';
import { getStudyQueue, reviewCard } from '../services/srsService';

const dueQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  deckId: z.string().min(1).max(64).optional(),
});

/** Çevrimdışı kuyruğa alınmış değerlendirmeler için en eski kabul edilen gerçek yapılma zamanı. */
const MAX_BACKDATE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 60 * 1000;

const reviewBody = z.object({
  cardId: z.string().min(1).max(64),
  quality: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  durationMs: z.coerce.number().int().min(0).max(10 * 60_000).default(0),
  reviewedAt: z.iso
    .datetime({ offset: true })
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        const time = new Date(value).getTime();
        const now = Date.now();
        return time <= now + MAX_FUTURE_SKEW_MS && time >= now - MAX_BACKDATE_MS;
      },
      { message: 'reviewedAt son 7 gün içinde ve gelecekte olmayan bir zaman olmalı' },
    )
    .transform((value) => (value ? new Date(value) : undefined)),
});

export function createSrsController(ctx: AppContext) {
  return {
    async due(request: FastifyRequest, reply: FastifyReply) {
      const query = parseWith(dueQuery, request.query);
      const queue = await getStudyQueue(ctx.db, request.user.sub, query);
      return reply.send(queue);
    },

    async review(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(reviewBody, request.body);
      const result = await reviewCard(ctx.db, request.user.sub, body);
      return reply.send(result);
    },
  };
}
