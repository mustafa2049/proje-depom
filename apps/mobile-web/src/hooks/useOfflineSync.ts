import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { syncPendingReviews } from '../services/offlineSync';

/**
 * Uygulama açıldığında, bağlantı geri geldiğinde (web: online/focus) ve uygulama öne geldiğinde
 * bekleyen çevrimdışı değerlendirmeleri otomatik olarak senkronize eder.
 */
export function useOfflineSync(): void {
  useEffect(() => {
    void syncPendingReviews();

    if (Platform.OS === 'web') {
      const onRecover = () => void syncPendingReviews();
      window.addEventListener('online', onRecover);
      window.addEventListener('focus', onRecover);
      return () => {
        window.removeEventListener('online', onRecover);
        window.removeEventListener('focus', onRecover);
      };
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncPendingReviews();
      }
    });
    return () => subscription.remove();
  }, []);
}
