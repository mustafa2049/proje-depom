import { describe, expect, it, vi } from 'vitest';

import type { AuthTokens } from '../types/api';

import { ApiError, createApiClient, isNetworkError } from './api';

interface Bridge {
  get(): AuthTokens | null;
  set(tokens: AuthTokens | null): void;
  current: AuthTokens | null;
}

function createBridge(initial: AuthTokens | null): Bridge {
  const bridge: Bridge = {
    current: initial,
    get: () => bridge.current,
    set: (tokens) => {
      bridge.current = tokens;
    },
  };
  return bridge;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const BASE = 'http://api.test';

describe('createApiClient', () => {
  it('her istekte Authorization başlığı ekler ve JSON yanıtı döner', async () => {
    const bridge = createBridge({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    const fetchImpl = vi.fn(async () => json(200, { ok: true }));
    const client = createApiClient({ baseUrl: BASE, session: bridge, fetchImpl });

    const result = await client.get<{ ok: boolean }>('/api/auth/me');

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE}/api/auth/me`);
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer access-1');
  });

  it('401 alındığında refresh token ile yeni çifti alır ve isteği bir kez tekrarlar', async () => {
    const bridge = createBridge({ accessToken: 'old', refreshToken: 'refresh-old' });
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/auth/refresh')) {
        return json(200, { accessToken: 'new', refreshToken: 'refresh-new' });
      }
      const auth = (init?.headers as Record<string, string>).authorization;
      return auth === 'Bearer new' ? json(200, { value: 42 }) : json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } });
    });
    const client = createApiClient({ baseUrl: BASE, session: bridge, fetchImpl });

    const result = await client.get<{ value: number }>('/api/srs/due');

    expect(result.value).toBe(42);
    expect(bridge.current).toEqual({ accessToken: 'new', refreshToken: 'refresh-new' });
    const refreshCalls = fetchImpl.mock.calls.filter(([input]) => String(input).endsWith('/api/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('eşzamanlı 401 isteklerini tek bir refresh çağrısında birleştirir', async () => {
    const bridge = createBridge({ accessToken: 'old', refreshToken: 'refresh-old' });
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/auth/refresh')) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return json(200, { accessToken: 'new', refreshToken: 'refresh-new' });
      }
      const auth = (init?.headers as Record<string, string>).authorization;
      return auth === 'Bearer new' ? json(200, { url }) : json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } });
    });
    const client = createApiClient({ baseUrl: BASE, session: bridge, fetchImpl });

    const results = await Promise.all([
      client.get('/api/a'),
      client.get('/api/b'),
      client.get('/api/c'),
    ]);

    expect(results).toHaveLength(3);
    const refreshCalls = fetchImpl.mock.calls.filter(([input]) => String(input).endsWith('/api/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('refresh reddedilirse oturumu temizler ve SESSION_EXPIRED fırlatır', async () => {
    const bridge = createBridge({ accessToken: 'old', refreshToken: 'expired' });
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) =>
      String(input).endsWith('/api/auth/refresh')
        ? json(401, { error: { code: 'UNAUTHORIZED', message: 'expired' } })
        : json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } }),
    );
    const client = createApiClient({ baseUrl: BASE, session: bridge, fetchImpl });

    const error = await client.get('/api/auth/me').catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('SESSION_EXPIRED');
    expect(bridge.current).toBeNull();
  });

  it('ağ hatasında status 0 ile ApiError fırlatır ve oturumu korur', async () => {
    const bridge = createBridge({ accessToken: 'a', refreshToken: 'r' });
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const client = createApiClient({ baseUrl: BASE, session: bridge, fetchImpl });

    const error = await client.post('/api/srs/review', { body: { x: 1 } }).catch((reason: unknown) => reason);

    expect(isNetworkError(error)).toBe(true);
    expect(bridge.current).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('refresh sırasında ağ hatası oturumu silmez', async () => {
    const bridge = createBridge({ accessToken: 'old', refreshToken: 'r' });
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('/api/auth/refresh')) {
        throw new TypeError('offline');
      }
      return json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } });
    });
    const client = createApiClient({ baseUrl: BASE, session: bridge, fetchImpl });

    const error = await client.get('/api/auth/me').catch((reason: unknown) => reason);

    expect(isNetworkError(error)).toBe(true);
    expect(bridge.current).toEqual({ accessToken: 'old', refreshToken: 'r' });
  });

  it('auth:false ile çağrıda Authorization eklenmez ve 401 için yenileme denenmez', async () => {
    const bridge = createBridge({ accessToken: 'a', refreshToken: 'r' });
    const fetchImpl = vi.fn(async () => json(401, { error: { code: 'UNAUTHORIZED', message: 'Hatalı şifre' } }));
    const client = createApiClient({ baseUrl: BASE, session: bridge, fetchImpl });

    const error = await client.post('/api/auth/login', { body: {}, auth: false }).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe('Hatalı şifre');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('JSON olmayan hata gövdesinde HTTP kodu ile varsayılan mesaj üretir', async () => {
    const bridge = createBridge(null);
    const fetchImpl = vi.fn(async () => new Response('<html>bad gateway</html>', { status: 502 }));
    const client = createApiClient({ baseUrl: BASE, session: bridge, fetchImpl });

    const error = (await client.get('/api/x', { auth: false }).catch((reason: unknown) => reason)) as ApiError;

    expect(error.status).toBe(502);
    expect(error.code).toBe('HTTP_ERROR');
  });
});
