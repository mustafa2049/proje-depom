import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KeyValueStorage } from './keyValueStorage';

/** Kalıcı uygulama verisi (native: AsyncStorage). */
export const appStorage: KeyValueStorage = AsyncStorage;
