import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { AppContext } from '../app-context';
import { parseWith } from '../lib/validation';
import { getCurrentUser, loginUser, refreshSession, registerUser, updateProfile } from '../services/authService';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Geçerli bir e-posta adresi girin'));

const registerBody = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı').max(128),
  name: z.string().trim().min(1).max(100),
  currentLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A2'),
  dailyGoalCards: z.coerce.number().int().min(1).max(200).default(30),
});

const profileBody = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    currentLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
    dailyGoalCards: z.coerce.number().int().min(1, 'Günlük hedef en az 1 olmalı').max(200, 'Günlük hedef en fazla 200 olabilir').optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'Güncellenecek en az bir alan gerekli',
  });

const loginBody = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

const refreshBody = z.object({
  refreshToken: z.string().min(1),
});

export function createAuthController(ctx: AppContext) {
  return {
    async register(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(registerBody, request.body);
      const result = await registerUser(ctx, body);
      return reply.code(201).send(result);
    },

    async login(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(loginBody, request.body);
      const result = await loginUser(ctx, body.email, body.password);
      return reply.send(result);
    },

    async refresh(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(refreshBody, request.body);
      const result = await refreshSession(ctx, body.refreshToken);
      return reply.send(result);
    },

    async me(request: FastifyRequest, reply: FastifyReply) {
      const user = await getCurrentUser(ctx.db, request.user.sub);
      return reply.send({ user });
    },

    async updateMe(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(profileBody, request.body);
      const user = await updateProfile(ctx.db, request.user.sub, body);
      return reply.send({ user });
    },
  };
}
