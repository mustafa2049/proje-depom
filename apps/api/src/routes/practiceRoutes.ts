import type { FastifyPluginAsync } from 'fastify';

import type { AppContext } from '../app-context';
import { createPracticeController } from '../controllers/practiceController';
import { authenticate } from '../middlewares/authMiddleware';

/** /api/practice — cümle kurma ve gramer alıştırmaları. */
export function practiceRoutes(ctx: AppContext): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', authenticate);
    const controller = createPracticeController(ctx);

    app.get('/exercises', controller.exercises);
  };
}
