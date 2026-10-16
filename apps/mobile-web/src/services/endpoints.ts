import type { ApiClient } from './api';
import type {
  AuthResponse,
  CardView,
  CreateCardRequest,
  DeckSummary,
  PublicUser,
  RegisterRequest,
  ReviewRequest,
  ReviewResponse,
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
  };
}

export type Endpoints = ReturnType<typeof createEndpoints>;
