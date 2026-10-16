import type { ApiClient } from './api';
import type {
  AiSessionDetail,
  AiSessionSummary,
  AuthResponse,
  CardView,
  ChatResponse,
  CEFRLevel,
  CreateCardRequest,
  DeckSummary,
  LookupResult,
  PracticeExercise,
  PublicUser,
  ReadingPassage,
  ReadingPassageSummary,
  RegisterRequest,
  ReviewRequest,
  ReviewResponse,
  SentenceAnalysis,
  StatsOverview,
  StudyQueueResponse,
} from '../types/api';

/** Tip güvenli uç nokta çağrıları. Her biri `ApiClient` üzerinden çalışır. */
export function createEndpoints(client: ApiClient) {
  return {
    auth: {
      register: (body: RegisterRequest) =>
        client.post<AuthResponse>('/api/auth/register', { body, auth: false }),
      login: (email: string, password: string) =>
        client.post<AuthResponse>('/api/auth/login', { body: { email, password }, auth: false }),
      me: () => client.get<{ user: PublicUser }>('/api/auth/me'),
    },

    decks: {
      list: () => client.get<{ decks: DeckSummary[] }>('/api/decks'),
    },

    cards: {
      create: (body: CreateCardRequest) => client.post<{ card: CardView; deckId: string }>('/api/cards', { body }),
    },

    srs: {
      due: (params: { limit?: number; deckId?: string }) =>
        client.get<StudyQueueResponse>('/api/srs/due', { query: params }),
      review: (body: ReviewRequest) => client.post<ReviewResponse>('/api/srs/review', { body }),
    },

    stats: {
      overview: () => client.get<StatsOverview>('/api/stats/overview'),
    },

    ai: {
      chat: (body: { sessionId?: string; scenario: string; message: string }) =>
        client.post<ChatResponse>('/api/ai/chat', { body }),
      analyzeSentence: (body: { sentence: string; sourceTR?: string }) =>
        client.post<{ provider: string; analysis: SentenceAnalysis }>('/api/ai/analyze-sentence', { body }),
      sessions: () => client.get<{ sessions: AiSessionSummary[] }>('/api/ai/sessions'),
      session: (id: string) => client.get<{ session: AiSessionDetail }>(`/api/ai/sessions/${id}`),
    },

    reader: {
      passages: (level?: CEFRLevel) =>
        client.get<{ passages: ReadingPassageSummary[] }>('/api/reader/passages', { query: { level } }),
      passage: (id: string) => client.get<{ passage: ReadingPassage }>(`/api/reader/passages/${id}`),
      lookup: (word: string, contextSentence: string) =>
        client.post<LookupResult>('/api/reader/lookup', { body: { word, contextSentence } }),
    },

    practice: {
      exercises: (params: { level?: CEFRLevel; count?: number }) =>
        client.get<{ level: CEFRLevel; exercises: PracticeExercise[] }>('/api/practice/exercises', { query: params }),
    },
  };
}

export type Endpoints = ReturnType<typeof createEndpoints>;
