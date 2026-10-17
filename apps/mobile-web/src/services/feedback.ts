import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Doğru cevap: kısa başarı titreşimi (yalnızca dokunmatik platformlarda). */
export function hapticSuccess(): void {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

/** Yanlış cevap: hata titreşimi. */
export function hapticError(): void {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}
