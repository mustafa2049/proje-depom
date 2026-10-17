/**
 * Anahtar-değer depolama soyutlaması. Zustand persist ve oturum verileri bu arayüzü kullanır.
 */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createMemoryStorage(): KeyValueStorage {
  const data = new Map<string, string>();
  return {
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
  };
}

/** localStorage varsa onu, yoksa bellek içi depolamayı kullanır (web ve test ortamları). */
export function createBrowserStorage(): KeyValueStorage {
  const memory = createMemoryStorage();
  const local = typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : undefined;
  if (!local) {
    return memory;
  }

  return {
    async getItem(key) {
      try {
        return local.getItem(key);
      } catch {
        return memory.getItem(key);
      }
    },
    async setItem(key, value) {
      try {
        local.setItem(key, value);
      } catch {
        await memory.setItem(key, value);
      }
    },
    async removeItem(key) {
      try {
        local.removeItem(key);
      } catch {
        await memory.removeItem(key);
      }
    },
  };
}
