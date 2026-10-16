import { Prisma, type PrismaClient } from '@prisma/client';

import { ForbiddenError, ConflictError, NotFoundError } from '../lib/errors';

export const DEFAULT_USER_DECK_TITLE = 'Kelimelerim';

/** Kullanıcının görebildiği desteler: sistem destesi veya kendi destesi. */
export function visibleDecksWhere(userId: string): Prisma.DeckWhereInput {
  return { OR: [{ isSystem: true }, { userId }] };
}

/** Kullanıcının çalışabileceği kartların filtresi (isteğe bağlı deste kısıtı ile). */
export function buildCardWhere(userId: string, deckId?: string): Prisma.CardWhereInput {
  if (deckId) {
    return { AND: [{ deck: visibleDecksWhere(userId) }, { deckId }] };
  }
  return { deck: visibleDecksWhere(userId) };
}

export interface DeckSummary {
  id: string;
  title: string;
  description: string | null;
  level: string;
  isSystem: boolean;
  cardCount: number;
  progress: { new: number; learning: number; review: number };
}

export async function listDecks(db: PrismaClient, userId: string): Promise<DeckSummary[]> {
  const [decks, progressRows] = await Promise.all([
    db.deck.findMany({
      where: visibleDecksWhere(userId),
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        isSystem: true,
        _count: { select: { cards: true } },
      },
    }),
    db.userCardSRS.findMany({
      where: { userId, card: buildCardWhere(userId) },
      select: { status: true, card: { select: { deckId: true } } },
    }),
  ]);

  const counts = new Map<string, { learning: number; review: number }>();
  for (const row of progressRows) {
    const entry = counts.get(row.card.deckId) ?? { learning: 0, review: 0 };
    if (row.status === 'REVIEW') {
      entry.review += 1;
    } else if (row.status === 'LEARNING' || row.status === 'RELEARNING') {
      entry.learning += 1;
    }
    counts.set(row.card.deckId, entry);
  }

  return decks.map((deck) => {
    const cardCount = deck._count.cards;
    const { learning = 0, review = 0 } = counts.get(deck.id) ?? {};
    return {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      level: deck.level,
      isSystem: deck.isSystem,
      cardCount,
      progress: {
        new: Math.max(0, cardCount - learning - review),
        learning,
        review,
      },
    };
  });
}

export interface CardView {
  id: string;
  deckId: string;
  term: string;
  phonetic: string | null;
  partOfSpeech: string;
  translationTR: string;
  definitionEN: string;
  exampleSentence1: string;
  exampleSentence2: string | null;
  audioUrl: string | null;
  synonyms: string[];
}

export function toCardView(card: CardView): CardView {
  return {
    id: card.id,
    deckId: card.deckId,
    term: card.term,
    phonetic: card.phonetic,
    partOfSpeech: card.partOfSpeech,
    translationTR: card.translationTR,
    definitionEN: card.definitionEN,
    exampleSentence1: card.exampleSentence1,
    exampleSentence2: card.exampleSentence2,
    audioUrl: card.audioUrl,
    synonyms: card.synonyms,
  };
}

export interface DeckCardsPage {
  deck: { id: string; title: string; level: string; isSystem: boolean };
  total: number;
  items: Array<CardView & { srs: SrsProgressView | null }>;
}

export interface SrsProgressView {
  status: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
}

export async function getDeckCards(
  db: PrismaClient,
  userId: string,
  deckId: string,
  page: { limit: number; offset: number },
): Promise<DeckCardsPage> {
  const deck = await db.deck.findFirst({
    where: { id: deckId, ...visibleDecksWhere(userId) },
    select: { id: true, title: true, level: true, isSystem: true },
  });
  if (!deck) {
    throw new NotFoundError('Deste bulunamadı');
  }

  const [total, cards] = await Promise.all([
    db.card.count({ where: { deckId } }),
    db.card.findMany({
      where: { deckId },
      orderBy: { term: 'asc' },
      skip: page.offset,
      take: page.limit,
      include: { userProgress: { where: { userId }, take: 1 } },
    }),
  ]);

  return {
    deck,
    total,
    items: cards.map((card) => {
      const progress = card.userProgress[0];
      return {
        ...toCardView(card),
        srs: progress
          ? {
              status: progress.status,
              repetitions: progress.repetitions,
              easeFactor: progress.easeFactor,
              interval: progress.interval,
              nextReviewDate: progress.nextReviewDate,
            }
          : null,
      };
    }),
  };
}

export interface CreateCardInput {
  deckId?: string | undefined;
  term: string;
  phonetic?: string | undefined;
  partOfSpeech: string;
  translationTR: string;
  definitionEN: string;
  exampleSentence1: string;
  exampleSentence2?: string | undefined;
  synonyms: string[];
}

async function resolveOwnDeck(db: PrismaClient, userId: string, deckId: string) {
  const deck = await db.deck.findUnique({ where: { id: deckId } });
  if (!deck) {
    throw new NotFoundError('Deste bulunamadı');
  }
  if (deck.isSystem || deck.userId !== userId) {
    throw new ForbiddenError('Yalnızca kendi destelerinize kart ekleyebilirsiniz');
  }
  return deck;
}

async function ensureDefaultUserDeck(db: PrismaClient, userId: string, level: string) {
  const existing = await db.deck.findFirst({
    where: { userId, isSystem: false, title: DEFAULT_USER_DECK_TITLE },
  });
  if (existing) {
    return existing;
  }

  return db.deck.create({
    data: {
      title: DEFAULT_USER_DECK_TITLE,
      description: 'Kendi eklediğim kelimeler',
      level: level as Prisma.DeckCreateInput['level'],
      userId,
    },
  });
}

export async function createUserCard(db: PrismaClient, userId: string, input: CreateCardInput) {
  const deck = input.deckId
    ? await resolveOwnDeck(db, userId, input.deckId)
    : await ensureDefaultUserDeck(
        db,
        userId,
        (await db.user.findUniqueOrThrow({ where: { id: userId }, select: { currentLevel: true } })).currentLevel,
      );

  const duplicate = await db.card.findFirst({
    where: { deckId: deck.id, term: { equals: input.term, mode: 'insensitive' } },
    select: { id: true },
  });
  if (duplicate) {
    throw new ConflictError('Bu kelime bu destede zaten var');
  }

  const card = await db.card.create({
    data: {
      deckId: deck.id,
      term: input.term,
      phonetic: input.phonetic ?? null,
      partOfSpeech: input.partOfSpeech,
      translationTR: input.translationTR,
      definitionEN: input.definitionEN,
      exampleSentence1: input.exampleSentence1,
      exampleSentence2: input.exampleSentence2 ?? null,
      synonyms: input.synonyms,
    },
  });

  return { card: toCardView(card), deckId: deck.id };
}
