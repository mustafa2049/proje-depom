import { SEED_WORD_MAP } from '../data/words';
import {
  applyReview,
  clampBox,
  dayIndex,
  dayKey,
  BOX_INTERVALS,
  newCard,
} from '../lib/leitner';
import type {
  AppState,
  BoxNumber,
  CoachReport,
  DayStat,
  JournalEntry,
  Profile,
  ReviewOutcome,
  SessionResult,
  StoryData,
  Word,
} from '../lib/types';

export const STORAGE_KEY = 'lexilearn:state:v1';

export const XP = {
  know: 5,
  easy: 5,
  forgot: 1,
} as const;

export function createInitialState(now = Date.now()): AppState {
  return {
    version: 1,
    profile: {
      name: 'Öğrenci',
      dailyGoal: 20,
      newPerDay: 5,
      ttsRate: 0.9,
      createdAt: now,
      xp: 0,
      cardDirection: 'en-tr',
      typeAnswer: false,
      smartIntervals: true,
      reminder: { enabled: false, hour: 20, minute: 0 },
    },
    cards: {},
    customWords: [],
    enrolledDecks: ['core', 'academic'],
    history: {},
    journal: [],
    lastSession: null,
    completedStories: [],
    bookmarks: [],
    rescuedLeeches: 0,
    aiStories: [],
    coachReport: null,
  };
}

export type Action =
  | { type: 'review'; wordId: string; outcome: ReviewOutcome; now?: number }
  | { type: 'addXp'; amount: number; now?: number }
  | { type: 'addWord'; word: Word; box?: BoxNumber; now?: number }
  | { type: 'updateWord'; word: Word }
  | { type: 'deleteWord'; wordId: string }
  | { type: 'introduce'; wordId: string; box?: BoxNumber; now?: number }
  | { type: 'setBox'; wordId: string; box: BoxNumber; now?: number }
  | { type: 'rescueLeech'; wordId: string; now?: number }
  | { type: 'saveJournal'; entry: JournalEntry }
  | { type: 'setProfile'; patch: Partial<Profile> }
  | { type: 'enrollDeck'; deckId: string }
  | { type: 'unenrollDeck'; deckId: string }
  | { type: 'finishSession'; result: SessionResult }
  | { type: 'logStudyTime'; ms: number; now?: number }
  | { type: 'completeStory'; storyId: string }
  | { type: 'toggleBookmark'; id: string }
  | { type: 'addAiStory'; story: StoryData }
  | { type: 'deleteAiStory'; id: string }
  | { type: 'setCoachReport'; report: CoachReport }
  | { type: 'import'; state: AppState }
  | { type: 'reset' };

function emptyDay(): DayStat {
  return { reviews: 0, correct: 0, xp: 0, newWords: 0, studyMs: 0, lateNight: false };
}

function bumpDay(state: AppState, now: number, patch: (d: DayStat) => DayStat): AppState['history'] {
  const key = dayKey(now);
  const current = state.history[key] ?? emptyDay();
  const hour = new Date(now).getHours();
  const next = patch(current);
  return { ...state.history, [key]: { ...next, lateNight: next.lateNight || hour >= 22 } };
}

