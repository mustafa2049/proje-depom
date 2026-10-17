import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { previewNextIntervals, type ReviewQuality } from '@proje-depom/shared';

import { FlipCard } from '../../components/flashcard/FlipCard';
import { SyncBanner } from '../../components/sync/SyncBanner';
import { SessionSummary } from '../../components/flashcard/SessionSummary';
import { SRSButtons } from '../../components/flashcard/SRSButtons';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { hapticError, hapticSuccess } from '../../services/feedback';
import { NORMAL_RATE, SLOW_RATE, speak, stop } from '../../services/ttsService';
import { selectCurrentItem, selectRemaining, useStudyStore } from '../../store/useStudyStore';
import { mapKeyToAction } from '../../utils/keyboard';

/** Odak modu: bu ekran alt sekme çubuğunu gizler (bkz. (tabs)/_layout.tsx). */
export default function StudyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ deckId?: string }>();
  const deckId = typeof params.deckId === 'string' ? params.deckId : undefined;

  const status = useStudyStore((state) => state.status);
  const queue = useStudyStore((state) => state.queue);
  const currentIndex = useStudyStore((state) => state.currentIndex);
  const isFlipped = useStudyStore((state) => state.isFlipped);
  const isSubmitting = useStudyStore((state) => state.isSubmitting);
  const errorMessage = useStudyStore((state) => state.errorMessage);
  const lastXpGain = useStudyStore((state) => state.lastXpGain);
  const sessionStats = useStudyStore((state) => state.sessionStats);
  const pendingCount = useStudyStore((state) => state.pendingReviews.length);
  const isOffline = useStudyStore((state) => state.isOffline);
  const loadDueQueue = useStudyStore((state) => state.loadDueQueue);
  const flipCard = useStudyStore((state) => state.flipCard);
  const submitReview = useStudyStore((state) => state.submitReview);
  const resetSession = useStudyStore((state) => state.resetSession);

  const [slowMode, setSlowMode] = useState(false);
  const [shakeSignal, setShakeSignal] = useState(0);
  const slowRef = useRef(false);
  slowRef.current = slowMode;

  const item = selectCurrentItem({ queue, currentIndex });
  const remaining = selectRemaining({ queue, currentIndex });
  const progress = queue.length > 0 ? currentIndex / queue.length : 0;

  const previews = useMemo(
    () =>
      previewNextIntervals(
        item?.srs
          ? { repetitions: item.srs.repetitions, easeFactor: item.srs.easeFactor, interval: item.srs.interval }
          : null,
        new Date(),
      ),
    [item],
  );

  useEffect(() => {
    // Önceki ekrandaki odaklı buton (ör. "Tüm Tekrarları Başlat") Space/Enter ile yeniden tetiklenmesin.
    if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    void loadDueQueue(deckId);
    return () => {
      stop();
      resetSession();
    };
    // Oturum yalnızca deste değiştiğinde yeniden başlar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  // Web klavye kısayolları: Space/Enter çevirir, 1-4 değerlendirir, R telaffuzu tekrarlar.
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as { tagName?: string } | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        return;
      }

      const state = useStudyStore.getState();
      const action = mapKeyToAction(event.key, state.isFlipped);
      if (action.type === 'none') {
        return;
      }

      event.preventDefault();
      if (action.type === 'flip') {
        flipCard();
      } else if (action.type === 'speak') {
        const current = selectCurrentItem(state);
        if (current) {
          speak(current.card.term, { rate: slowRef.current ? SLOW_RATE : NORMAL_RATE });
        }
      } else {
        void reviewWithFeedback(action.quality);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // Yalnızca stabil store eylemleri kullanılır; güncel durum getState() ile okunur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reviewWithFeedback(quality: ReviewQuality) {
    if (quality === 0) {
      setShakeSignal((value) => value + 1);
      hapticError();
    } else {
      hapticSuccess();
    }
    await submitReview(quality);
  }

  function exit() {
    stop();
    router.replace('/');
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable accessibilityRole="button" accessibilityLabel="Çalışmayı kapat" onPress={exit} className="p-2">
          <X size={22} color="#E2E8F0" />
        </Pressable>
        <View className="flex-1">
          <ProgressBar value={progress} />
        </View>
        {status === 'studying' ? <Text className="text-sm text-muted">{remaining} kart kaldı</Text> : null}
        {lastXpGain > 0 && status === 'studying' ? <Text className="text-sm font-bold text-accent">+{lastXpGain} XP</Text> : null}
      </View>

      {isOffline ? (
        <View className="mx-4 rounded-xl bg-warning/15 px-4 py-2">
          <Text className="text-center text-xs text-warning">Çevrimdışısınız: önbellekteki kuyruk kullanılıyor.</Text>
        </View>
      ) : null}
      {pendingCount > 0 ? (
        <View className="mx-4">
          <SyncBanner />
        </View>
      ) : null}

      <ScrollView contentContainerClassName="flex-grow justify-center gap-6 px-4 pb-8 pt-4">
        {status === 'loading' || status === 'idle' ? <ActivityIndicator color="#38BDF8" /> : null}

        {status === 'error' ? (
          <View className="items-center gap-4">
            <Text className="text-center text-base text-danger">{errorMessage ?? 'Kuyruk yüklenemedi'}</Text>
            <Button title="Tekrar dene" variant="secondary" onPress={() => void loadDueQueue(deckId)} />
          </View>
        ) : null}

        {status === 'empty' ? (
          <View className="items-center gap-4">
            <Text className="text-center text-lg text-white">Bugün için tekrar edilecek kart yok.</Text>
            <Button title="Dashboard'a dön" variant="secondary" onPress={exit} />
          </View>
        ) : null}

        {status === 'finished' ? <SessionSummary stats={sessionStats} onDone={exit} /> : null}

        {status === 'studying' && item ? (
          <>
            <FlipCard
              card={item.card}
              isFlipped={isFlipped}
              onFlip={flipCard}
              slowMode={slowMode}
              onToggleSlow={() => setSlowMode((value) => !value)}
              shakeSignal={shakeSignal}
            />
            <SRSButtons
              isFlipped={isFlipped}
              previews={previews}
              disabled={isSubmitting}
              onShowAnswer={flipCard}
              onReview={(quality) => void reviewWithFeedback(quality)}
            />
            {errorMessage ? <Text className="text-center text-sm text-danger">{errorMessage}</Text> : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
