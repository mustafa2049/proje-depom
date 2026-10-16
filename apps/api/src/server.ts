import 'dotenv/config';

import { buildApp } from './app';
import { parseEnv } from './config/env';
import { createPrismaClient } from './lib/prisma';
import { createLlmProvider } from './services/llmService';

async function main(): Promise<void> {
  const env = parseEnv(process.env);
  const db = createPrismaClient(env.DATABASE_URL);
  const llm = createLlmProvider(env);

  const app = await buildApp({
    db,
    llm,
    jwtSecret: env.JWT_SECRET,
    accessTokenTtlSec: env.ACCESS_TOKEN_TTL_SEC,
    refreshTokenTtlSec: env.REFRESH_TOKEN_TTL_SEC,
    corsOrigins: env.CORS_ORIGINS,
    rateLimitEnabled: env.RATE_LIMIT_ENABLED,
    logger: true,
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    app.log.info({ signal }, 'Kapatılıyor');
    await app.close();
    await db.$disconnect();
    process.exit(0);
  };
  process.once('SIGINT', (signal) => void shutdown(signal));
  process.once('SIGTERM', (signal) => void shutdown(signal));

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  app.log.info({ provider: llm.name }, 'API hazır');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
