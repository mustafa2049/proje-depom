import {
  calculateNextReview,
  CORRECT_THRESHOLD,
  NEW_CARD_STATE,
  REVIEW_QUALITY,
  XP_BY_QUALITY,
  type ReviewQuality,
  type SrsSnapshot,
} from '@proje-depom/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ApiError, isNetworkError } from '../services/api';
import { api } from '../services/apiClient';
import { STORAGE_KEYS } from '../services/appStorageKeys';
import { appStorage } from '../services/storage';
import type { CardView, SrsProgress, StudyQueueItem } from '../types/api';

/** Bir oturumda getirilecek en fazla kart sayısı. */
export const SESSION_LIMIT = 30;

export interface StudyItem {
  card: CardView;
  srs: SrsProgress | null;
  isNew: boolean;
}

export interface SessionStats {
  reviewedCount: number;
  correctCount: number;
  xpEarned: number;
  startedAt: number | null;
  finishedAt: number | null;
}

/** Çevrimdışıyken yapılan ve henüz sunucuya ulaşmamış değerlendirme. */
export interface PendingReview {
  id: string;
  cardId: string;
  quality: ReviewQuality;
  durationMs: number;
  reviewedAt: string;
}

/** Son çevrimiçi yüklemenin kuyruk anlık görüntüsü (çevrimdışı çalışma için). */
export interface CachedDueQueue {
  deckId: string | null;
  items: StudyItem[];
  savedAt: string;
}

export type StudyStatus = 'idle' | 'loading' | 'studying' | 'finished' | 'empty' | 'error';

export interface StudyState {
  status: StudyStatus;
  deckId: string | null;
  queue: StudyItem[];
  currentIndex: number;
  isFlipped: boolean;
  cardStartTimeMs: number | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  lastXpGain: number;
  sessionStats: SessionStats;
  pendingReviews: PendingReview[];
  cachedDueQueue: CachedDueQueue | null;
  /** Son işlem ağ hatasıyla sonuçlandıysa (önbellek veya yerel tahmin kullanılıyor). */
  isOffline: boolean;

  loadDueQueue: (deckId?: string) => Promise<void>;
  flipCard: () => void;
  submitReview: (quality: ReviewQuality) => Promise<void>;
  flushPendingReviews: () => Promise<void>;
  resetSession: () => void;
}

export function emptySessionStats(): SessionStats {
  return { reviewedCount: 0, correctCount: 0, xpEarned: 0, startedAt: null, finishedAt: null };
}

const INITIAL_STATE = {
  status: 'idle' as StudyStatus,
  deckId: null,
  queue: [] as StudyItem[],
  currentIndex: 0,
  isFlipped: false,
  cardStartTimeMs: null,
  isSubmitting: false,
  errorMessage: null,
  lastXpGain: 0,
  sessionStats: emptySessionStats(),
};

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function snapshotOf(item: StudyItem): SrsSnapshot {
  return item.srs
    ? { repetitions: item.srs.repetitions, easeFactor: item.srs.easeFactor, interval: item.srs.interval }
    : NEW_CARD_STATE;
}

function toStudyItem(item: StudyQueueItem): StudyItem {
  return { card: item.card, srs: item.srs, isNew: item.isNew };
}

/** Sunucu yanıtı geldiğinde kullanılan kesin kart durumu. */
interface Outcome {
  srs: SrsProgress;
  xpEarned: number;
}

/** Sunucuya ulaşılamadığında SRS algoritmasıyla hesaplanan yerel tahmin. */
function localOutcome(item: StudyItem, quality: ReviewQuality, reviewedAt: Date): Outcome {
  const result = calculateNextReview(snapshotOf(item), quality, reviewedAt);
  return {
    srs: {
      status: result.status,
      repetitions: result.repetitions,
      easeFactor: result.easeFactor,
      interval: result.interval,
      nextReviewDate: result.nextReviewDate.toISOString(),
    },
    xpEarned: XP_BY_QUALITY[quality],
  };
}

/**
 * Önbellekteki kuyruktan, bekleyen değerlendirmesi olan kartları çıkarır.
 * Bu sayede çevrimdışıyken aynı kart iki kez sorulmaz.
 */
export function filterCachedItems(items: readonly StudyItem[], pending: readonly PendingReview[]): StudyItem[] {
  const pendingIds = new Set(pending.map((review) => review.cardId));
  return items.filter((item) => !pendingIds.has(item.card.id));
}

/** Aynı anda birden fazla flush çağrısını tek bir döngüde birleştirmek için. */
let flushing = false;

