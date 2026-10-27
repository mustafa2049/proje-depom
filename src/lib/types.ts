export type BoxNumber = 1 | 2 | 3 | 4 | 5;

export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrasal'
  | 'idiom'
  | 'phrase'
  | 'conjunction'
  | 'preposition';

export interface Example {
  en: string;
  tr: string;
}

export interface Word {
  id: string;
  word: string;
  ipa: string;
  pos: PartOfSpeech;
  cefr: Cefr;
  /** Türkçe karşılık */
  meaning: string;
  examples: Example[];
  synonyms?: string[];
  collocations?: string[];
  mnemonic?: string;
  /** Kök/ek parçaları (İnatçı Kelimeler Kliniği) */
  morphology?: { part: string; meaning: string }[];
  etymology?: string;
  /** Hecelere ayrılmış IPA (telaffuz laboratuvarı) */
  syllables?: string[];
  stressIndex?: number;
  image?: string;
  deckId: string;
  custom?: boolean;
  createdAt?: number;
}

export interface CardState {
  wordId: string;
  box: BoxNumber;
  /** Bir sonraki tekrar günü (yerel gün indeksi, bkz. dayIndex) */
  dueDay: number;
  /** Toplam unutma sayısı */
  lapses: number;
  /** Arka arkaya unutma sayısı (inatçı kelime tespiti) */
  failStreak: number;
  reviews: number;
  correct: number;
  lastReviewed: number;
  addedAt: number;
}

export type ReviewOutcome = 'forgot' | 'know' | 'easy';

export interface DayStat {
  reviews: number;
  correct: number;
  xp: number;
  newWords: number;
  studyMs: number;
  lateNight: boolean;
}

export interface JournalEntry {
  id: string;
  createdAt: number;
  prompt: string;
  text: string;
  targetWordIds: string[];
}

export interface SessionMove {
  wordId: string;
  from: BoxNumber | 0;
  to: BoxNumber;
  outcome: ReviewOutcome;
}

export interface SessionResult {
  finishedAt: number;
  durationMs: number;
  moves: SessionMove[];
  xp: number;
  source: string;
}

export interface Profile {
  name: string;
  dailyGoal: number;
  newPerDay: number;
  ttsRate: number;
  createdAt: number;
  xp: number;
}

/** Mikro hikaye: paragraflarda [[kelimeId]] veya [[kelimeId|metindeki hali]] işaretleri bulunur. */
export interface StoryData {
  id: string;
  title: string;
  level: string;
  minutes: number;
  paragraphs: { en: string; tr: string }[];
  questions: { q: string; options: string[]; answer: number; explanation: string }[];
  aiGenerated?: boolean;
}

export interface AppState {
  version: 1;
  profile: Profile;
  cards: Record<string, CardState>;
  customWords: Word[];
  enrolledDecks: string[];
  history: Record<string, DayStat>;
  journal: JournalEntry[];
  lastSession: SessionResult | null;
  completedStories: string[];
  bookmarks: string[];
  rescuedLeeches: number;
  /** Yapay zekânın kullanıcının kelimeleriyle ürettiği hikayeler (en yeni başta) */
  aiStories: StoryData[];
}

export interface Deck {
  id: string;
  title: string;
  emoji: string;
  description: string;
  tag: string;
  tagIcon: string;
  level: string;
  color: 'primary' | 'secondary' | 'tertiary';
  image?: string;
  icon?: string;
}
