import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { AppContext } from '../app-context';
import { parseWith } from '../lib/validation';
import { buildExercises } from '../services/practiceService';

const exercisesQuery = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  count: z.coerce.number().int().min(3).max(30).default(9),
});

export function createPracticeController(ctx: AppContext) {
  return {
    async exercises(request: FastifyRequest, reply: FastifyReply) {
      const query = parseWith(exercisesQuery, request.query);
      const level =
        query.level ??
        (await ctx.db.user.findUniqueOrThrow({ where: { id: request.user.sub }, select: { currentLevel: true } }))
          .currentLevel;

      const result = await buildExercises(ctx.db, request.user.sub, { level, count: query.count });
      return reply.send(result);
    },
  };
}
