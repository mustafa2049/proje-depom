/**
 * API sözleşmesi (apps/api ile eşleşir). Sunucu tarafında değişiklik olursa burası da güncellenmelidir.
 */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  currentLevel: CEFRLevel;
  dailyGoalCards: number;
  streakCount: number;
  lastStudyDate: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: PublicUser;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  currentLevel: CEFRLevel;
  dailyGoalCards: number;
}

export interface DeckSummary {
  id: string;
  title: string;
  description: string | null;
  level: CEFRLevel;
  isSystem: boolean;
  cardCount: number;
  progress: { new: number; learning: number; review: number };
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

export type SrsStatus = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';

export interface SrsProgress {
  status: SrsStatus | 'REVIEW' | 'RELEARNING';
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: string;
}

export interface StudyQueueItem {
  card: CardView;
  srs: SrsProgress | null;
  isNew: boolean;
}

export interface StudyQueueResponse {
  items: StudyQueueItem[];
  summary: {
    dueTotal: number;
    dailyGoal: number;
    newIntroducedToday: number;
    newRemainingToday: number;
    limit: number;
  };
}

export type ReviewQuality = 0 | 1 | 2 | 3;

export interface ReviewRequest {
  cardId: string;
  quality: ReviewQuality;
  durationMs: number;
  reviewedAt?: string;
}

export interface ReviewResponse {
  cardId: string;
  status: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: string;
  xpEarned: number;
  streakCount: number;
}

export interface CreateCardRequest {
  deckId?: string;
  term: string;
  phonetic?: string;
  partOfSpeech: string;
  translationTR: string;
  definitionEN: string;
  exampleSentence1: string;
  exampleSentence2?: string;
  synonyms: string[];
}

export interface StatsOverview {
  streakCount: number;
  dailyGoalCards: number;
  lastStudyDate: string | null;
  learnedCards: number;
  trackedCards: number;
  retentionRate: number | null;
  totalXp: number;
  heatmap: Array<{
    date: string;
    cardsReviewed: number;
    correctCount: number;
    durationSec: number;
    xpEarned: number;
  }>;
}
