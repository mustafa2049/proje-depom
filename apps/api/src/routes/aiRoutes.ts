import type { FastifyPluginAsync } from 'fastify';

import type { AppContext } from '../app-context';
import { createAiController } from '../controllers/aiController';
import { authenticate } from '../middlewares/authMiddleware';
import { routeRateLimit } from '../middlewares/rateLimiter';

/** /api/ai — sohbet, cümle analizi ve oturum geçmişi. LLM çağrıları daha sıkı oran sınırına tabidir. */
export function aiRoutes(ctx: AppContext): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', authenticate);
    const controller = createAiController(ctx);

    app.post('/chat', routeRateLimit(20), controller.chat);
    app.post('/analyze-sentence', routeRateLimit(20), controller.analyze);
    app.get('/sessions', controller.sessions);
    app.get('/sessions/:id', controller.session);
  };
}
