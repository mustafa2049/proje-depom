import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { AppContext } from '../app-context';
import { parseWith } from '../lib/validation';
import { analyzeSentence, getChatSession, listChatSessions, sendChatMessage, SCENARIO_LABELS } from '../services/aiChatService';

const chatBody = z.object({
  sessionId: z.string().min(1).max(64).optional(),
  scenario: z.enum(Object.keys(SCENARIO_LABELS) as [keyof typeof SCENARIO_LABELS, ...Array<keyof typeof SCENARIO_LABELS>]).default('free-talk'),
  message: z.string().trim().min(1).max(1000),
});

const analyzeBody = z.object({
  sentence: z.string().trim().min(1).max(500),
  sourceTR: z.string().trim().min(1).max(500).optional(),
  context: z.string().trim().min(1).max(500).optional(),
});

const sessionsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const sessionParams = z.object({ id: z.string().min(1).max(64) });

export function createAiController(ctx: AppContext) {
  return {
    async chat(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(chatBody, request.body);
      const result = await sendChatMessage(ctx.db, ctx.llm, request.user.sub, body);
      return reply.send(result);
    },

    async analyze(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(analyzeBody, request.body);
      const analysis = await analyzeSentence(ctx.llm, body);
      return reply.send({ provider: ctx.llm.name, analysis });
    },

    async sessions(request: FastifyRequest, reply: FastifyReply) {
      const query = parseWith(sessionsQuery, request.query);
      const sessions = await listChatSessions(ctx.db, request.user.sub, query.limit);
      return reply.send({ sessions });
    },

    async session(request: FastifyRequest, reply: FastifyReply) {
      const params = parseWith(sessionParams, request.params);
      const session = await getChatSession(ctx.db, request.user.sub, params.id);
      return reply.send({ session });
    },
  };
}
