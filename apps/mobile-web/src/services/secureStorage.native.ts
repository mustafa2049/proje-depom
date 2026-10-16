import * as SecureStore from 'expo-secure-store';

import type { KeyValueStorage } from './keyValueStorage';

/** Oturum token'ları için şifreli depolama (iOS Keychain / Android Keystore). */
export const secureStorage: KeyValueStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};
