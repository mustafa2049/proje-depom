export type ApiUrlResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Kullanıcının girdiği sunucu adresini doğrular ve normalize eder.
 * Şema yazılmadıysa http:// eklenir (ör. "192.168.1.20:3000"), sondaki "/" kaldırılır.
 */
export function normalizeApiUrl(input: string): ApiUrlResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: 'Sunucu adresi boş olamaz' };
  }

  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { ok: false, error: 'Geçerli bir adres girin (ör. http://192.168.1.20:3000)' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Adres http:// veya https:// ile başlamalı' };
  }
  if (!parsed.hostname) {
    return { ok: false, error: 'Adreste sunucu adı veya IP bulunmalı' };
  }
  if (parsed.search || parsed.hash) {
    return { ok: false, error: 'Adres sorgu (?) veya # içermemeli' };
  }

  const path = parsed.pathname.replace(/\/+$/, '');
  return { ok: true, url: `${parsed.protocol}//${parsed.host}${path}` };
}

/** Telefonda "localhost" cihazın kendisini gösterir; kullanıcıyı uyarmak için kullanılır. */
export function pointsToDeviceItself(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';
  } catch {
    return false;
  }
}
