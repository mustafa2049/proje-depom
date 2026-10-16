import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const errorMessage = useAuthStore((state) => state.errorMessage);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
