import {
  addUtcDays,
  buildDailySeries,
  buildWeeklyTrend,
  calculateNextReview,
  CEFR_ORDER,
  composeExercises,
  CORRECT_THRESHOLD,
  DEFAULT_EASE_FACTOR,
  HEATMAP_DAYS,
  normalizeWord,
  percentOrNull,
  READING_PASSAGES,
  RETENTION_DAYS,
  startOfUtcDay,
  TRANSLATION_BANK,
  utcDateKey,
  utcDayBounds,
  VOCABULARY_DECKS,
  XP_BY_QUALITY,
  type Random,
  type ReviewQuality,
} from '@proje-depom/shared';

import { ApiError } from '../api';
import type { Endpoints } from '../endpoints';
import type {
  AiMessageView,
  AuthResponse,
  CardView,
  CEFRLevel,
  CreateCardRequest,
  DeckSummary,
  LookupResult,
  ProfileUpdateRequest,
  PublicUser,
  ReviewRequest,
  ScenarioKey,
  StudyQueueItem,
} from '../../types/api';

import type { LocalData, LocalDb, LocalDeck, LocalSrsRow } from './localDb';
import { analyzeSentenceLocally, runTutorTurn, type VocabularySource } from './tutorEngine';

/** Sunucusuz modda oturumu temsil eden sabit token; hiçbir sunucuya gönderilmez. */
export const LOCAL_SESSION_TOKENS = { accessToken: 'local-device-session', refreshToken: 'local-device-session' };

export const DEFAULT_LOCAL_DECK_ID = 'local-deck-mine';
const DEFAULT_LOCAL_DECK_TITLE = 'Kelimelerim';
const LEVELS: readonly CEFRLevel[] = CEFR_ORDER;

/** Sunucuyla aynı senaryo etiketleri (apps/api aiChatService). */
const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  'job-interview': 'Job Interview',
  'airport-check-in': 'Airport Check-in',
  'cafe-order': 'Cafe Order',
  'technical-meeting': 'Technical Meeting',
  'free-talk': 'Free Talk',
};
const LABEL_TO_SCENARIO = new Map(Object.entries(SCENARIO_LABELS).map(([key, label]) => [label, key as ScenarioKey]));

/** Sunucuyla aynı sınırlar (apps/api controller doğrulamaları). */
const MAX_BACKDATE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 60 * 1000;
const MAX_REVIEW_DURATION_MS = 10 * 60_000;
const MAX_CHAT_SESSIONS = 30;
const MAX_MESSAGES_PER_SESSION = 200;

export interface LocalBackendDeps {
  now?: () => Date;
  random?: Random;
}

export interface LocalBackend {
  endpoints: Endpoints;
  /** Yerel profil yoksa varsayılan değerlerle oluşturur ve döner. */
  ensureUser(): Promise<PublicUser>;
}

interface SystemDeck {
  deck: LocalDeck;
  cards: CardView[];
}

/** Uygulamaya gömülü sistem desteleri; kimlikler sunucudaki seed ile aynıdır. */
const SYSTEM_DECKS: SystemDeck[] = VOCABULARY_DECKS.map((deck) => {
  const deckId = `seed-deck-${deck.slug}`;
  return {
    deck: { id: deckId, title: deck.title, description: deck.description, level: deck.level, createdAt: '2026-01-01T00:00:00.000Z' },
    cards: deck.cards.map((card) => ({
      id: `seed-card-${card.slug}`,
      deckId,
      term: card.term,
      phonetic: card.phonetic,
      partOfSpeech: card.partOfSpeech,
      translationTR: card.translationTR,
      definitionEN: card.definitionEN,
      exampleSentence1: card.exampleSentence1,
      exampleSentence2: card.exampleSentence2,
      audioUrl: null,
      synonyms: [...card.synonyms],
    })),
  };
});

function validationError(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_ERROR', message);
}

