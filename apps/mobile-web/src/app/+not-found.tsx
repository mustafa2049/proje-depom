import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Bulunamadı' }} />
      <View className="flex-1 items-center justify-center gap-4 bg-bg p-6">
        <Text className="text-xl font-semibold text-white">Bu sayfa bulunamadı</Text>
        <Link href="/" className="text-base text-accent">
          Ana sayfaya dön
        </Link>
      </View>
    </>
  );
}
