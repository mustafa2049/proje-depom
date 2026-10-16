import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuthStore } from '../../store/useAuthStore';
import type { CEFRLevel } from '../../types/api';

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DAILY_GOALS = [10, 20, 30, 50, 100];

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const errorMessage = useAuthStore((state) => state.errorMessage);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('A2');
  const [dailyGoal, setDailyGoal] = useState(30);
  const [localError, setLocalError] = useState<string | null>(null);

  async function submit() {
    setLocalError(null);
    if (!name.trim()) {
      setLocalError('İsim zorunlu');
      return;
    }
    if (password.length < 8) {
      setLocalError('Şifre en az 8 karakter olmalı');
      return;
    }
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        currentLevel: level,
        dailyGoalCards: dailyGoal,
      });
    } catch {
      // Hata mesajı store üzerinden gösterilir.
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="gap-6 px-6 py-10" keyboardShouldPersistTaps="handled">
          <Text className="text-center text-3xl font-bold text-white">Hesap oluştur</Text>

          <View className="gap-4 rounded-3xl border border-slate-700 bg-surface p-6">
            <TextField label="İsim" value={name} onChangeText={setName} />
            <TextField label="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextField label="Şifre (en az 8 karakter)" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Seviyen</Text>
              <View className="flex-row flex-wrap gap-2">
                {LEVELS.map((item) => (
                  <Choice key={item} label={item} active={level === item} onPress={() => setLevel(item)} />
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Günlük hedef (yeni kart)</Text>
              <View className="flex-row flex-wrap gap-2">
                {DAILY_GOALS.map((goal) => (
                  <Choice key={goal} label={String(goal)} active={dailyGoal === goal} onPress={() => setDailyGoal(goal)} />
                ))}
              </View>
            </View>

            {localError ?? errorMessage ? <Text className="text-sm text-danger">{localError ?? errorMessage}</Text> : null}

            <Button title="Kayıt ol" onPress={() => void submit()} loading={isLoading} />
          </View>

          <View className="flex-row justify-center gap-1">
            <Text className="text-muted">Zaten hesabın var mı?</Text>
            <Link href="/(auth)/login" className="font-semibold text-accent">
              Giriş yap
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`min-w-[48px] items-center rounded-xl border px-3 py-2 ${active ? 'border-accent bg-accent/15' : 'border-slate-700 bg-bg'}`}
    >
      <Text className={active ? 'font-semibold text-accent' : 'text-muted'}>{label}</Text>
    </Pressable>
  );
}