function addXp(state: AppState, amount: number, now: number): AppState {
  if (amount === 0) return state;
  return {
    ...state,
    profile: { ...state.profile, xp: state.profile.xp + amount },
    history: bumpDay(state, now, (d) => ({ ...d, xp: d.xp + amount })),
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'review': {
      const now = action.now ?? Date.now();
      const prev = state.cards[action.wordId];
      const card = applyReview(prev, action.wordId, action.outcome, now, state.profile.smartIntervals);
      const correct = action.outcome !== 'forgot';
      const next: AppState = {
        ...state,
        cards: { ...state.cards, [action.wordId]: card },
        history: bumpDay(state, now, (d) => ({
          ...d,
          reviews: d.reviews + 1,
          correct: d.correct + (correct ? 1 : 0),
          newWords: d.newWords + (prev ? 0 : 1),
        })),
      };
      return addXp(next, XP[action.outcome], now);
    }
    case 'addXp':
      return addXp(state, action.amount, action.now ?? Date.now());
    case 'addWord': {
      const now = action.now ?? Date.now();
      const exists = state.customWords.some((w) => w.id === action.word.id);
      const customWords = exists
        ? state.customWords.map((w) => (w.id === action.word.id ? action.word : w))
        : [...state.customWords, { ...action.word, custom: !SEED_WORD_MAP[action.word.id], createdAt: action.word.createdAt ?? now }];
      const box = action.box ?? 1;
      // Kutu 1 dışında başlatılan kelime zaten biliniyor kabul edilir: o kutunun aralığı kadar sonra sorulur.
      const card = state.cards[action.word.id] ?? {
        ...newCard(action.word.id, box, now),
        dueDay: dayIndex(now) + (box > 1 ? BOX_INTERVALS[box] : 0),
      };
      return { ...state, customWords, cards: { ...state.cards, [action.word.id]: card } };
    }
    case 'updateWord':
      return {
        ...state,
        customWords: state.customWords.some((w) => w.id === action.word.id)
          ? state.customWords.map((w) => (w.id === action.word.id ? action.word : w))
          : [...state.customWords, { ...action.word, custom: !SEED_WORD_MAP[action.word.id] }],
      };
    case 'deleteWord': {
      const cards = { ...state.cards };
      delete cards[action.wordId];
      return {
        ...state,
        cards,
        customWords: state.customWords.filter((w) => w.id !== action.wordId),
      };
    }
    case 'introduce': {
      if (state.cards[action.wordId]) return state;
      const now = action.now ?? Date.now();
      return {
        ...state,
        cards: { ...state.cards, [action.wordId]: newCard(action.wordId, action.box ?? 1, now) },
      };
    }
    case 'setBox': {
      const now = action.now ?? Date.now();
      const prev = state.cards[action.wordId] ?? newCard(action.wordId, action.box, now);
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.wordId]: { ...prev, box: action.box, dueDay: dayIndex(now) + BOX_INTERVALS[action.box] },
        },
      };
    }
    case 'rescueLeech': {
      const now = action.now ?? Date.now();
      const prev = state.cards[action.wordId];
      if (!prev) return state;
      const box = clampBox(2);
      const next: AppState = {
        ...state,
        rescuedLeeches: state.rescuedLeeches + 1,
        cards: {
          ...state.cards,
          [action.wordId]: { ...prev, box, failStreak: 0, dueDay: dayIndex(now) + BOX_INTERVALS[box], lastReviewed: now },
        },
      };
      return addXp(next, 25, now);
    }
    case 'saveJournal':
      return { ...state, journal: [action.entry, ...state.journal] };
    case 'setProfile':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'enrollDeck':
      return state.enrolledDecks.includes(action.deckId)
        ? state
        : { ...state, enrolledDecks: [...state.enrolledDecks, action.deckId] };
    case 'unenrollDeck':
      return { ...state, enrolledDecks: state.enrolledDecks.filter((d) => d !== action.deckId) };
    case 'finishSession':
      return { ...state, lastSession: action.result };
    case 'logStudyTime': {
      const now = action.now ?? Date.now();
      return { ...state, history: bumpDay(state, now, (d) => ({ ...d, studyMs: d.studyMs + action.ms })) };
    }
    case 'completeStory':
      return state.completedStories.includes(action.storyId)
        ? state
        : { ...state, completedStories: [...state.completedStories, action.storyId] };
    case 'toggleBookmark':
      return {
        ...state,
        bookmarks: state.bookmarks.includes(action.id)
          ? state.bookmarks.filter((b) => b !== action.id)
          : [...state.bookmarks, action.id],
      };
    case 'addAiStory':
      return { ...state, aiStories: [action.story, ...state.aiStories].slice(0, 10) };
    case 'deleteAiStory':
      return { ...state, aiStories: state.aiStories.filter((s) => s.id !== action.id) };
    case 'setCoachReport':
      return { ...state, coachReport: action.report };
    case 'import':
      return migrate(action.state);
    case 'reset':
      return createInitialState();
    default:
      return state;
  }
}

/** Kayıtlı veriyi doğrular; eksik alanları varsayılanlarla tamamlar. */
export function migrate(raw: unknown): AppState {
  const base = createInitialState();
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Partial<AppState>;
  if (s.version !== 1) return base;
  return {
    ...base,
    ...s,
    profile: { ...base.profile, ...(s.profile ?? {}) },
    cards: s.cards ?? {},
    customWords: Array.isArray(s.customWords) ? s.customWords : [],
    enrolledDecks: Array.isArray(s.enrolledDecks) ? s.enrolledDecks : base.enrolledDecks,
    history: s.history ?? {},
    journal: Array.isArray(s.journal) ? s.journal : [],
    completedStories: Array.isArray(s.completedStories) ? s.completedStories : [],
    bookmarks: Array.isArray(s.bookmarks) ? s.bookmarks : [],
    rescuedLeeches: s.rescuedLeeches ?? 0,
    aiStories: Array.isArray(s.aiStories) ? s.aiStories : [],
    coachReport: s.coachReport ?? null,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? migrate(JSON.parse(raw)) : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Depolama dolu ya da gizli modda; uygulama bellekte çalışmaya devam eder.
  }
}
