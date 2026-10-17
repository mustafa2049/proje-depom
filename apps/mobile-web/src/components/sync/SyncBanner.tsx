import { useState } from 'react';
import { Text, View } from 'react-native';

import { syncPendingReviews } from '../../services/offlineSync';
import { useStudyStore } from '../../store/useStudyStore';
import { Button } from '../ui/Button';

/** Bekleyen çevrimdışı değerlendirme varsa görünür; elle senkronizasyon tetikler. */
export function SyncBanner() {
  const pending = useStudyStore((state) => state.pendingReviews.length);
  const [syncing, setSyncing] = useState(false);

  if (pending === 0) {
    return null;
  }

  async function syncNow() {
    setSyncing(true);
    try {
      await syncPendingReviews();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <View className="gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4">
      <Text className="text-sm font-semibold text-warning">{pending} değerlendirme senkronizasyon bekliyor</Text>
      <Button title="Senkronize Et" variant="secondary" loading={syncing} onPress={() => void syncNow()} />
    </View>
  );
}
