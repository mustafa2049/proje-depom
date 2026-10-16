import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; typ: 'access' | 'refresh' };
    user: { sub: string; typ: 'access' | 'refresh' };
  }
}
