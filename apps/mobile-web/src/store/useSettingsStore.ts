import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../services/appStorageKeys';
import { appStorage } from '../services/storage';

export type Accent = 'en-US' | 'en-GB';

export interface SettingsState {
  /** Telaffuz aksanı: TTS çağrısında aksan belirtilmezse bu kullanılır. */
  accent: Accent;
  setAccent: (accent: Accent) => void;
}

/** Cihaz başına tercihler (sunucuya gönderilmez). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      accent: 'en-US',
      setAccent: (accent) => set({ accent }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => appStorage),
    },
  ),
);
