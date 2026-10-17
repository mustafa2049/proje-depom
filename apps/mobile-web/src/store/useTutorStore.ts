import { create } from 'zustand';

import { api } from '../services/apiClient';
import { saveWordToDeck } from '../services/wordCards';
import { scenarioKeyFromLabel } from '../utils/scenarios';
import { cleanWord } from '../utils/tokenize';
import type { AiMessageView, AiSessionSummary, ScenarioKey, VocabularyItem } from '../types/api';

export interface TutorMessage {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  correctedContent: string | null;
  grammarExplanation: string | null;
  nativeAlternative: string | null;
  replyTranslationTR: string | null;
  vocabulary: VocabularyItem[];
  createdAt: string;
  /** Yalnızca kullanıcı mesajları için: düzeltme gerekmediyse true. */
  isPerfect: boolean;
}

export interface TutorState {
  scenario: ScenarioKey;
  sessionId: string | null;
  messages: TutorMessage[];
  sessions: AiSessionSummary[];
  sessionsStatus: 'idle' | 'loading' | 'ready' | 'error';
  isSending: boolean;
  errorMessage: string | null;
  /** Bu oturumda desteye eklenen kelimeler (küçük harf). */
  savedTerms: string[];

  loadSessions: () => Promise<void>;
  openSession: (id: string) => Promise<void>;
  startNewSession: (scenario?: ScenarioKey) => void;
  sendMessage: (text: string) => Promise<boolean>;
  saveVocabulary: (item: VocabularyItem) => Promise<void>;
}

export function toTutorMessage(view: AiMessageView): TutorMessage {
  return {
    id: view.id,
    sender: view.sender,
    content: view.content,
    correctedContent: view.correctedContent,
    grammarExplanation: view.grammarExplanation,
    nativeAlternative: view.nativeAlternative,
    replyTranslationTR: view.replyTranslationTR,
    vocabulary: Array.isArray(view.extractedVocabulary) ? view.extractedVocabulary : [],
    createdAt: view.createdAt,
    isPerfect: view.sender === 'USER' && view.correctedContent === null,
  };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
}

export const useTutorStore = create<TutorState>()((set, get) => ({
  scenario: 'free-talk',
  sessionId: null,
  messages: [],
  sessions: [],
  sessionsStatus: 'idle',
  isSending: false,
  errorMessage: null,
  savedTerms: [],

  async loadSessions() {
    set({ sessionsStatus: 'loading' });
    try {
      const { sessions } = await api.ai.sessions();
      set({ sessions, sessionsStatus: 'ready' });
    } catch (error) {
      set({ sessionsStatus: 'error', errorMessage: messageOf(error) });
    }
  },

  async openSession(id) {
    set({ errorMessage: null });
    try {
      const { session } = await api.ai.session(id);
      set({
        sessionId: session.id,
        scenario: scenarioKeyFromLabel(session.scenario),
        messages: session.messages.map(toTutorMessage),
        savedTerms: [],
      });
    } catch (error) {
      set({ errorMessage: messageOf(error) });
    }
  },

  startNewSession(scenario) {
    set((state) => ({
      scenario: scenario ?? state.scenario,
      sessionId: null,
      messages: [],
      savedTerms: [],
      errorMessage: null,
    }));
  },

  async sendMessage(text) {
    const message = text.trim();
    const { scenario, sessionId } = get();
    if (!message || get().isSending) {
      return false;
    }

    set({ isSending: true, errorMessage: null });
    try {
      const response = await api.ai.chat({
        ...(sessionId ? { sessionId } : {}),
        scenario,
        message,
      });
      set((state) => ({
        sessionId: response.sessionId,
        messages: [...state.messages, toTutorMessage(response.userMessage), toTutorMessage(response.aiMessage)],
        isSending: false,
      }));
      return true;
    } catch (error) {
      set({ isSending: false, errorMessage: messageOf(error) });
      return false;
    }
  },

  async saveVocabulary(item) {
    const key = cleanWord(item.term);
    if (get().savedTerms.includes(key)) {
      return;
    }
    try {
      await saveWordToDeck(item.term, item.example);
      set((state) => ({ savedTerms: [...state.savedTerms, key] }));
    } catch (error) {
      set({ errorMessage: messageOf(error) });
    }
  },
}));
