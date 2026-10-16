import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyError, type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import type { PrismaClient } from '@prisma/client';

import type { AppContext } from './app-context';
import { AppError } from './lib/errors';
import { createTokenService } from './lib/tokens';
import { GLOBAL_RATE_LIMIT, rateLimitKey } from './middlewares/rateLimiter';
import { authRoutes } from './routes/authRoutes';
import { aiRoutes } from './routes/aiRoutes';
import { practiceRoutes } from './routes/practiceRoutes';
import { readerRoutes } from './routes/readerRoutes';
import { cardRoutes, deckRoutes } from './routes/deckRoutes';
import { srsRoutes } from './routes/srsRoutes';
import { statsRoutes } from './routes/statsRoutes';
import type { LlmProvider } from './services/llmService';

export interface AppOptions {
  db: PrismaClient;
  llm: LlmProvider;
  jwtSecret: string;
  accessTokenTtlSec: number;
  refreshTokenTtlSec: number;
  corsOrigins: string[];
  rateLimitEnabled: boolean;
  logger?: boolean;
}

/**
 * Fastify uygulamasını oluşturur. Dinleme işlemi yapmaz; `server.ts` dinlemeyi üstlenir,
 * testler `app.inject()` ile çağırır.
 */
export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
    bodyLimit: 64 * 1024,
  });

  await app.register(cors, { origin: options.corsOrigins });
  await app.register(fastifyJwt, { secret: options.jwtSecret });

  if (options.rateLimitEnabled) {
    await app.register(rateLimit, {
      global: true,
      ...GLOBAL_RATE_LIMIT,
      keyGenerator: rateLimitKey,
    });
  }

  const ctx: AppContext = {
    db: options.db,
    llm: options.llm,
    tokens: createTokenService(app.jwt, {
      accessTokenTtlSec: options.accessTokenTtlSec,
      refreshTokenTtlSec: options.refreshTokenTtlSec,
    }),
  };

  app.setErrorHandler(handleError);
  app.setNotFoundHandler((_request: FastifyRequest, reply: FastifyReply) =>
    reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Uç nokta bulunamadı' } }),
  );

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes(ctx), { prefix: '/api/auth' });
  await app.register(deckRoutes(ctx), { prefix: '/api/decks' });
  await app.register(cardRoutes(ctx), { prefix: '/api/cards' });
  await app.register(srsRoutes(ctx), { prefix: '/api/srs' });
  await app.register(aiRoutes(ctx), { prefix: '/api/ai' });
  await app.register(statsRoutes(ctx), { prefix: '/api/stats' });
  await app.register(readerRoutes(ctx), { prefix: '/api/reader' });
  await app.register(practiceRoutes(ctx), { prefix: '/api/practice' });

  return app;
}

function handleError(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: { code: error.code, message: error.message, details: error.details },
    });
  }

  const fastifyError = error as FastifyError;
  if (fastifyError.validation) {
    return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: fastifyError.message } });
  }

  if (typeof fastifyError.statusCode === 'number' && fastifyError.statusCode < 500) {
    return reply.status(fastifyError.statusCode).send({ error: { code: 'REQUEST_ERROR', message: fastifyError.message } });
  }

  request.log.error({ err: error }, 'Beklenmeyen hata');
  return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Beklenmeyen bir hata oluştu' } });
}
