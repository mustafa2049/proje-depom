import type { PrismaClient } from '@prisma/client';

import { NotFoundError } from '../lib/errors';

import { buildSentenceAnalysisPrompt, buildTutorSystemPrompt } from './aiPrompts';
import { parseModelJson, type LlmProvider } from './llmService';
import { sentenceAnalysisSchema, tutorOutputSchema, type SentenceAnalysis } from './aiSchemas';

/** Senaryo anahtarları (istemciden gelir) ve veritabanına yazılan okunabilir etiketler. */
export const SCENARIO_LABELS = {
  'job-interview': 'Job Interview',
  'airport-check-in': 'Airport Check-in',
  'cafe-order': 'Cafe Order',
  'technical-meeting': 'Technical Meeting',
  'free-talk': 'Free Talk',
} as const;

export type ScenarioKey = keyof typeof SCENARIO_LABELS;

/** Modele gönderilen geçmiş mesaj sayısı (son N mesaj). */
const HISTORY_WINDOW = 20;

export interface ChatInput {
  sessionId?: string | undefined;
  scenario: ScenarioKey;
  message: string;
}

export interface MessageView {
  id: string;
  sender: string;
  content: string;
  correctedContent: string | null;
  grammarExplanation: string | null;
  nativeAlternative: string | null;
  replyTranslationTR: string | null;
  extractedVocabulary: unknown;
  createdAt: Date;
}

export interface ChatResult {
  sessionId: string;
  userMessage: MessageView;
  aiMessage: MessageView;
}

export async function sendChatMessage(
  db: PrismaClient,
  llm: LlmProvider,
  userId: string,
  input: ChatInput,
  now: Date = new Date(),
): Promise<ChatResult> {
  const session = input.sessionId
    ? await db.aIChatSession.findFirst({ where: { id: input.sessionId, userId } })
    : null;

  if (input.sessionId && !session) {
    throw new NotFoundError('Sohbet oturumu bulunamadı');
  }

  const activeSession =
    session ??
    (await db.aIChatSession.create({
      data: {
        userId,
        scenario: SCENARIO_LABELS[input.scenario],
        level: (await db.user.findUniqueOrThrow({ where: { id: userId }, select: { currentLevel: true } }))
          .currentLevel,
      },
    }));

  const history = await db.aIChatMessage.findMany({
    where: { sessionId: activeSession.id },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_WINDOW,
  });

  const raw = await llm.completeJson([
    {
      role: 'system',
      content: buildTutorSystemPrompt({ userLevel: activeSession.level, scenario: activeSession.scenario }),
    },
    ...history.reverse().map((message) => ({
      role: message.sender === 'AI' ? ('assistant' as const) : ('user' as const),
      content: message.content,
    })),
    { role: 'user', content: input.message },
  ]);

  const output = parseModelJson(raw, tutorOutputSchema);
  const correctedContent = output.isPerfect ? null : output.correctedUserMessage;

  // Kullanıcı ve AI satırları aynı transaction'da yazılır. Veritabanı now() değerleri aynı
  // transaction içinde eşit olacağından, sıralamayı korumak için createdAt açıkça verilir.
  const [userRow, aiRow] = await db.$transaction([
    db.aIChatMessage.create({
      data: {
        sessionId: activeSession.id,
        sender: 'USER',
        content: input.message,
        correctedContent,
        grammarExplanation: output.explanationTR,
        nativeAlternative: output.nativeAlternative,
        createdAt: now,
      },
    }),
    db.aIChatMessage.create({
      data: {
        sessionId: activeSession.id,
        sender: 'AI',
        content: output.reply,
        replyTranslationTR: output.replyTranslationTR,
        extractedVocabulary: output.extractedVocabulary,
        createdAt: new Date(now.getTime() + 1),
      },
    }),
  ]);

  return {
    sessionId: activeSession.id,
    userMessage: toMessageView(userRow),
    aiMessage: toMessageView(aiRow),
  };
}

function toMessageView(row: {
  id: string;
  sender: string;
  content: string;
  correctedContent: string | null;
  grammarExplanation: string | null;
  nativeAlternative: string | null;
  replyTranslationTR: string | null;
  extractedVocabulary: unknown;
  createdAt: Date;
}): MessageView {
  return {
    id: row.id,
    sender: row.sender,
    content: row.content,
    correctedContent: row.correctedContent,
    grammarExplanation: row.grammarExplanation,
    nativeAlternative: row.nativeAlternative,
    replyTranslationTR: row.replyTranslationTR,
    extractedVocabulary: row.extractedVocabulary,
    createdAt: row.createdAt,
  };
}

export async function listChatSessions(db: PrismaClient, userId: string, limit: number) {
  const sessions = await db.aIChatSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      scenario: true,
      level: true,
      createdAt: true,
      _count: { select: { messages: true } },
    },
  });

  return sessions.map((session) => ({
    id: session.id,
    scenario: session.scenario,
    level: session.level,
    createdAt: session.createdAt,
    messageCount: session._count.messages,
  }));
}

export async function getChatSession(db: PrismaClient, userId: string, sessionId: string) {
  const session = await db.aIChatSession.findFirst({
    where: { id: sessionId, userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!session) {
    throw new NotFoundError('Sohbet oturumu bulunamadı');
  }

  return {
    id: session.id,
    scenario: session.scenario,
    level: session.level,
    createdAt: session.createdAt,
    messages: session.messages.map(toMessageView),
  };
}

export interface AnalyzeSentenceInput {
  sentence: string;
  sourceTR?: string | undefined;
  context?: string | undefined;
}

/**
 * Kullanıcının yazdığı İngilizce cümleyi gramer ve doğallık açısından analiz eder.
 * Sonuç kalıcı olarak saklanmaz; istemci gerekirse kendi tarafında tutar.
 */
export async function analyzeSentence(llm: LlmProvider, input: AnalyzeSentenceInput): Promise<SentenceAnalysis> {
  const raw = await llm.completeJson([
    {
      role: 'system',
      content: buildSentenceAnalysisPrompt({ sourceTR: input.sourceTR, context: input.context }),
    },
    { role: 'user', content: input.sentence },
  ]);

  return parseModelJson(raw, sentenceAnalysisSchema);
}
