import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isNetworkError, ApiError } from '../services/api';
import { api } from '../services/apiClient';
import { appStorage } from '../services/storage';
import { STORAGE_KEYS } from '../services/appStorageKeys';
import { secureStorage } from '../services/secureStorage';
import { session } from '../services/session';
import type { AuthTokens, ProfileUpdateRequest, PublicUser, RegisterRequest } from '../types/api';

export interface AuthState {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  errorMessage: string | null;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: ProfileUpdateRequest) => Promise<void>;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
}

function parseTokens(raw: string | null): AuthTokens | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      errorMessage: null,

      async hydrate() {
        const tokens = parseTokens(await secureStorage.getItem(STORAGE_KEYS.authTokens));
        if (!tokens) {
          set({ isHydrated: true, isAuthenticated: false, user: null });
          return;
        }

        session.set(tokens);
        set({ isHydrated: true, isAuthenticated: true });
        await get().refreshProfile();
      },

      async login(email, password) {
        set({ isLoading: true, errorMessage: null });
        try {
          const response = await api.auth.login(email, password);
          session.set({ accessToken: response.accessToken, refreshToken: response.refreshToken });
          set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false, errorMessage: messageOf(error) });
          throw error;
        }
      },

      async register(input) {
        set({ isLoading: true, errorMessage: null });
        try {
          const response = await api.auth.register(input);
          session.set({ accessToken: response.accessToken, refreshToken: response.refreshToken });
          set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false, errorMessage: messageOf(error) });
          throw error;
        }
      },

      logout() {
        session.set(null);
      },

      async updateProfile(input) {
        set({ errorMessage: null });
        try {
          const { user } = await api.auth.updateProfile(input);
          set({ user });
        } catch (error) {
          set({ errorMessage: messageOf(error) });
          throw error;
        }
      },

      async refreshProfile() {
        if (!session.get()) {
          return;
        }
        try {
          const { user } = await api.auth.me();
          set({ user, isAuthenticated: true });
        } catch (error) {
          // Oturum gerçekten sona erdiyse çık; çevrimdışıysa önbellekteki kullanıcıyla devam et.
          if (error instanceof ApiError && error.status === 401) {
            session.set(null);
          } else if (!isNetworkError(error)) {
            set({ errorMessage: messageOf(error) });
          }
        }
      },
    }),
    {
      name: STORAGE_KEYS.authUser,
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

/** Token değişimlerini kalıcı depolamaya yazar ve oturum sonlandığında durumu temizler. */
session.subscribe((tokens) => {
  if (tokens) {
    void secureStorage.setItem(STORAGE_KEYS.authTokens, JSON.stringify(tokens));
    useAuthStore.setState({ isAuthenticated: true });
    return;
  }

  void secureStorage.removeItem(STORAGE_KEYS.authTokens);
  useAuthStore.setState({ user: null, isAuthenticated: false });
});
