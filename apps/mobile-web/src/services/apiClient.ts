import { isLocalMode, useConnectionStore } from '../store/useConnectionStore';

import { createApiClient } from './api';
import { createBackendSwitch } from './backendSwitch';
import { createEndpoints } from './endpoints';
import { createLocalBackend } from './local/localBackend';
import { createLocalDb } from './local/localDb';
import { appStorage } from './storage';

/** Sunucu istemcisi; adres her istekte kullanıcı ayarından (Sunucu Adresi) okunur. */
export const apiClient = createApiClient({ baseUrl: () => useConnectionStore.getState().apiUrl });
const remoteEndpoints = createEndpoints(apiClient);

/** Sunucusuz mod: cihaz içi veritabanı (AsyncStorage) ve gömülü içerikle çalışan arka uç. */
export const localBackend = createLocalBackend(createLocalDb(appStorage));

/** Uygulama genelinde kullanılan uç noktalar: seçili moda göre sunucuya ya da cihaz içi arka uca gider. */
export const api = createBackendSwitch(() => (isLocalMode() ? localBackend.endpoints : remoteEndpoints));