/** Sunucunun kalıcı olarak reddettiği (kart yok, geçersiz istek) değerlendirmeler düşürülür. */
function isPermanentRejection(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 400 || error.status === 404);
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => {
      /** Oturumu verilen kartlarla başlatır; liste boşsa "empty" durumuna geçer. */
      function startSession(items: StudyItem[]): void {
        if (items.length === 0) {
          set({ status: 'empty', queue: [], currentIndex: 0, cardStartTimeMs: null, sessionStats: emptySessionStats() });
          return;
        }
        const now = Date.now();
        set({
          status: 'studying',
          queue: items,
          currentIndex: 0,
          isFlipped: false,
          cardStartTimeMs: now,
          lastXpGain: 0,
          sessionStats: { ...emptySessionStats(), startedAt: now },
        });
      }

      /** Değerlendirme sonucunu uygular: istatistik, XP, kuyruk, önbellek ve bir sonraki karta geçiş. */
      function advance(item: StudyItem, quality: ReviewQuality, outcome: Outcome, offline: boolean): void {
        const updated: StudyItem = { card: item.card, srs: outcome.srs, isNew: false };

        set((state) => {
          const queue = quality === REVIEW_QUALITY.AGAIN ? [...state.queue, updated] : state.queue;
          const nextIndex = state.currentIndex + 1;
          const finished = nextIndex >= queue.length;

          // Again dışındaki bir değerlendirme kartı bugünün kuyruğundan çıkarır.
          const cachedDueQueue =
            state.cachedDueQueue && quality !== REVIEW_QUALITY.AGAIN
              ? { ...state.cachedDueQueue, items: state.cachedDueQueue.items.filter((cached) => cached.card.id !== item.card.id) }
              : state.cachedDueQueue;

          return {
            queue,
            currentIndex: nextIndex,
            isFlipped: false,
            isSubmitting: false,
            isOffline: offline,
            status: finished ? 'finished' : 'studying',
            cardStartTimeMs: finished ? null : Date.now(),
            lastXpGain: outcome.xpEarned,
            cachedDueQueue,
            sessionStats: {
              ...state.sessionStats,
              reviewedCount: state.sessionStats.reviewedCount + 1,
              correctCount: state.sessionStats.correctCount + (quality >= CORRECT_THRESHOLD ? 1 : 0),
              xpEarned: state.sessionStats.xpEarned + outcome.xpEarned,
              finishedAt: finished ? Date.now() : null,
            },
          };
        });
      }

      return {
        ...INITIAL_STATE,
        pendingReviews: [],
        cachedDueQueue: null,
        isOffline: false,

        async loadDueQueue(deckId) {
          const requestedDeck = deckId ?? null;
          set({ status: 'loading', deckId: requestedDeck, errorMessage: null, isFlipped: false });

          // Önceki oturumdan kalan çevrimdışı değerlendirmeler önce gönderilmeye çalışılır.
          await get().flushPendingReviews();

          try {
            const response = await api.srs.due({ limit: SESSION_LIMIT, deckId });
            const items = response.items.map(toStudyItem);
            set({
              cachedDueQueue: { deckId: requestedDeck, items, savedAt: new Date().toISOString() },
              isOffline: false,
            });
            startSession(items);
          } catch (error) {
            const cache = get().cachedDueQueue;
            if (isNetworkError(error) && cache && cache.deckId === requestedDeck) {
              set({ isOffline: true });
              startSession(filterCachedItems(cache.items, get().pendingReviews));
              return;
            }
            set({ status: 'error', errorMessage: messageOf(error) });
          }
        },

        flipCard() {
          const state = get();
          if (state.status === 'studying' && !state.isFlipped) {
            set({ isFlipped: true });
          }
        },

        async submitReview(quality) {
          const state = get();
          const item = state.queue[state.currentIndex];
          if (state.status !== 'studying' || !state.isFlipped || state.isSubmitting || !item) {
            return;
          }

          const reviewedAt = new Date();
          const durationMs = Math.max(0, reviewedAt.getTime() - (state.cardStartTimeMs ?? reviewedAt.getTime()));
          set({ isSubmitting: true, errorMessage: null });

          try {
            const result = await api.srs.review({
              cardId: item.card.id,
              quality,
              durationMs,
              reviewedAt: reviewedAt.toISOString(),
            });
            advance(
              item,
              quality,
              {
                srs: {
                  status: result.status as SrsProgress['status'],
                  repetitions: result.repetitions,
                  easeFactor: result.easeFactor,
                  interval: result.interval,
                  nextReviewDate: result.nextReviewDate,
                },
                xpEarned: result.xpEarned,
              },
              false,
            );
          } catch (error) {
            if (!isNetworkError(error)) {
              set({ isSubmitting: false, errorMessage: messageOf(error) });
              return;
            }

            // Çevrimdışı: değerlendirme kuyruğa yazılır, kart yerel SRS tahminiyle ilerler.
            const pending: PendingReview = {
              id: createId(),
              cardId: item.card.id,
              quality,
              durationMs,
              reviewedAt: reviewedAt.toISOString(),
            };
            set((current) => ({ pendingReviews: [...current.pendingReviews, pending] }));
            advance(item, quality, localOutcome(item, quality, reviewedAt), true);
          }
        },

        async flushPendingReviews() {
          if (flushing) {
            return;
          }
          flushing = true;

          try {
            while (get().pendingReviews.length > 0) {
              const next = get().pendingReviews[0];
              if (!next) {
                break;
              }

              try {
                await api.srs.review({
                  cardId: next.cardId,
                  quality: next.quality,
                  durationMs: next.durationMs,
                  reviewedAt: next.reviewedAt,
                });
              } catch (error) {
                // Hâlâ çevrimdışı, oturum sona ermiş veya geçici sunucu hatası: bekleyenler korunur.
                if (!isPermanentRejection(error)) {
                  break;
                }
              }

              set((current) => ({
                pendingReviews: current.pendingReviews.filter((review) => review.id !== next.id),
              }));
            }
          } finally {
            flushing = false;
          }
        },

        resetSession() {
          set({ ...INITIAL_STATE });
        },
      };
    },
    {
      name: STORAGE_KEYS.studyState,
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({ pendingReviews: state.pendingReviews, cachedDueQueue: state.cachedDueQueue }),
    },
  ),
);

/** Ekranda gösterilen kartı döner. */
export function selectCurrentItem(state: Pick<StudyState, 'queue' | 'currentIndex'>): StudyItem | undefined {
  return state.queue[state.currentIndex];
}

/** Kuyrukta kalan (mevcut dahil) kart sayısı. */
export function selectRemaining(state: Pick<StudyState, 'queue' | 'currentIndex'>): number {
  return Math.max(0, state.queue.length - state.currentIndex);
}
