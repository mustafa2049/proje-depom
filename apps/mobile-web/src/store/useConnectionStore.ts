import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { API_BASE_URL } from '../config/env';
import { STORAGE_KEYS } from '../services/appStorageKeys';
import { appStorage } from '../services/storage';

/**
 * remote: istekler `apiUrl` adresindeki sunucuya gider.
 * local: sunucusuz mod; tüm veriler cihazda tutulur ve cihaz içi arka uç kullanılır.
 */
export type BackendMode = 'remote' | 'local';

export interface ConnectionState {
  mode: BackendMode;
  apiUrl: string;
  setMode: (mode: BackendMode) => void;
  /** Normalize edilmiş adres verilmelidir (bkz. normalizeApiUrl). */
  setApiUrl: (url: string) => void;
}

/** Cihaz başına bağlantı tercihleri; uygulama yeniden açıldığında korunur. */
export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      mode: 'remote',
      apiUrl: API_BASE_URL,
      setMode: (mode) => set({ mode }),
      setApiUrl: (apiUrl) => set({ apiUrl }),
    }),
    {
      name: STORAGE_KEYS.connection,
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({ mode: state.mode, apiUrl: state.apiUrl }),
    },
  ),
);

/** Kalıcı bağlantı ayarları yüklenene kadar bekler (oturum açılmadan önce çağrılır). */
export function connectionReady(): Promise<void> {
  if (useConnectionStore.persist.hasHydrated()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const unsubscribe = useConnectionStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

export function isLocalMode(): boolean {
  return useConnectionStore.getState().mode === 'local';
}
