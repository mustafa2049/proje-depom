import { create } from 'zustand';

import { api } from '../services/apiClient';
import type { CreateCardRequest, DeckSummary } from '../types/api';

export interface DeckState {
  decks: DeckSummary[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;

  loadDecks: () => Promise<void>;
  createCard: (input: CreateCardRequest) => Promise<void>;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
}

export const useDeckStore = create<DeckState>()((set, get) => ({
  decks: [],
  status: 'idle',
  errorMessage: null,

  async loadDecks() {
    set({ status: 'loading', errorMessage: null });
    try {
      const { decks } = await api.decks.list();
      set({ decks, status: 'ready' });
    } catch (error) {
      set({ status: 'error', errorMessage: messageOf(error) });
    }
  },

  async createCard(input) {
    await api.cards.create(input);
    await get().loadDecks();
  },
}));
