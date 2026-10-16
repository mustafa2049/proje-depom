import type { FastifyPluginAsync } from 'fastify';

import type { AppContext } from '../app-context';
import { createSrsController } from '../controllers/srsController';
import { authenticate } from '../middlewares/authMiddleware';

/** /api/srs — bugünün kuyruğu ve kart değerlendirme. */
export function srsRoutes(ctx: AppContext): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', authenticate);
    const controller = createSrsController(ctx);

    app.get('/due', controller.due);
    app.post('/review', controller.review);
  };
}
