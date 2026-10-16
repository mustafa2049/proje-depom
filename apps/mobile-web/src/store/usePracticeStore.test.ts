import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { session } from '../services/session';
import { installFakeFetch } from '../test/fakeFetch';
import { selectCurrentExercise, selectModeCount, usePracticeStore } from './usePracticeStore';

const EXERCISES = [
  { id: 'wo-1', type: 'WORD_ORDER', level: 'A1', translationTR: 'Siyah kahveyi severim.', words: ['coffee', 'black', 'I', 'like'], answer: 'I like black coffee.' },
  { id: 'cl-1', type: 'CLOZE', level: 'A1', source: 'BANK', sentence: 'I am ___ Istanbul.', options: ['in', 'on', 'at', 'from'], answerIndex: 3, explanationTR: 'from' },
  { id: 'tr-1', type: 'TRANSLATION', level: 'A1', sourceTR: 'Bugün hava çok güzel.', referenceEN: 'The weather is very nice today.' },
];

const ANALYSIS = { score: 90, isCorrect: true, correctedSentence: 'The weather is nice today.', nativeAlternative: 'It is lovely today.', grammarNotesTR: [], naturalnessScore: 9 };

describe('usePracticeStore', () => {
  beforeEach(() => {
    session.set({ accessToken: 'a', refreshToken: 'r' });
    usePracticeStore.setState({
      exercises: [],
      status: 'idle',
      cursor: { WORD_ORDER: 0, CLOZE: 0, TRANSLATION: 0 },
      scores: {
        WORD_ORDER: { attempted: 0, correct: 0 },
        CLOZE: { attempted: 0, correct: 0 },
        TRANSLATION: { attempted: 0, correct: 0 },
      },
      lastAnalysis: null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    session.set(null);
  });

  it('alıştırmaları yükler ve seviyeyi sorguya taşır', async () => {
    const { requests } = installFakeFetch({
      'GET /api/practice/exercises': () => ({ body: { level: 'A1', exercises: EXERCISES } }),
    });

    await usePracticeStore.getState().loadExercises('A1');

    expect(requests[0]?.query.get('level')).toBe('A1');
    expect(usePracticeStore.getState().exercises).toHaveLength(3);
    expect(usePracticeStore.getState().status).toBe('ready');
  });

  it('moda göre mevcut soruyu ve mod sayısını seçer', () => {
    usePracticeStore.setState({ exercises: EXERCISES as never });
    const state = usePracticeStore.getState();

    expect(selectCurrentExercise(state, 'CLOZE')?.id).toBe('cl-1');
    expect(selectModeCount(state, 'WORD_ORDER')).toBe(1);
  });

  it('sonuç kaydeder ve bir sonraki soruya geçer; liste bitince mevcut soru yoktur', () => {
    usePracticeStore.setState({ exercises: EXERCISES as never });

    usePracticeStore.getState().recordResult('WORD_ORDER', true);
    usePracticeStore.getState().advance('WORD_ORDER');

    const state = usePracticeStore.getState();
    expect(state.scores.WORD_ORDER).toEqual({ attempted: 1, correct: 1 });
    expect(selectCurrentExercise(state, 'WORD_ORDER')).toBeUndefined();
  });

  it('çeviri değerlendirmesi analiz sonucunu tutar ve skoru günceller', async () => {
    usePracticeStore.setState({ exercises: EXERCISES as never });
    const { requests } = installFakeFetch({
      'POST /api/ai/analyze-sentence': () => ({ body: { provider: 'mock', analysis: ANALYSIS } }),
    });

    await usePracticeStore.getState().evaluateTranslation('The weather is nice today.', 'Bugün hava çok güzel.');

    expect(requests[0]?.body).toEqual({ sentence: 'The weather is nice today.', sourceTR: 'Bugün hava çok güzel.' });
    expect(usePracticeStore.getState().lastAnalysis?.score).toBe(90);
    expect(usePracticeStore.getState().scores.TRANSLATION).toEqual({ attempted: 1, correct: 1 });
  });
});
