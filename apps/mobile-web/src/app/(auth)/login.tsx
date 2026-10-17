import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Server } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiUrlSetting } from '../../components/settings/ApiUrlSetting';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuthStore } from '../../store/useAuthStore';
import { useConnectionStore } from '../../store/useConnectionStore';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const startOfflineMode = useAuthStore((state) => state.startOfflineMode);
  const apiUrl = useConnectionStore((state) => state.apiUrl);
  const isLoading = useAuthStore((state) => state.isLoading);
  const errorMessage = useAuthStore((state) => state.errorMessage);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showServer, setShowServer] = useState(false);

  async function submit() {
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('E-posta ve şifre zorunlu');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch {
      // Hata mesajı store üzerinden gösterilir.
    }
  }

  async function startOffline() {
    setLocalError(null);
    try {
      await startOfflineMode();
    } catch {
      // Hata mesajı store üzerinden gösterilir.
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center gap-6 px-6 py-10" keyboardShouldPersistTaps="handled">
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-white">Proje Depom</Text>
            <Text className="text-center text-base text-muted">Her gün biraz İngilizce, düzenli tekrarla kalıcı öğrenme.</Text>
          </View>

          <View className="gap-4 rounded-3xl border border-slate-700 bg-surface p-6">
            <TextField label="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" testID="login-email" />
            <TextField label="Şifre" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" testID="login-password" />

            {localError ?? errorMessage ? <Text className="text-sm text-danger">{localError ?? errorMessage}</Text> : null}

            <Button title="Giriş yap" onPress={() => void submit()} loading={isLoading} testID="login-submit" />
          </View>

          <View className="flex-row justify-center gap-1">
            <Text className="text-muted">Hesabın yok mu?</Text>
            <Link href="/(auth)/register" className="font-semibold text-accent">
              Kayıt ol
            </Link>
          </View>

          <View className="gap-3 rounded-3xl border border-slate-700 bg-surface p-6">
            <Text className="text-lg font-semibold text-white">Sunucu olmadan kullan</Text>
            <Text className="text-sm text-muted">
              İnternet veya sunucu gerekmez. Kelime desteleri, okuma parçaları, alıştırmalar ve tüm ilerlemen bu cihazda saklanır.
            </Text>
            <Button
              title="Sunucusuz (Çevrimdışı) Modda Başla"
              variant="secondary"
              onPress={() => void startOffline()}
              disabled={isLoading}
              testID="offline-start"
            />
          </View>

          <View className="gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: showServer }}
              onPress={() => setShowServer((value) => !value)}
              className="flex-row items-center justify-center gap-2 py-2"
              testID="server-settings-toggle"
            >
              <Server size={16} color="#94A3B8" />
              <Text className="text-sm text-muted">Sunucu Adresi (API URL): {apiUrl}</Text>
            </Pressable>
            {showServer ? (
              <View className="rounded-3xl border border-slate-700 bg-surface p-6">
                <ApiUrlSetting />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
