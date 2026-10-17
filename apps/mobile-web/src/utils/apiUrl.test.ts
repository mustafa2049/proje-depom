import { describe, expect, it } from 'vitest';

import { normalizeApiUrl, pointsToDeviceItself } from './apiUrl';

describe('normalizeApiUrl', () => {
  it.each([
    ['http://192.168.1.20:3000', 'http://192.168.1.20:3000'],
    ['192.168.1.20:3000', 'http://192.168.1.20:3000'],
    ['  https://api.example.com/  ', 'https://api.example.com'],
    ['https://example.com/backend/', 'https://example.com/backend'],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeApiUrl(input)).toEqual({ ok: true, url: expected });
  });

  it.each(['', '   ', 'ftp://example.com', 'http://', 'http://example.com/?a=1'])('geçersiz: "%s"', (input) => {
    expect(normalizeApiUrl(input).ok).toBe(false);
  });
});

describe('pointsToDeviceItself', () => {
  it('localhost ve loopback adreslerini tanır', () => {
    expect(pointsToDeviceItself('http://localhost:3000')).toBe(true);
    expect(pointsToDeviceItself('http://127.0.0.1:3000')).toBe(true);
    expect(pointsToDeviceItself('http://192.168.1.20:3000')).toBe(false);
  });
});
