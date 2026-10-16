import { API_BASE_URL } from '../config/env';

import { createApiClient } from './api';
import { createEndpoints } from './endpoints';

/** Uygulama genelinde paylaşılan API istemcisi ve uç noktaları. */
export const apiClient = createApiClient({ baseUrl: API_BASE_URL });
export const api = createEndpoints(apiClient);
