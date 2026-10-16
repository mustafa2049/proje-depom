import { createBrowserStorage, type KeyValueStorage } from './keyValueStorage';

/**
 * Oturum token'ları için depolama. Web'de localStorage kullanılır;
 * native platformda secureStorage.native.ts (expo-secure-store) devreye girer.
 */
export const secureStorage: KeyValueStorage = createBrowserStorage();
