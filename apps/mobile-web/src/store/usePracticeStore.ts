import { create } from 'zustand';

import { api } from '../services/apiClient';
import type { CEFRLevel, PracticeExercise, PracticeType, SentenceAnalysis } from '../types/api';

export interface ModeScore {
  attempted: number;
  correct: number;
}

const EMPTY_SCORES: Record<PracticeType, ModeScore> = {
  WORD_ORDER: { attempted: 0, correct: 0 },
  CLOZE: { attempted: 0, correct: 0 },
  TRANSLATION: { attempted: 0, correct: 0 },
};

const EMPTY_CURSOR: Record<PracticeType, number> = { WORD_ORDER: 0, CLOZE: 0, TRANSLATION: 0 };

export interface PracticeState {
  level: CEFRLevel | null;
  exercises: PracticeExercise[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  cursor: Record<PracticeType, number>;
  scores: Record<PracticeType, ModeScore>;
  lastAnalysis: SentenceAnalysis | null;
  isEvaluating: boolean;

  loadExercises: (level?: CEFRLevel) => Promise<void>;
  recordResult: (type: PracticeType, correct: boolean) => void;
  advance: (type: PracticeType) => void;
  evaluateTranslation: (sentence: string, sourceTR: string) => Promise<void>;
  clearAnalysis: () => void;
}

/** Bir moddaki mevcut soruyu döner; liste tükendiyse undefined. */
export function selectCurrentExercise(
  state: Pick<PracticeState, 'exercises' | 'cursor'>,
  type: PracticeType,
): PracticeExercise | undefined {
  const items = state.exercises.filter((exercise) => exercise.type === type);
  return items[state.cursor[type]];
}

export function selectModeCount(state: Pick<PracticeState, 'exercises'>, type: PracticeType): number {
  return state.exercises.filter((exercise) => exercise.type === type).length;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
}

export const usePracticeStore = create<PracticeState>()((set, get) => ({
  level: null,
  exercises: [],
  status: 'idle',
  errorMessage: null,
  cursor: { ...EMPTY_CURSOR },
  scores: { ...EMPTY_SCORES },
  lastAnalysis: null,
  isEvaluating: false,

  async loadExercises(level) {
    set({ status: 'loading', errorMessage: null });
    try {
      const response = await api.practice.exercises({ level, count: 9 });
      set({
        status: 'ready',
        level: response.level,
        exercises: response.exercises,
        cursor: { ...EMPTY_CURSOR },
        scores: { ...EMPTY_SCORES },
        lastAnalysis: null,
      });
    } catch (error) {
      set({ status: 'error', errorMessage: messageOf(error) });
    }
  },

  recordResult(type, correct) {
    set((state) => {
      const current = state.scores[type];
      return {
        scores: {
          ...state.scores,
          [type]: { attempted: current.attempted + 1, correct: current.correct + (correct ? 1 : 0) },
        },
      };
    });
  },

  advance(type) {
    set((state) => ({
      cursor: { ...state.cursor, [type]: state.cursor[type] + 1 },
      lastAnalysis: null,
    }));
  },

  async evaluateTranslation(sentence, sourceTR) {
    if (get().isEvaluating) {
      return;
    }
    set({ isEvaluating: true, errorMessage: null });
    try {
      const response = await api.ai.analyzeSentence({ sentence, sourceTR });
      set({ lastAnalysis: response.analysis, isEvaluating: false });
      get().recordResult('TRANSLATION', response.analysis.isCorrect);
    } catch (error) {
      set({ isEvaluating: false, errorMessage: messageOf(error) });
    }
  },

  clearAnalysis() {
    set({ lastAnalysis: null });
  },
}));
