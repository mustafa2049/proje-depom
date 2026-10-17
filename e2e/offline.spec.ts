import { expect, test, type Page } from '@playwright/test';

import { openTab } from './helpers';

/**
 * Sunucusuz (çevrimdışı) mod: API'ye giden tüm istekler engellenir; uygulama gömülü içerik
 * ve cihaz içi depolamayla çalışmalı, hiçbir sunucu isteği yapmamalıdır.
 */
test.describe.serial('Sunucusuz (çevrimdışı) mod', () => {
  let page: Page;
  const apiRequests: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route('http://localhost:3000/**', async (route) => {
      apiRequests.push(route.request().url());
      await route.abort();
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('giriş ekranından sunucusuz mod başlar', async () => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sunucusuz (Çevrimdışı) Modda Başla' }).click();
    await expect(page.getByText('Merhaba,')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Bugün: 0 / 30 kart')).toBeVisible({ timeout: 10_000 });
  });

  test('gömülü destelerden kart çalışılır ve ilerleme kaydedilir', async () => {
    await page.getByRole('button', { name: 'Tüm Tekrarları Başlat' }).click();
    await expect(page.getByText('Cevabı Göster (Space)')).toBeVisible({ timeout: 15_000 });
    await page.keyboard.press('Space');
    await page.keyboard.press('3');
    await expect(page.getByText('+10 XP')).toBeVisible();

    await page.getByRole('button', { name: 'Çalışmayı kapat' }).click();
    await expect(page.getByText('Bugün: 1 / 30 kart').last()).toBeVisible({ timeout: 10_000 });
  });

  test('AI Tutor kural tabanlı geri bildirim verir', async () => {
    await openTab(page, 'AI Tutor');
    await expect(page.getByText(/Sunucusuz mod: kural tabanlı/)).toBeVisible();
    await page.getByText('Kafe Siparişi', { exact: true }).first().click();
    await page.getByLabel('Mesajınız').fill('i want tea');
    await page.getByLabel('Gönder').click();
    await expect(page.getByText('Geliştirme önerisi')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('I want tea.', { exact: false }).first()).toBeVisible();
  });

  test('okuma parçası ve çevrimdışı sözlük çalışır', async () => {
    await openTab(page, 'Okuma');
    await page.getByRole('button', { name: 'A1', exact: true }).click();
    await page.getByRole('button', { name: /A Day at Home/ }).click();
    await expect(page.getByText('Tüm metni sesli oku')).toBeVisible({ timeout: 10_000 });

    await page.getByText('wake', { exact: true }).first().click();
    await expect(page.getByText('Çevrimdışı sözlük')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('uyanmak').first()).toBeVisible();
    await page.getByRole('button', { name: 'Kapat' }).first().click();
    await page.getByRole('button', { name: 'Kütüphaneye dön' }).click();
  });

  test('pratik soruları ve çeviri değerlendirmesi cihazda üretilir', async () => {
    await openTab(page, 'Pratik');
    await expect(page.getByTestId('word-bank').first()).toBeVisible({ timeout: 10_000 });
    await page.getByText('Çeviri Lab', { exact: true }).first().click();
    await page.getByLabel('İngilizce çeviriniz').fill('This is a test sentence.');
    await page.getByRole('button', { name: 'Değerlendir', exact: true }).click();
    await expect(page.getByText('Doğruluk', { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test('profil bağlantı bölümünü gösterir; sayfa yenilenince oturum ve ilerleme korunur', async () => {
    await openTab(page, 'Profil');
    await expect(page.getByText(/Sunucusuz moddasın/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('api-url-input').last()).toBeVisible();

    await page.reload();
    await openTab(page, 'Ana Sayfa');
    await expect(page.getByText('Bugün: 1 / 30 kart').last()).toBeVisible({ timeout: 20_000 });
  });

  test('hiçbir sunucu isteği yapılmadı', () => {
    expect(apiRequests).toEqual([]);
  });
});
