import { createHash } from 'node:crypto';

import type { FastifyRequest } from 'fastify';

export const GLOBAL_RATE_LIMIT = { max: 300, timeWindow: '1 minute' } as const;

/**
 * Oran sınırı anahtarı: giriş yapmış istekler için Authorization başlığının özeti
 * (kullanıcı başına), yoksa istemci IP'si.
 */
export function rateLimitKey(request: FastifyRequest): string {
  const authorization = request.headers.authorization;
  if (authorization) {
    return `auth:${createHash('sha256').update(authorization).digest('hex').slice(0, 32)}`;
  }
  return `ip:${request.ip}`;
}

/**
 * Tek bir rota için oran sınırı yapılandırması (`@fastify/rate-limit` route config).
 */
export function routeRateLimit(max: number, timeWindow = '1 minute') {
  return {
    config: {
      rateLimit: { max, timeWindow, keyGenerator: rateLimitKey },
    },
  };
}