function notFound(message: string): ApiError {
  return new ApiError(404, 'NOT_FOUND', message);
}

function createId(prefix: string, random: Random): string {
  return `${prefix}-${Date.now().toString(36)}-${random().toString(36).slice(2, 10)}`;
}

function requireUser(data: LocalData): PublicUser {
  if (!data.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Yerel profil bulunamadı, lütfen sunucusuz modu yeniden başlatın.');
  }
  return data.user;
}

function allDecks(data: LocalData): LocalDeck[] {
  return [...SYSTEM_DECKS.map((system) => system.deck), ...data.decks];
}

function allCards(data: LocalData): CardView[] {
  return [...SYSTEM_DECKS.flatMap((system) => system.cards), ...data.cards];
}

function levelRank(level: CEFRLevel): number {
  return LEVELS.indexOf(level);
}

function srsView(row: LocalSrsRow) {
  return {
    status: row.status,
    repetitions: row.repetitions,
    easeFactor: row.easeFactor,
    interval: row.interval,
    nextReviewDate: row.nextReviewDate,
  };
}

function trimmed(value: string | undefined, field: string, max: number, required = true): string | undefined {
  const text = value?.trim();
  if (!text) {
    if (required) throw validationError(`${field} zorunlu`);
    return undefined;
  }
  if (text.length > max) {
    throw validationError(`${field} en fazla ${max} karakter olabilir`);
  }
  return text;
}

function assertLevel(level: string): asserts level is CEFRLevel {
  if (!LEVELS.includes(level as CEFRLevel)) {
    throw validationError('Geçersiz seviye');
  }
}

function assertDailyGoal(value: number): void {
  if (!Number.isInteger(value) || value < 1) throw validationError('Günlük hedef en az 1 olmalı');
  if (value > 200) throw validationError('Günlük hedef en fazla 200 olabilir');
}

/** Basit İngilizce gövdeleme: çekim eklerini atarak sözlükte aranacak adayları üretir. */
function lemmaCandidates(word: string): string[] {
  const candidates = [word];
  const add = (value: string) => {
    if (value.length >= 2 && !candidates.includes(value)) candidates.push(value);
  };
  if (word.endsWith('ies')) add(`${word.slice(0, -3)}y`);
  if (word.endsWith('es')) add(word.slice(0, -2));
  if (word.endsWith('s')) add(word.slice(0, -1));
  if (word.endsWith('ied')) add(`${word.slice(0, -3)}y`);
  if (word.endsWith('ed')) {
    add(word.slice(0, -2));
    add(word.slice(0, -1));
    if (/([b-df-hj-np-tv-z])\1ed$/.test(word)) add(word.slice(0, -3));
  }
  if (word.endsWith('ing')) {
    add(word.slice(0, -3));
    add(`${word.slice(0, -3)}e`);
    if (/([b-df-hj-np-tv-z])\1ing$/.test(word)) add(word.slice(0, -4));
  }
  if (word.endsWith('er')) add(word.slice(0, -2));
  if (word.endsWith('est')) add(word.slice(0, -3));
  if (word.endsWith('ly')) add(word.slice(0, -2));
  return candidates;
}

