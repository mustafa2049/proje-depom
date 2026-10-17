import { create } from 'zustand';

import { ApiError } from '../services/api';
import { api } from '../services/apiClient';
import { saveLookupToDeck, type SaveOutcome } from '../services/wordCards';
import type { CEFRLevel, LookupResult, ReadingPassage, ReadingPassageSummary } from '../types/api';
import { cleanWord } from '../utils/tokenize';

export type LevelFilter = CEFRLevel | 'ALL';

export interface LookupState {
  word: string;
  sentence: string;
  status: 'loading' | 'ready' | 'error';
  result: LookupResult | null;
  errorMessage: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'duplicate' | 'error';
}

export interface ReaderState {
  levelFilter: LevelFilter;
  passages: ReadingPassageSummary[];
  listStatus: 'idle' | 'loading' | 'ready' | 'error';
  listError: string | null;
  current: ReadingPassage | null;
  currentStatus: 'idle' | 'loading' | 'ready' | 'error';
  currentError: string | null;
  lookup: LookupState | null;
  /** Bu oturumda desteye eklenen kelimeler (küçük harf). Yinelenen eklemeyi engeller. */
  savedTerms: string[];

  setLevelFilter: (filter: LevelFilter) => void;
  loadPassages: () => Promise<void>;
  openPassage: (id: string) => Promise<void>;
  closePassage: () => void;
  lookupWord: (word: string, sentence: string) => Promise<void>;
  closeLookup: () => void;
  saveLookup: () => Promise<void>;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
}

export const useReaderStore = create<ReaderState>()((set, get) => ({
  levelFilter: 'ALL',
  passages: [],
  listStatus: 'idle',
  listError: null,
  current: null,
  currentStatus: 'idle',
  currentError: null,
  lookup: null,
  savedTerms: [],

  setLevelFilter(filter) {
    set({ levelFilter: filter });
    void get().loadPassages();
  },

  async loadPassages() {
    const { levelFilter } = get();
    set({ listStatus: 'loading', listError: null });
    try {
      const { passages } = await api.reader.passages(levelFilter === 'ALL' ? undefined : levelFilter);
      set({ passages, listStatus: 'ready' });
    } catch (error) {
      set({ listStatus: 'error', listError: messageOf(error) });
    }
  },

  async openPassage(id) {
    set({ currentStatus: 'loading', currentError: null, current: null, lookup: null });
    try {
      const { passage } = await api.reader.passage(id);
      set({ current: passage, currentStatus: 'ready' });
    } catch (error) {
      set({ currentStatus: 'error', currentError: messageOf(error) });
    }
  },

  closePassage() {
    set({ current: null, currentStatus: 'idle', currentError: null, lookup: null });
  },

  async lookupWord(word, sentence) {
    const key = cleanWord(word);
    if (!key) {
      return;
    }
    set({
      lookup: { word: key, sentence, status: 'loading', result: null, errorMessage: null, saveStatus: 'idle' },
    });
    try {
      const result = await api.reader.lookup(key, sentence);
      const saved = get().savedTerms.includes(key);
      set((state) => ({
        lookup: state.lookup?.word === key
          ? { ...state.lookup, status: 'ready', result, saveStatus: saved ? 'saved' : 'idle' }
          : state.lookup,
      }));
    } catch (error) {
      set((state) => ({
        lookup: state.lookup?.word === key
          ? { ...state.lookup, status: 'error', errorMessage: messageOf(error) }
          : state.lookup,
      }));
    }
  },

  closeLookup() {
    set({ lookup: null });
  },

  async saveLookup() {
    const lookup = get().lookup;
    if (!lookup?.result || lookup.saveStatus === 'saving' || lookup.saveStatus === 'saved') {
      return;
    }

    set({ lookup: { ...lookup, saveStatus: 'saving' } });
    try {
      const outcome: SaveOutcome = await saveLookupToDeck(lookup.result);
      set((state) => ({
        savedTerms: [...state.savedTerms, lookup.word],
        lookup: state.lookup ? { ...state.lookup, saveStatus: outcome === 'created' ? 'saved' : 'duplicate' } : null,
      }));
    } catch (error) {
      set((state) => ({
        lookup: state.lookup
          ? { ...state.lookup, saveStatus: error instanceof ApiError && error.status === 409 ? 'duplicate' : 'error' }
          : null,
      }));
    }
  },
}));
