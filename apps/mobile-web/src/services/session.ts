import type { AuthTokens } from '../types/api';

type Listener = (tokens: AuthTokens | null) => void;

/**
 * Bellek içi oturum köprüsü. API istemcisi token'ları buradan okur ve yeniler;
 * kalıcı depolama ve oturum sonlandırma dinleyiciler (auth store) tarafından yapılır.
 */
let current: AuthTokens | null = null;
const listeners = new Set<Listener>();

export const session = {
  get(): AuthTokens | null {
    return current;
  },

  set(tokens: AuthTokens | null): void {
    current = tokens;
    for (const listener of listeners) {
      listener(tokens);
    }
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
