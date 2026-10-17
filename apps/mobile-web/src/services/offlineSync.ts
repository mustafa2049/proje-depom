import { useDeckStore } from '../store/useDeckStore';
import { useStatsStore } from '../store/useStatsStore';
import { useStudyStore } from '../store/useStudyStore';

export interface SyncResult {
  synced: number;
  remaining: number;
}

/**
 * Çevrimdışıyken biriken değerlendirmeleri sunucuya gönderir. Bir şey gönderildiyse
 * istatistik ve deste sayaçlarını yeniler.
 */
export async function syncPendingReviews(): Promise<SyncResult> {
  const before = useStudyStore.getState().pendingReviews.length;
  if (before === 0) {
    return { synced: 0, remaining: 0 };
  }

  await useStudyStore.getState().flushPendingReviews();
  const remaining = useStudyStore.getState().pendingReviews.length;
  const synced = before - remaining;

  if (synced > 0) {
    await Promise.all([useStatsStore.getState().loadOverview(), useDeckStore.getState().loadDecks()]);
  }
  return { synced, remaining };
}
