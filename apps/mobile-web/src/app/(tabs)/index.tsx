import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, LogOut, Play, Plus } from 'lucide-react-native';

import { AddCardModal } from '../../components/dashboard/AddCardModal';
import { DailyGoalCard } from '../../components/dashboard/DailyGoalCard';
import { DeckListItem } from '../../components/dashboard/DeckListItem';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useStatsStore } from '../../store/useStatsStore';
import { todayActivity } from '../../utils/stats';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const logout = useAuthStore((state) => state.logout);

  const decks = useDeckStore((state) => state.decks);
  const decksStatus = useDeckStore((state) => state.status);
  const decksError = useDeckStore((state) => state.errorMessage);
  const loadDecks = useDeckStore((state) => state.loadDecks);

  const overview = useStatsStore((state) => state.overview);
  const loadOverview = useStatsStore((state) => state.loadOverview);

  const [addOpen, setAddOpen] = useState(false);

  // Çalışma ekranından dönüldüğünde ilerleme ve deste sayaçları yeniden yüklenir.
  useFocusEffect(
    useCallback(() => {
      // Oturum yoksa (ör. yönlendirme öncesi) korumalı uç noktalara istek atılmaz.
      if (!useAuthStore.getState().isAuthenticated) {
        return;
      }
      void refreshProfile();
      void loadDecks();
      void loadOverview();
    }, [refreshProfile, loadDecks, loadOverview]),
  );

  const today = todayActivity(overview);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-10 pt-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-muted">Merhaba,</Text>
            <Text className="text-2xl font-bold text-white" accessibilityRole="header">
              {user?.name ?? 'Öğrenci'}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Badge label={user?.currentLevel ?? '—'} tone="accent" />
            <View className="flex-row items-center gap-1" accessibilityLabel={`Günlük seri ${user?.streakCount ?? 0} gün`}>
              <Flame size={20} color="#F59E0B" />
              <Text className="text-base font-bold text-warning">{user?.streakCount ?? 0}</Text>
            </View>
          </View>
        </View>

        <DailyGoalCard cardsToday={today.cardsReviewed} goal={user?.dailyGoalCards ?? 30} xpToday={today.xpEarned} />

        <View className="gap-3">
          <Button title="Tüm Tekrarları Başlat" icon={<Play size={18} color="#0F172A" />} onPress={() => router.push('/study')} />
          <Button title="Yeni Kelime / Kart Ekle" variant="secondary" icon={<Plus size={18} color="#38BDF8" />} onPress={() => setAddOpen(true)} />
        </View>

        <View className="gap-4">
          <Text className="text-lg font-semibold text-white" accessibilityRole="header">
            Desteler
          </Text>

          {decksStatus === 'loading' && decks.length === 0 ? <Text className="text-muted">Desteler yükleniyor…</Text> : null}

          {decksStatus === 'error' ? (
            <View className="gap-3">
              <Text className="text-danger">{decksError ?? 'Desteler yüklenemedi'}</Text>
              <Button title="Tekrar dene" variant="secondary" onPress={() => void loadDecks()} />
            </View>
          ) : null}

          {decks.map((deck) => (
            <DeckListItem
              key={deck.id}
              deck={deck}
              onStart={() => router.push({ pathname: '/study', params: { deckId: deck.id } })}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Çıkış yap"
          onPress={logout}
          className="flex-row items-center justify-center gap-2 py-3"
        >
          <LogOut size={16} color="#94A3B8" />
          <Text className="text-muted">Çıkış yap</Text>
        </Pressable>
      </ScrollView>

      <AddCardModal visible={addOpen} onClose={() => setAddOpen(false)} decks={decks} />
    </SafeAreaView>
  );
}
