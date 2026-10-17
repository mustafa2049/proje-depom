import type { SrsStatus } from '@proje-depom/shared';

import { STORAGE_KEYS } from '../appStorageKeys';
import type { KeyValueStorage } from '../keyValueStorage';
import type { AiMessageView, CardView, CEFRLevel, PublicUser } from '../../types/api';

export const LOCAL_DB_VERSION = 1;

/** Kullanıcının bir karttaki SM-2 durumu (sunucudaki UserCardSRS karşılığı). */
export interface LocalSrsRow {
  cardId: string;
  status: SrsStatus | 'LEARNING';
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: string;
  lastReviewedAt: string;
  firstReviewedAt: string;
}

/** Kullanıcının kendi destesi (sistem desteleri uygulamaya gömülüdür, burada tutulmaz). */
export interface LocalDeck {
  id: string;
  title: string;
  description: string | null;
  level: CEFRLevel;
  createdAt: string;
}

/** Bir UTC gününün çalışma özeti (sunucudaki StudySession karşılığı). */
export interface LocalDayActivity {
  date: string;
  cardsReviewed: number;
  correctCount: number;
  durationSec: number;
  xpEarned: number;
}

export interface LocalChatSession {
  id: string;
  /** Okunabilir senaryo etiketi (ör. "Job Interview"), sunucuyla aynı biçimde. */
  scenario: string;
  level: CEFRLevel;
  createdAt: string;
  messages: AiMessageView[];
}

export interface LocalData {
  version: typeof LOCAL_DB_VERSION;
  user: PublicUser | null;
  decks: LocalDeck[];
  cards: CardView[];
  srs: Record<string, LocalSrsRow>;
  activity: Record<string, LocalDayActivity>;
  chats: LocalChatSession[];
}

export function emptyLocalData(): LocalData {
  return { version: LOCAL_DB_VERSION, user: null, decks: [], cards: [], srs: {}, activity: {}, chats: [] };
}

export interface LocalDb {
  read(): Promise<LocalData>;
  /**
   * Verinin bir kopyası üzerinde değişiklik yapar ve başarılı olursa kalıcı olarak yazar.
   * Mutator hata fırlatırsa hiçbir değişiklik uygulanmaz. Güncellemeler sırayla çalışır.
   */
  update<T>(mutator: (data: LocalData) => T): Promise<T>;
  /** Tüm yerel verileri siler. */
  reset(): Promise<void>;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isLocalData(value: unknown): value is LocalData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<LocalData>;
  return (
    candidate.version === LOCAL_DB_VERSION &&
    Array.isArray(candidate.decks) &&
    Array.isArray(candidate.cards) &&
    Array.isArray(candidate.chats) &&
    typeof candidate.srs === 'object' &&
    typeof candidate.activity === 'object'
  );
}

/**
 * Cihaz içi veritabanı: tek bir JSON belgesi olarak anahtar-değer deposunda (native: AsyncStorage) tutulur.
 * İlk okumadan sonra bellekte önbelleğe alınır.
 */
export function createLocalDb(storage: KeyValueStorage, key: string = STORAGE_KEYS.localDb): LocalDb {
  let cache: LocalData | null = null;
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<LocalData> {
    if (cache) {
      return cache;
    }

    const raw = await storage.getItem(key);
    if (!raw) {
      cache = emptyLocalData();
      return cache;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (isLocalData(parsed)) {
        cache = parsed;
        return cache;
      }
    } catch {
      // Bozuk veri aşağıda yedeklenir.
    }

    // Okunamayan veri kaybolmasın diye yedeklenir, uygulama boş veriyle devam eder.
    await storage.setItem(`${key}.backup`, raw);
    cache = emptyLocalData();
    return cache;
  }

  /** İşlemleri sıraya koyar; bir işlemin hatası sonrakileri engellemez. */
  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  }

  return {
    read() {
      return enqueue(async () => clone(await load()));
    },

    update(mutator) {
      return enqueue(async () => {
        const draft = clone(await load());
        const result = mutator(draft);
        await storage.setItem(key, JSON.stringify(draft));
        cache = draft;
        return result;
      });
    },

    reset() {
      return enqueue(async () => {
        await storage.removeItem(key);
        cache = emptyLocalData();
      });
    },
  };
}
