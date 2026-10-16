import { createBrowserStorage, type KeyValueStorage } from './keyValueStorage';

/** Kalıcı uygulama verisi (web: localStorage). Native platformda storage.native.ts (AsyncStorage) kullanılır. */
export const appStorage: KeyValueStorage = createBrowserStorage();
