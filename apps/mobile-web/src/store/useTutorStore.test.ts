import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { session } from '../services/session';
import { installFakeFetch } from '../test/fakeFetch';
import { useTutorStore } from './useTutorStore';

const USER_MESSAGE = (id: string, content: string, correctedContent: string | null) => ({
  id,
  sender: 'USER',
  content,
  correctedContent,
  grammarExplanation: 'Açıklama',
  nativeAlternative: null,
  replyTranslationTR: null,
  extractedVocabulary: null,
  createdAt: '2026-10-16T10:00:00.000Z',
});

const AI_MESSAGE = (id: string) => ({
  id,
  sender: 'AI',
  content: 'That sounds nice! Tell me more.',
  correctedContent: null,
  grammarExplanation: null,
  nativeAlternative: null,
  replyTranslationTR: 'Bu kulağa hoş geliyor! Biraz daha anlat.',
  extractedVocabulary: [{ term: 'sounds nice', translationTR: 'hoş geliyor', example: 'That sounds nice!' }],
  createdAt: '2026-10-16T10:00:01.000Z',
});

describe('useTutorStore', () => {
  beforeEach(() => {
    session.set({ accessToken: 'a', refreshToken: 'r' });
    useTutorStore.getState().startNewSession('free-talk');
    useTutorStore.setState({ errorMessage: null, isSending: false, sessions: [] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    session.set(null);
  });

  it('mesaj gönderince kullanıcı ve AI satırlarını ekler, düzeltmeyi kullanıcı satırına bağlar', async () => {
    const { requests } = installFakeFetch({
      'POST /api/ai/chat': () => ({
        body: {
          sessionId: 'session-1',
          userMessage: USER_MESSAGE('u1', 'i like tea', 'I like tea.'),
          aiMessage: AI_MESSAGE('a1'),
        },
      }),
    });

    const ok = await useTutorStore.getState().sendMessage('i like tea');

    expect(ok).toBe(true);
    const state = useTutorStore.getState();
    expect(state.sessionId).toBe('session-1');
    expect(state.messages.map((message) => message.sender)).toEqual(['USER', 'AI']);
    expect(state.messages[0]).toMatchObject({ isPerfect: false, correctedContent: 'I like tea.' });
    expect(state.messages[1]?.vocabulary).toHaveLength(1);
    expect(requests[0]?.body).toEqual({ scenario: 'free-talk', message: 'i like tea' });
  });

  it('sonraki mesajda oturum kimliğini gönderir ve kusursuz cümleyi işaretler', async () => {
    const { requests } = installFakeFetch({
      'POST /api/ai/chat': () => ({
        body: {
          sessionId: 'session-1',
          userMessage: USER_MESSAGE('u2', 'I like tea.', null),
          aiMessage: AI_MESSAGE('a2'),
        },
      }),
    });
    useTutorStore.setState({ sessionId: 'session-1' });

    await useTutorStore.getState().sendMessage('I like tea.');

    expect(requests[0]?.body).toMatchObject({ sessionId: 'session-1' });
    expect(useTutorStore.getState().messages[0]?.isPerfect).toBe(true);
  });

  it('hata durumunda mesaj listesi değişmez, false döner ve hata mesajı tutulur', async () => {
    installFakeFetch({
      'POST /api/ai/chat': () => ({ status: 502, body: { error: { code: 'UPSTREAM_ERROR', message: 'Yapay zeka yanıtı geçerli JSON değil' } } }),
    });

    const ok = await useTutorStore.getState().sendMessage('hello');

    expect(ok).toBe(false);
    expect(useTutorStore.getState().messages).toHaveLength(0);
    expect(useTutorStore.getState().errorMessage).toBe('Yapay zeka yanıtı geçerli JSON değil');
  });

  it('boş mesaj gönderilmez', async () => {
    const { fetchMock } = installFakeFetch({});
    expect(await useTutorStore.getState().sendMessage('   ')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('geçmiş oturumu açınca mesajları ve senaryoyu eşler', async () => {
    installFakeFetch({
      'GET /api/ai/sessions/session-9': () => ({
        body: {
          session: {
            id: 'session-9',
            scenario: 'Job Interview',
            level: 'B1',
            createdAt: '2026-10-15T10:00:00.000Z',
            messages: [USER_MESSAGE('u9', 'hello there', 'Hello there.'), AI_MESSAGE('a9')],
          },
        },
      }),
    });

    await useTutorStore.getState().openSession('session-9');

    const state = useTutorStore.getState();
    expect(state.sessionId).toBe('session-9');
    expect(state.scenario).toBe('job-interview');
    expect(state.messages).toHaveLength(2);
  });

  it('yeni sohbet mesajları ve oturumu sıfırlar', () => {
    useTutorStore.setState({ sessionId: 'x', messages: [{ id: 'm' } as never] });
    useTutorStore.getState().startNewSession('cafe-order');

    const state = useTutorStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.messages).toHaveLength(0);
    expect(state.scenario).toBe('cafe-order');
  });

  it('kelimeyi desteye bir kez ekler, tekrar istek atmaz', async () => {
    const { requests } = installFakeFetch({
      'POST /api/reader/lookup': () => ({
        body: {
          source: 'AI', word: 'sounds nice', translationTR: 'hoş geliyor', partOfSpeech: 'phrasal verb',
          phonetic: null, definitionEN: 'To seem pleasant.', exampleSentence: 'That sounds nice!', synonyms: [], existingCardId: null,
        },
      }),
      'POST /api/cards': () => ({ status: 201, body: { card: {}, deckId: 'd' } }),
    });
    const item = { term: 'sounds nice', translationTR: 'hoş geliyor', example: 'That sounds nice!' };

    await useTutorStore.getState().saveVocabulary(item);
    await useTutorStore.getState().saveVocabulary(item);

    expect(requests.filter((request) => request.path === '/api/cards')).toHaveLength(1);
    expect(useTutorStore.getState().savedTerms).toEqual(['sounds nice']);
  });
});
