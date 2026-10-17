import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, LogOut } from 'lucide-react-native';

import { ActivityHeatmap } from '../../components/stats/ActivityHeatmap';
import { SRSBreakdownCard } from '../../components/stats/SRSBreakdownCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { TextField } from '../../components/ui/TextField';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore, type Accent } from '../../store/useSettingsStore';
import { useStatsStore } from '../../store/useStatsStore';
import type { CEFRLevel } from '../../types/api';
import { DAILY_GOAL_PRESETS, validateProfileForm, type ProfileFormErrors } from '../../utils/profile';

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const ACCENTS: Array<{ value: Accent; label: string }> = [
  { value: 'en-US', label: 'Amerikan (US)' },
  { value: 'en-GB', label: 'İngiliz (UK)' },
];

/** Profil: istatistikler, ısı haritası, öğrenme hedefi ve ayarlar, oturum kapatma. */
export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const accent = useSettingsStore((state) => state.accent);
  const setAccent = useSettingsStore((state) => state.setAccent);
  const overview = useStatsStore((state) => state.overview);
  const loadOverview = useStatsStore((state) => state.loadOverview);

  const [name, setName] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('A2');
  const [dailyGoal, setDailyGoal] = useState('30');
  const [localAccent, setLocalAccent] = useState<Accent>(accent);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLevel(user.currentLevel);
      setDailyGoal(String(user.dailyGoalCards));
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadOverview();
    }, [loadOverview]),
  );

  async function save() {
    setSaved(false);
    setSaveError(null);
    const validation = validateProfileForm({ name, currentLevel: level, dailyGoal });
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), currentLevel: level, dailyGoalCards: Number(dailyGoal) });
      setAccent(localAccent);
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  function signOut() {
    logout();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-10 pt-4">
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-2xl font-bold text-white" accessibilityRole="header">{user?.name ?? 'Profil'}</Text>
            <Text className="text-sm text-muted">{user?.email}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Badge label={user?.currentLevel ?? '—'} tone="accent" />
            <View className="flex-row items-center gap-1">
              <Flame size={18} color="#F59E0B" />
              <Text className="font-bold text-warning">{user?.streakCount ?? 0}</Text>
            </View>
          </View>
        </View>

        {overview ? (
          <>
            <SRSBreakdownCard stats={overview} />
            <ActivityHeatmap days={overview.heatmap} />
          </>
        ) : (
          <Text className="text-muted">İstatistikler yükleniyor…</Text>
        )}

        <View className="gap-5 rounded-2xl border border-slate-700 bg-surface p-5">
          <Text className="text-lg font-semibold text-white">Ayarlar ve hedef</Text>

          <TextField label="İsim" value={name} onChangeText={setName} error={errors.name} testID="profile-name" />

          <View className="gap-2">
            <Text className="text-sm font-medium text-muted">Seviye</Text>
            <View className="flex-row flex-wrap gap-2">
              {LEVELS.map((item) => (
                <Chip key={item} label={item} active={level === item} onPress={() => setLevel(item)} />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-muted">Günlük kart hedefi</Text>
            <View className="flex-row flex-wrap gap-2">
              {DAILY_GOAL_PRESETS.map((goal) => (
                <Chip key={goal} label={String(goal)} active={dailyGoal === String(goal)} onPress={() => setDailyGoal(String(goal))} />
              ))}
            </View>
            <TextField
              label="Özel hedef (1–200)"
              value={dailyGoal}
              onChangeText={setDailyGoal}
              keyboardType="default"
              error={errors.dailyGoal}
              testID="profile-goal"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-muted">Varsayılan telaffuz aksanı</Text>
            <SegmentedControl options={ACCENTS} value={localAccent} onChange={setLocalAccent} />
          </View>

          {saved ? <Text className="text-sm font-semibold text-success">Ayarlar kaydedildi ✓</Text> : null}
          {saveError ? <Text className="text-sm text-danger">{saveError}</Text> : null}

          <Button title="Ayarları Kaydet" onPress={() => void save()} loading={saving} testID="profile-save" />
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Çıkış yap" onPress={signOut} className="flex-row items-center justify-center gap-2 py-3">
          <LogOut size={16} color="#94A3B8" />
          <Text className="text-muted">Çıkış Yap</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
