import type { FastifyInstance } from 'fastify';

import { UnauthorizedError } from './errors';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Erişim token'ının geçerlilik süresi (saniye). */
  expiresIn: number;
}

export interface TokenService {
  issue(userId: string): TokenPair;
  verifyRefreshToken(token: string): string;
}

export interface TokenTtl {
  accessTokenTtlSec: number;
  refreshTokenTtlSec: number;
}

/**
 * Access ve refresh token'ları aynı gizli anahtarla imzalar; `typ` claim'i ile birbirinden ayırır.
 * Access token'lar `request.jwtVerify()` ile, refresh token'lar yalnızca yenileme uç noktasında doğrulanır.
 */
export function createTokenService(jwt: FastifyInstance['jwt'], ttl: TokenTtl): TokenService {
  return {
    issue(userId) {
      return {
        accessToken: jwt.sign({ sub: userId, typ: 'access' }, { expiresIn: ttl.accessTokenTtlSec }),
        refreshToken: jwt.sign({ sub: userId, typ: 'refresh' }, { expiresIn: ttl.refreshTokenTtlSec }),
        expiresIn: ttl.accessTokenTtlSec,
      };
    },

    verifyRefreshToken(token) {
      let payload: { sub?: unknown; typ?: unknown };
      try {
        payload = jwt.verify<{ sub?: unknown; typ?: unknown }>(token);
      } catch {
        throw new UnauthorizedError('Yenileme token’ı geçersiz veya süresi dolmuş');
      }

      if (payload.typ !== 'refresh' || typeof payload.sub !== 'string') {
        throw new UnauthorizedError('Yenileme token’ı geçersiz');
      }
      return payload.sub;
    },
  };
}
