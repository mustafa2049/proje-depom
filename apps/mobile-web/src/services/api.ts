import type { AuthTokens } from '../types/api';

import { session as defaultSession } from './session';

/** Ağ veya HTTP hatası. Ağ hatalarında status 0 kullanılır. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0;
}

export interface SessionBridge {
  get(): AuthTokens | null;
  set(tokens: AuthTokens | null): void;
}

export interface ApiClientOptions {
  baseUrl: string;
  session?: SessionBridge;
  /** Varsayılan olarak çalışma anındaki global fetch kullanılır (testlerde stub edilebilir). */
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  body?: unknown;
  /** false ise Authorization başlığı eklenmez ve 401 için yenileme denenmez. */
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
}

export type ApiClient = ReturnType<typeof createApiClient>;

export function createApiClient(options: ApiClientOptions) {
  const session = options.session ?? defaultSession;
  const fetchImpl: typeof fetch = options.fetchImpl ?? ((input, init) => fetch(input, init));

  let refreshing: Promise<boolean> | null = null;

  function buildUrl(path: string, query?: RequestOptions['query']): string {
    const url = new URL(path, options.baseUrl);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  async function send(method: string, path: string, opts: RequestOptions, accessToken?: string): Promise<Response> {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (opts.body !== undefined) {
      headers['content-type'] = 'application/json';
    }
    if (accessToken) {
      headers.authorization = `Bearer ${accessToken}`;
    }

    try {
      return await fetchImpl(buildUrl(path, opts.query), {
        method,
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'Sunucuya bağlanılamadı. Çevrimdışı moddasınız.');
    }
  }

  /**
   * Refresh token ile yeni token çifti alır. Eşzamanlı çağrılar tek bir istekte birleşir.
   * Yenileme 401 ile reddedilirse oturum temizlenir; ağ hatasında oturum korunur.
   */
  function refreshOnce(): Promise<boolean> {
    refreshing ??= performRefresh().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  async function performRefresh(): Promise<boolean> {
    const current = session.get();
    if (!current) {
      return false;
    }

    // Ağ hatası burada fırlar ve oturum korunur; yalnızca sunucu yanıtı reddederse oturum temizlenir.
    const response = await send('POST', '/api/auth/refresh', {
      body: { refreshToken: current.refreshToken },
      auth: false,
    });

    if (!response.ok) {
      session.set(null);
      return false;
    }

    const data = (await response.json()) as AuthTokens;
    session.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  }

  async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const useAuth = opts.auth !== false;
    const accessToken = useAuth ? session.get()?.accessToken : undefined;

    let response = await send(method, path, opts, accessToken);

    if (response.status === 401 && useAuth && session.get()) {
      const refreshed = await refreshOnce();
      if (!refreshed) {
        throw new ApiError(401, 'SESSION_EXPIRED', 'Oturumunuz sona erdi, lütfen tekrar giriş yapın.');
      }
      response = await send(method, path, opts, session.get()?.accessToken);
    }

    if (!response.ok) {
      throw await toApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  return {
    request,
    get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
    post: <T>(path: string, opts?: RequestOptions) => request<T>('POST', path, opts),
  };
}

async function toApiError(response: Response): Promise<ApiError> {
  let payload: { error?: { code?: string; message?: string; details?: unknown } } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    // Gövde JSON değilse varsayılan mesajla devam edilir.
  }

  return new ApiError(
    response.status,
    payload.error?.code ?? 'HTTP_ERROR',
    payload.error?.message ?? `İstek başarısız oldu (HTTP ${response.status})`,
    payload.error?.details,
  );
}
