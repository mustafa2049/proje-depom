import { defineConfig } from '@playwright/test';

const WEB_URL = 'http://localhost:8090';
const API_URL = 'http://localhost:3000';

/**
 * Uçtan uca testler gerçek API (test veritabanı + mock AI) ve derlenmiş web uygulamasına karşı çalışır.
 * CHROMIUM_PATH tanımlıysa o tarayıcı kullanılır; aksi halde `npx playwright install chromium` gerekir.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: WEB_URL,
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--no-sandbox'],
      ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    },
  },
  webServer: [
    {
      command: 'node scripts/e2e-api.mjs',
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
    {
      command: 'node scripts/e2e-web.mjs',
      url: WEB_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 600_000,
    },
  ],
});
