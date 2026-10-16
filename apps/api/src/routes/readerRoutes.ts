import type { FastifyPluginAsync } from 'fastify';

import type { AppContext } from '../app-context';
import { createReaderController } from '../controllers/readerController';
import { authenticate } from '../middlewares/authMiddleware';
import { routeRateLimit } from '../middlewares/rateLimiter';

/** /api/reader — okuma kütüphanesi ve bağlamsal sözlük. */
export function readerRoutes(ctx: AppContext): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', authenticate);
    const controller = createReaderController(ctx);

    app.get('/passages', controller.passages);
    app.get('/passages/:id', controller.passage);
    app.post('/lookup', routeRateLimit(30), controller.lookup);
  };
}
