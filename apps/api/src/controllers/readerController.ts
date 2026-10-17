import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { AppContext } from '../app-context';
import { parseWith } from '../lib/validation';
import { getPassage, listPassages, lookupWord } from '../services/readerService';

const levelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const passagesQuery = z.object({
  level: levelSchema.optional(),
});

const passageParams = z.object({ id: z.string().min(1).max(100) });

const lookupBody = z.object({
  word: z.string().trim().min(1).max(60),
  contextSentence: z.string().trim().min(1).max(500),
});

export function createReaderController(ctx: AppContext) {
  return {
    async passages(request: FastifyRequest, reply: FastifyReply) {
      const query = parseWith(passagesQuery, request.query);
      return reply.send({ passages: listPassages(query.level) });
    },

    async passage(request: FastifyRequest, reply: FastifyReply) {
      const params = parseWith(passageParams, request.params);
      return reply.send({ passage: getPassage(params.id) });
    },

    async lookup(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(lookupBody, request.body);
      const result = await lookupWord(ctx.db, ctx.llm, request.user.sub, body);
      return reply.send(result);
    },
  };
}
