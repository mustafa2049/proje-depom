import '../../global.css';

import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useOfflineSync } from '../hooks/useOfflineSync';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useOfflineSync();

  // Oturum durumu belirlenmeden hiçbir rota mount edilmez; korumalı ekranlar yetkisiz istek atmaz.
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {isHydrated ? (
        <>
          <AuthGate />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F172A' } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </>
      ) : (
        <Splash />
      )}
    </SafeAreaProvider>
  );
}

/** Oturum durumuna göre yönlendirir: giriş yapılmamışsa login, yapılmışsa ana sayfa. */
function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, isHydrated, segments, router]);

  return null;
}

function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <ActivityIndicator color="#38BDF8" />
    </View>
  );
}