export function createLocalBackend(db: LocalDb, deps: LocalBackendDeps = {}): LocalBackend {
  const now = deps.now ?? (() => new Date());
  const random = deps.random ?? Math.random;

  function newUser(input: { email: string; name: string; currentLevel: CEFRLevel; dailyGoalCards: number }): PublicUser {
    return {
      id: createId('local-user', random),
      email: input.email,
      name: input.name,
      currentLevel: input.currentLevel,
      dailyGoalCards: input.dailyGoalCards,
      streakCount: 0,
      lastStudyDate: null,
      createdAt: now().toISOString(),
    };
  }

  function authResponse(user: PublicUser): AuthResponse {
    return { ...LOCAL_SESSION_TOKENS, user, expiresIn: 365 * 24 * 60 * 60 };
  }

  function updateStreak(user: PublicUser, at: Date): number {
    const today = utcDateKey(at);
    const yesterday = utcDateKey(addUtcDays(startOfUtcDay(at), -1));
    const lastStudyDay = user.lastStudyDate ? utcDateKey(new Date(user.lastStudyDate)) : null;

    if (lastStudyDay === today) {
      user.streakCount = Math.max(user.streakCount, 1);
    } else if (lastStudyDay === yesterday) {
      user.streakCount += 1;
    } else {
      user.streakCount = 1;
    }
    user.lastStudyDate = at.toISOString();
    return user.streakCount;
  }

  function toMessage(
    fields: Pick<AiMessageView, 'sender' | 'content'> & Partial<Omit<AiMessageView, 'id' | 'createdAt'>>,
    createdAt: Date,
  ): AiMessageView {
    return {
      id: createId('local-msg', random),
      correctedContent: null,
      grammarExplanation: null,
      nativeAlternative: null,
      replyTranslationTR: null,
      extractedVocabulary: null,
      ...fields,
      createdAt: createdAt.toISOString(),
    };
  }

  const endpoints: Endpoints = {
    auth: {
      async register(body) {
        const name = trimmed(body.name, 'İsim', 100) as string;
        assertLevel(body.currentLevel);
        assertDailyGoal(body.dailyGoalCards);
        const user = newUser({ email: body.email.trim(), name, currentLevel: body.currentLevel, dailyGoalCards: body.dailyGoalCards });
        await db.update((data) => {
          data.user = user;
        });
        return authResponse(user);
      },

      async login() {
        throw new ApiError(
          400,
          'LOCAL_MODE',
          'Sunucusuz modda e-posta ile giriş yapılamaz. Sunucuya bağlanmak için sunucu adresini girip giriş yapın.',
        );
      },

      async me() {
        return { user: requireUser(await db.read()) };
      },

      async updateProfile(body: ProfileUpdateRequest) {
        if (body.name === undefined && body.currentLevel === undefined && body.dailyGoalCards === undefined) {
          throw validationError('Güncellenecek en az bir alan gönderilmeli');
        }
        const name = body.name === undefined ? undefined : (trimmed(body.name, 'İsim', 100) as string);
        if (body.currentLevel !== undefined) assertLevel(body.currentLevel);
        if (body.dailyGoalCards !== undefined) assertDailyGoal(body.dailyGoalCards);

        const user = await db.update((data) => {
          const current = requireUser(data);
          if (name !== undefined) current.name = name;
          if (body.currentLevel !== undefined) current.currentLevel = body.currentLevel;
          if (body.dailyGoalCards !== undefined) current.dailyGoalCards = body.dailyGoalCards;
          return { ...current };
        });
        return { user };
      },
    },

    decks: {
      async list() {
        const data = await db.read();
        requireUser(data);
        const cards = allCards(data);

        const decks: DeckSummary[] = allDecks(data).map((deck) => {
          const deckCards = cards.filter((card) => card.deckId === deck.id);
          let learning = 0;
          let review = 0;
          for (const card of deckCards) {
            const status = data.srs[card.id]?.status;
            if (status === 'REVIEW') review += 1;
            else if (status === 'LEARNING' || status === 'RELEARNING') learning += 1;
          }
          return {
            id: deck.id,
            title: deck.title,
            description: deck.description,
            level: deck.level,
            isSystem: deck.id.startsWith('seed-deck-'),
            cardCount: deckCards.length,
            progress: { new: Math.max(0, deckCards.length - learning - review), learning, review },
          };
        });
        return { decks };
      },
    },

    cards: {
      async create(body: CreateCardRequest) {
        const term = trimmed(body.term, 'Kelime', 120) as string;
        const partOfSpeech = trimmed(body.partOfSpeech, 'Sözcük türü', 40) as string;
        const translationTR = trimmed(body.translationTR, 'Türkçe anlam', 200) as string;
        const definitionEN = trimmed(body.definitionEN, 'İngilizce tanım', 500) as string;
        const exampleSentence1 = trimmed(body.exampleSentence1, 'Örnek cümle', 300) as string;
        const exampleSentence2 = trimmed(body.exampleSentence2, 'İkinci örnek cümle', 300, false) ?? null;
        const phonetic = trimmed(body.phonetic, 'Okunuş', 60, false) ?? null;
        const synonyms = (body.synonyms ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 10);

        return db.update((data) => {
          const user = requireUser(data);
          let deck: LocalDeck | undefined;

          if (body.deckId) {
            if (SYSTEM_DECKS.some((system) => system.deck.id === body.deckId)) {
              throw new ApiError(403, 'FORBIDDEN', 'Yalnızca kendi destelerinize kart ekleyebilirsiniz');
            }
            deck = data.decks.find((item) => item.id === body.deckId);
            if (!deck) throw notFound('Deste bulunamadı');
          } else {
            deck = data.decks.find((item) => item.id === DEFAULT_LOCAL_DECK_ID);
            if (!deck) {
              deck = {
                id: DEFAULT_LOCAL_DECK_ID,
                title: DEFAULT_LOCAL_DECK_TITLE,
                description: 'Kendi eklediğim kelimeler',
                level: user.currentLevel,
                createdAt: now().toISOString(),
              };
              data.decks.push(deck);
            }
          }

          const deckId = deck.id;
          const duplicate = data.cards.some((card) => card.deckId === deckId && card.term.toLowerCase() === term.toLowerCase());
          if (duplicate) {
            throw new ApiError(409, 'CONFLICT', 'Bu kelime bu destede zaten var');
          }

          const card: CardView = {
            id: createId('local-card', random),
            deckId,
            term,
            phonetic,
            partOfSpeech,
            translationTR,
            definitionEN,
            exampleSentence1,
            exampleSentence2,
            audioUrl: null,
            synonyms,
          };
          data.cards.push(card);
          return { card, deckId };
        });
      },
    },

    srs: {
      async due(params) {
        const limit = Math.min(100, Math.max(1, Math.trunc(params.limit ?? 20)));
        const data = await db.read();
        const user = requireUser(data);
        const at = now();
        const { start, end } = utcDayBounds(at);

        const deckLevels = new Map(allDecks(data).map((deck) => [deck.id, deck.level]));
        const cards = allCards(data).filter((card) => !params.deckId || card.deckId === params.deckId);
        const cardsById = new Map(cards.map((card) => [card.id, card]));

        const dueRows = Object.values(data.srs)
          .filter((row) => cardsById.has(row.cardId) && new Date(row.nextReviewDate).getTime() < end.getTime())
          .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));

        const newIntroducedToday = Object.values(data.srs).filter(
          (row) => new Date(row.firstReviewedAt).getTime() >= start.getTime(),
        ).length;
        const newRemainingToday = Math.max(0, user.dailyGoalCards - newIntroducedToday);
        const dueItems = dueRows.slice(0, limit);
        const newSlots = Math.min(newRemainingToday, limit - dueItems.length);

        const newCards =
          newSlots > 0
            ? cards
                .filter((card) => !data.srs[card.id])
                .sort((a, b) => {
                  const byLevel = levelRank(deckLevels.get(a.deckId) ?? 'C2') - levelRank(deckLevels.get(b.deckId) ?? 'C2');
                  return byLevel !== 0 ? byLevel : a.term.localeCompare(b.term, 'en');
                })
                .slice(0, newSlots)
            : [];

        const items: StudyQueueItem[] = [
          ...dueItems.map((row) => ({ card: cardsById.get(row.cardId) as CardView, srs: srsView(row), isNew: false })),
          ...newCards.map((card) => ({ card, srs: null, isNew: true })),
        ];

        return {
          items,
          summary: { dueTotal: dueRows.length, dailyGoal: user.dailyGoalCards, newIntroducedToday, newRemainingToday, limit },
        };
      },

      async review(body: ReviewRequest) {
        if (![0, 1, 2, 3].includes(body.quality)) {
          throw validationError('Geçersiz değerlendirme');
        }
        const serverNow = now();
        let reviewedAt = serverNow;
        if (body.reviewedAt) {
          const time = new Date(body.reviewedAt).getTime();
          if (Number.isNaN(time) || time > serverNow.getTime() + MAX_FUTURE_SKEW_MS || time < serverNow.getTime() - MAX_BACKDATE_MS) {
            throw validationError('reviewedAt son 7 gün içinde ve gelecekte olmayan bir zaman olmalı');
          }
          reviewedAt = new Date(time);
        }
        const durationMs = Math.min(MAX_REVIEW_DURATION_MS, Math.max(0, Math.round(body.durationMs || 0)));
        const quality = body.quality as ReviewQuality;

        return db.update((data) => {
          const user = requireUser(data);
          if (!allCards(data).some((card) => card.id === body.cardId)) {
            throw notFound('Kart bulunamadı');
          }

          const existing = data.srs[body.cardId];
          const snapshot = existing
            ? { repetitions: existing.repetitions, easeFactor: existing.easeFactor, interval: existing.interval }
            : { repetitions: 0, easeFactor: DEFAULT_EASE_FACTOR, interval: 0 };
          const result = calculateNextReview(snapshot, quality, reviewedAt);

          data.srs[body.cardId] = {
            cardId: body.cardId,
            status: result.status,
            repetitions: result.repetitions,
            easeFactor: result.easeFactor,
            interval: result.interval,
            nextReviewDate: result.nextReviewDate.toISOString(),
            lastReviewedAt: reviewedAt.toISOString(),
            firstReviewedAt: existing?.firstReviewedAt ?? reviewedAt.toISOString(),
          };

          const xpEarned = XP_BY_QUALITY[quality];
          const dayKey = utcDateKey(reviewedAt);
          const day = data.activity[dayKey] ?? { date: dayKey, cardsReviewed: 0, correctCount: 0, durationSec: 0, xpEarned: 0 };
          day.cardsReviewed += 1;
          day.correctCount += quality >= CORRECT_THRESHOLD ? 1 : 0;
          day.durationSec += Math.round(durationMs / 1000);
          day.xpEarned += xpEarned;
          data.activity[dayKey] = day;

          const streakCount = updateStreak(user, reviewedAt);

          return {
            cardId: body.cardId,
            status: result.status,
            repetitions: result.repetitions,
            easeFactor: result.easeFactor,
            interval: result.interval,
            nextReviewDate: result.nextReviewDate.toISOString(),
            xpEarned,
            streakCount,
          };
        });
      },
    },

    stats: {
      async overview() {
        const data = await db.read();
        const user = requireUser(data);
        const at = now();
        const visibleIds = new Set(allCards(data).map((card) => card.id));

        const counts = { NEW: 0, LEARNING: 0, REVIEW: 0, RELEARNING: 0 };
        for (const row of Object.values(data.srs)) {
          if (visibleIds.has(row.cardId)) counts[row.status] += 1;
        }
        const tracked = counts.LEARNING + counts.REVIEW + counts.RELEARNING;

        const windowStart = addUtcDays(startOfUtcDay(at), -(HEATMAP_DAYS - 1));
        const retentionStart = addUtcDays(startOfUtcDay(at), -(RETENTION_DAYS - 1));
        const sessions = Object.values(data.activity).map((day) => ({ ...day, date: new Date(`${day.date}T00:00:00.000Z`) }));
        const heatmap = buildDailySeries(
          sessions.filter((day) => day.date.getTime() >= windowStart.getTime()),
          windowStart,
          HEATMAP_DAYS,
        );
        const recent = sessions.filter((day) => day.date.getTime() >= retentionStart.getTime());
        const reviewed = recent.reduce((sum, day) => sum + day.cardsReviewed, 0);
        const correct = recent.reduce((sum, day) => sum + day.correctCount, 0);

        return {
          streakCount: user.streakCount,
          dailyGoalCards: user.dailyGoalCards,
          lastStudyDate: user.lastStudyDate,
          learnedCards: counts.REVIEW,
          trackedCards: tracked,
          retentionRate: percentOrNull(correct, reviewed),
          totalXp: sessions.reduce((sum, day) => sum + day.xpEarned, 0),
          srsBreakdown: {
            new: Math.max(0, visibleIds.size - tracked),
            learning: counts.LEARNING,
            review: counts.REVIEW,
            relearning: counts.RELEARNING,
          },
          heatmap,
          weeklyTrend: buildWeeklyTrend(heatmap),
        };
      },
    },

    ai: {
      async chat(body) {
        const message = trimmed(body.message, 'Mesaj', 1000) as string;
        const scenario = (body.scenario in SCENARIO_LABELS ? body.scenario : 'free-talk') as ScenarioKey;
        const at = now();

        return db.update((data) => {
          const user = requireUser(data);
          let session = body.sessionId ? data.chats.find((chat) => chat.id === body.sessionId) : undefined;
          if (body.sessionId && !session) {
            throw notFound('Sohbet oturumu bulunamadı');
          }
          if (!session) {
            session = { id: createId('local-chat', random), scenario: SCENARIO_LABELS[scenario], level: user.currentLevel, createdAt: at.toISOString(), messages: [] };
            data.chats.push(session);
          }

          const vocabularyPool: VocabularySource[] = allCards(data).map((card) => ({
            term: card.term,
            translationTR: card.translationTR,
            example: card.exampleSentence1,
          }));
          const turn = runTutorTurn({
            scenario: LABEL_TO_SCENARIO.get(session.scenario) ?? scenario,
            message,
            turn: session.messages.filter((item) => item.sender === 'AI').length,
            vocabularyPool,
          });

          const userMessage = toMessage(
            {
              sender: 'USER',
              content: message,
              correctedContent: turn.isPerfect ? null : turn.correctedUserMessage,
              grammarExplanation: turn.explanationTR,
              nativeAlternative: turn.nativeAlternative,
            },
            at,
          );
          const aiMessage = toMessage(
            {
              sender: 'AI',
              content: turn.reply,
              replyTranslationTR: turn.replyTranslationTR,
              extractedVocabulary: turn.extractedVocabulary,
            },
            new Date(at.getTime() + 1),
          );

          session.messages.push(userMessage, aiMessage);
          session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
          data.chats = data.chats
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .slice(-MAX_CHAT_SESSIONS);

          return { sessionId: session.id, userMessage, aiMessage };
        });
      },

      async analyzeSentence(body) {
        const sentence = trimmed(body.sentence, 'Cümle', 500) as string;
        const sourceTR = body.sourceTR?.trim();
        const reference = sourceTR ? TRANSLATION_BANK.find((item) => item.sourceTR.trim() === sourceTR)?.referenceEN : undefined;
        return { provider: 'local', analysis: analyzeSentenceLocally(sentence, reference) };
      },

      async sessions() {
        const data = await db.read();
        requireUser(data);
        const sessions = [...data.chats]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 20)
          .map((chat) => ({ id: chat.id, scenario: chat.scenario, level: chat.level, createdAt: chat.createdAt, messageCount: chat.messages.length }));
        return { sessions };
      },

      async session(id) {
        const data = await db.read();
        requireUser(data);
        const chat = data.chats.find((item) => item.id === id);
        if (!chat) {
          throw notFound('Sohbet oturumu bulunamadı');
        }
        return { session: { id: chat.id, scenario: chat.scenario, level: chat.level, createdAt: chat.createdAt, messages: chat.messages } };
      },
    },

    reader: {
      async passages(level) {
        const passages = READING_PASSAGES.filter((passage) => !level || passage.level === level).map((passage) => ({
          id: passage.id,
          title: passage.title,
          level: passage.level,
          category: passage.category,
          estimatedMinutes: passage.estimatedMinutes,
        }));
        return { passages };
      },

      async passage(id) {
        const passage = READING_PASSAGES.find((item) => item.id === id);
        if (!passage) {
          throw notFound('Okuma parçası bulunamadı');
        }
        return { passage };
      },

      async lookup(rawWord, contextSentence) {
        const word = normalizeWord(rawWord);
        if (!word) {
          throw validationError('Geçerli bir kelime girin');
        }
        const data = await db.read();
        requireUser(data);
        const candidates = lemmaCandidates(word);
        const cards = allCards(data);
        const context = ` ${contextSentence.toLowerCase().replace(/[^a-z'\s-]/g, ' ').replace(/\s+/g, ' ')} `;

        /** Tıklanan kelimeyi içeren ve cümlede aynen geçen çok kelimeli ifade (ör. "wake" → "wake up"). */
        const phraseInContext = (term: string): boolean => {
          const lower = term.toLowerCase();
          return lower.includes(' ') && lower.split(' ').some((part) => candidates.includes(part)) && context.includes(` ${lower} `);
        };
        const exactMatch = (term: string): boolean => candidates.includes(term.toLowerCase());
        const longestFirst = <T extends { term: string }>(items: T[]): T[] => [...items].sort((a, b) => b.term.length - a.term.length);

        const card =
          longestFirst(cards.filter((item) => phraseInContext(item.term)))[0] ??
          candidates.map((candidate) => cards.find((item) => item.term.toLowerCase() === candidate)).find(Boolean);
        if (card) {
          const result: LookupResult = {
            source: 'DECK',
            word: card.term.includes(' ') ? card.term : word,
            translationTR: card.translationTR,
            partOfSpeech: card.partOfSpeech,
            phonetic: card.phonetic,
            definitionEN: card.definitionEN,
            exampleSentence: card.exampleSentence1,
            synonyms: card.synonyms,
            existingCardId: card.id,
          };
          return result;
        }

        const keyVocabulary = READING_PASSAGES.flatMap((passage) => passage.keyVocabulary.map((entry) => ({ ...entry, passage })));
        const entry =
          longestFirst(keyVocabulary.filter((item) => phraseInContext(item.term)))[0] ??
          keyVocabulary.find((item) => exactMatch(item.term));
        if (entry) {
          return {
            source: 'OFFLINE',
            word: entry.term.includes(' ') ? entry.term : word,
            translationTR: entry.translationTR,
            partOfSpeech: entry.term.includes(' ') ? 'phrase' : 'term',
            phonetic: null,
            definitionEN: `Key vocabulary from the reading "${entry.passage.title}".`,
            exampleSentence: contextSentence.trim() || entry.passage.title,
            synonyms: [],
            existingCardId: null,
          };
        }

        throw notFound(`"${word}" çevrimdışı sözlükte bulunamadı. Sunucu modunda yapay zeka ile çevrilebilir.`);
      },
    },

    practice: {
      async exercises(params) {
        const data = await db.read();
        const user = requireUser(data);
        const level = params.level ?? user.currentLevel;
        assertLevel(level);
        const count = Math.min(30, Math.max(3, Math.trunc(params.count ?? 9)));
        const deckLevels = new Map(allDecks(data).map((deck) => [deck.id, deck.level]));
        const cards = allCards(data).filter((card) => deckLevels.get(card.deckId) === level);
        return composeExercises({ level, count, cards }, random);
      },
    },
  };

  return {
    endpoints,

    async ensureUser() {
      return db.update((data) => {
        data.user ??= newUser({ email: 'cihaz@yerel', name: 'Öğrenci', currentLevel: 'A2', dailyGoalCards: 30 });
        return { ...data.user };
      });
    },
  };
}
