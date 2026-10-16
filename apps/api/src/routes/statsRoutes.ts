import type { FastifyPluginAsync } from 'fastify';

import type { AppContext } from '../app-context';
import { createStatsController } from '../controllers/statsController';
import { authenticate } from '../middlewares/authMiddleware';

/** /api/stats — seri, doğruluk oranı ve ısı haritası verisi. */
export function statsRoutes(ctx: AppContext): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', authenticate);
    const controller = createStatsController(ctx);

    app.get('/overview', controller.overview);
  };
}
