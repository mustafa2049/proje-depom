import { useConnectionStore, type BackendMode } from '../store/useConnectionStore';
import { useDeckStore } from '../store/useDeckStore';
import { useStatsStore } from '../store/useStatsStore';
import { useStudyStore } from '../store/useStudyStore';
import { useTutorStore } from '../store/useTutorStore';

/**
 * Sunucu ile sunucusuz mod arasında geçiş yapar. Önceki moda ait ekran verileri (deste listesi,
 * istatistik, çalışma önbelleği, sohbet) temizlenir; bekleyen çevrimdışı değerlendirmeler korunur.
 */
export function switchBackendMode(mode: BackendMode): void {
  if (useConnectionStore.getState().mode === mode) {
    return;
  }
  useConnectionStore.getState().setMode(mode);

  useStudyStore.getState().resetSession();
  useStudyStore.setState({ cachedDueQueue: null, isOffline: false });
  useDeckStore.setState({ decks: [], status: 'idle', errorMessage: null });
  useStatsStore.setState({ overview: null, status: 'idle', errorMessage: null });
  useTutorStore.getState().startNewSession();
  useTutorStore.setState({ sessions: [], sessionsStatus: 'idle' });
}
