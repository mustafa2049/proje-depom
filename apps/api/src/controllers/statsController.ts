import type { FastifyReply, FastifyRequest } from 'fastify';

import type { AppContext } from '../app-context';
import { getStatsOverview } from '../services/statsService';

export function createStatsController(ctx: AppContext) {
  return {
    async overview(request: FastifyRequest, reply: FastifyReply) {
      const overview = await getStatsOverview(ctx.db, request.user.sub);
      return reply.send(overview);
    },
  };
}
