import type { FastifyPluginAsync } from 'fastify';

import type { AppContext } from '../app-context';
import { createAuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { routeRateLimit } from '../middlewares/rateLimiter';

/** /api/auth — kayıt, giriş ve yenileme herkese açıktır; /me korumalıdır. */
export function authRoutes(ctx: AppContext): FastifyPluginAsync {
  return async (app) => {
    const controller = createAuthController(ctx);

    app.post('/register', routeRateLimit(10), controller.register);
    app.post('/login', routeRateLimit(10), controller.login);
    app.post('/refresh', routeRateLimit(30), controller.refresh);
    app.get('/me', { preHandler: authenticate }, controller.me);
  };
}
