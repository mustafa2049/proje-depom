import type { FastifyReply, FastifyRequest } from 'fastify';

import { UnauthorizedError } from '../lib/errors';

/**
 * Korumalı uç noktalar için preHandler: Bearer access token'ını doğrular
 * ve `request.user.sub` üzerinden kullanıcı kimliğini kullanılabilir kılar.
 */
export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw new UnauthorizedError('Geçerli bir erişim token’ı gerekli');
  }

  if (request.user.typ !== 'access') {
    throw new UnauthorizedError('Geçersiz token türü');
  }
}
