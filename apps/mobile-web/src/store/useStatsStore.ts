import { create } from 'zustand';

import { api } from '../services/apiClient';
import type { StatsOverview } from '../types/api';

export interface StatsState {
  overview: StatsOverview | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;

  loadOverview: () => Promise<void>;
}

export const useStatsStore = create<StatsState>()((set) => ({
  overview: null,
  status: 'idle',
  errorMessage: null,

  async loadOverview() {
    set({ status: 'loading', errorMessage: null });
    try {
      const overview = await api.stats.overview();
      set({ overview, status: 'ready' });
    } catch (error) {
      set({ status: 'error', errorMessage: error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu' });
    }
  },
}));
