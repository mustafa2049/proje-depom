import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { session } from '../services/session';
import { installFakeFetch } from '../test/fakeFetch';
import { useReaderStore } from './useReaderStore';

const PASSAGE = {
  id: 'p1',
  title: 'A Day at Home',
  level: 'A1',
  category: 'diary',
  estimatedMinutes: 2,
  content: 'I wake up at seven.',
  keyVocabulary: [],
  comprehensionQuestions: [],
};

const DECK_LOOKUP = {
  source: 'DECK',
  word: 'umbrella',
  translationTR: 'şemsiye',
  partOfSpeech: 'noun',
  phonetic: null,
  definitionEN: 'A device used to protect yourself from rain.',
  exampleSentence: 'She opened her umbrella.',
  synonyms: [],
  existingCardId: 'card-1',
};

describe('useReaderStore', () => {
  beforeEach(() => {
    session.set({ accessToken: 'a', refreshToken: 'r' });
    useReaderStore.setState({
      levelFilter: 'ALL',
      passages: [],
      listStatus: 'idle',
      current: null,
      currentStatus: 'idle',
      lookup: null,
      savedTerms: [],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    session.set(null);
  });

  it('seviye filtresini sorguya taşır', async () => {
    const { requests } = installFakeFetch({
      'GET /api/reader/passages': () => ({ body: { passages: [PASSAGE] } }),
    });

    useReaderStore.setState({ levelFilter: 'B1' });
    await useReaderStore.getState().loadPassages();

    expect(requests[0]?.query.get('level')).toBe('B1');
    expect(useReaderStore.getState().passages).toHaveLength(1);
    expect(useReaderStore.getState().listStatus).toBe('ready');
  });

  it('parça açınca içeriğini yükler', async () => {
    installFakeFetch({ 'GET /api/reader/passages/p1': () => ({ body: { passage: PASSAGE } }) });

    await useReaderStore.getState().openPassage('p1');

    expect(useReaderStore.getState().current?.title).toBe('A Day at Home');
    expect(useReaderStore.getState().currentStatus).toBe('ready');
  });

  it('kelime sorgusu sonucu tutar; kart kaynağı bulunduğunda kart kimliğini taşır', async () => {
    installFakeFetch({ 'POST /api/reader/lookup': () => ({ body: DECK_LOOKUP }) });

    await useReaderStore.getState().lookupWord('Umbrella,', 'She forgot her umbrella.');

    const lookup = useReaderStore.getState().lookup;
    expect(lookup?.word).toBe('umbrella');
    expect(lookup?.status).toBe('ready');
    expect(lookup?.result?.existingCardId).toBe('card-1');
  });

  it('sorgu başarısız olursa hata durumunu gösterir', async () => {
    installFakeFetch({
      'POST /api/reader/lookup': () => ({ status: 429, body: { error: { code: 'RATE_LIMITED', message: 'Çok fazla istek' } } }),
    });

    await useReaderStore.getState().lookupWord('x', 'y');

    expect(useReaderStore.getState().lookup).toMatchObject({ status: 'error', errorMessage: 'Çok fazla istek' });
  });

  it('kelimeyi desteye ekler, aynı kelimeyi tekrar eklemez', async () => {
    const { requests } = installFakeFetch({
      'POST /api/reader/lookup': () => ({ body: DECK_LOOKUP }),
      'POST /api/cards': () => ({ status: 201, body: { card: {}, deckId: 'd' } }),
    });

    await useReaderStore.getState().lookupWord('umbrella', 'She opened her umbrella.');
    await useReaderStore.getState().saveLookup();
    await useReaderStore.getState().saveLookup();

    expect(requests.filter((request) => request.path === '/api/cards')).toHaveLength(1);
    expect(useReaderStore.getState().lookup?.saveStatus).toBe('saved');
    expect(useReaderStore.getState().savedTerms).toEqual(['umbrella']);
  });

  it('sunucu 409 dönerse kelime "duplicate" olarak işaretlenir', async () => {
    installFakeFetch({
      'POST /api/reader/lookup': () => ({ body: DECK_LOOKUP }),
      'POST /api/cards': () => ({ status: 409, body: { error: { code: 'CONFLICT', message: 'Bu kelime bu destede zaten var' } } }),
    });

    await useReaderStore.getState().lookupWord('umbrella', 'She opened her umbrella.');
    await useReaderStore.getState().saveLookup();

    expect(useReaderStore.getState().lookup?.saveStatus).toBe('duplicate');
  });
});
