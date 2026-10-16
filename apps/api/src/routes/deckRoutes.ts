import type { FastifyPluginAsync } from 'fastify';

import type { AppContext } from '../app-context';
import { createCardController, createDeckController } from '../controllers/deckController';
import { authenticate } from '../middlewares/authMiddleware';

/** /api/decks — sistem ve kullanıcı destelerini listeler, deste kartlarını döner. */
export function deckRoutes(ctx: AppContext): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', authenticate);
    const controller = createDeckController(ctx);

    app.get('/', controller.list);
    app.get('/:id/cards', controller.cards);
  };
}

/** /api/cards — kullanıcının kendi destesine kart ekler. */
export function cardRoutes(ctx: AppContext): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', authenticate);
    const controller = createCardController(ctx);

    app.post('/', controller.create);
  };
}
