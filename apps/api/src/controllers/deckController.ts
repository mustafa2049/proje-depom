import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { AppContext } from '../app-context';
import { parseWith } from '../lib/validation';
import { createUserCard, getDeckCards, listDecks } from '../services/deckService';

const idParams = z.object({ id: z.string().min(1).max(64) });

const pageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

const createCardBody = z.object({
  deckId: z.string().min(1).max(64).optional(),
  term: z.string().trim().min(1).max(120),
  phonetic: z.string().trim().max(60).optional(),
  partOfSpeech: z.string().trim().min(1).max(40),
  translationTR: z.string().trim().min(1).max(200),
  definitionEN: z.string().trim().min(1).max(500),
  exampleSentence1: z.string().trim().min(1).max(300),
  exampleSentence2: z.string().trim().min(1).max(300).optional(),
  synonyms: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
});

export function createDeckController(ctx: AppContext) {
  return {
    async list(request: FastifyRequest, reply: FastifyReply) {
      const decks = await listDecks(ctx.db, request.user.sub);
      return reply.send({ decks });
    },

    async cards(request: FastifyRequest, reply: FastifyReply) {
      const params = parseWith(idParams, request.params);
      const query = parseWith(pageQuery, request.query);
      const page = await getDeckCards(ctx.db, request.user.sub, params.id, query);
      return reply.send(page);
    },
  };
}

export function createCardController(ctx: AppContext) {
  return {
    async create(request: FastifyRequest, reply: FastifyReply) {
      const body = parseWith(createCardBody, request.body);
      const result = await createUserCard(ctx.db, request.user.sub, body);
      return reply.code(201).send(result);
    },
  };
}
