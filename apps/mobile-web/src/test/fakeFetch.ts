import { vi } from 'vitest';

export interface FakeRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
}

export type FakeHandler = (request: FakeRequest) => { status?: number; body?: unknown } | Promise<{ status?: number; body?: unknown }>;

/**
 * Yöntem + yol eşleştiren fetch stub'ı. Eşleşmeyen istekler 404 döner; ağ hatası için handler `throw` edebilir.
 */
export function installFakeFetch(routes: Record<string, FakeHandler>) {
  const requests: FakeRequest[] = [];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';
    const request: FakeRequest = {
      method,
      path: url.pathname,
      query: url.searchParams,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    requests.push(request);

    const handler = routes[`${method} ${url.pathname}`];
    if (!handler) {
      return json(404, { error: { code: 'NOT_FOUND', message: `Stub yok: ${method} ${url.pathname}` } });
    }
    const result = await handler(request);
    return json(result.status ?? 200, result.body ?? {});
  });

  vi.stubGlobal('fetch', fetchMock);
  return { requests, fetchMock };
}

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
