import { expect, test, type Page } from '@playwright/test';

import { newAccount, openTab, registerThroughUi, type TestAccount } from './helpers';

/**
 * Tüm fazların tek bir kullanıcı üzerinden akışı (sıralı):
 * Faz 2–3 kayıt ve çalışma, Faz 5 çevrimdışı senkronizasyon, Faz 4 AI/okuma/pratik,
 * Faz 5 profil, ısı haritası, istatistikler ve hedef güncelleme.
 */
test.describe.serial('Tüm faz akışı', () => {
  let page: Page;
  let account: TestAccount;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    account = newAccount();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('kayıt ve dashboard (Faz 2–3)', async () => {
    await registerThroughUi(page, account, 'B1', 20);
    await expect(page.getByText('Bugün: 0 / 20 kart')).toBeVisible({ timeout: 10_000 });
  });

  test('SRS çalışması: çevir, değerlendir, Again yeniden sıraya girer (Faz 3)', async () => {
    await page.getByRole('button', { name: 'Tüm Tekrarları Başlat' }).click();
    await expect(page.getByText('Cevabı Göster (Space)')).toBeVisible({ timeout: 15_000 });

    await page.keyboard.press('Space');
    await expect(page.getByText('Tekrar (1)')).toBeVisible();
    const previews = await page.locator('[aria-label*="sonraki tekrar"]').allTextContents();
    expect(previews.join(' ')).toContain('10 dk');

    await page.keyboard.press('3');
    await expect(page.getByText('+10 XP')).toBeVisible();

    await page.keyboard.press('Space');
    await page.keyboard.press('1');
    await expect(page.getByText(/kart kaldı/)).toBeVisible();
  });

  test('çevrimdışı çalışma ve otomatik senkronizasyon (Faz 5)', async () => {
    // Dashboard stack'te altta kalır ve aynı banner'ı render eder; en üstteki (son) örneği kullanırız.
    const banner = page.getByText(/değerlendirme senkronizasyon bekliyor/).last();

    await page.context().setOffline(true);
    await page.keyboard.press('Space');
    await page.keyboard.press('2');
    await expect(banner).toBeVisible({ timeout: 10_000 });

    await page.context().setOffline(false);
    // Tarayıcının "online" olayı çoğu zaman otomatik sync'i tetikler; gelmezse elle tetikle.
    try {
      await expect(banner).toBeHidden({ timeout: 5_000 });
    } catch {
      await page.getByRole('button', { name: 'Senkronize Et' }).last().click();
      await expect(banner).toBeHidden({ timeout: 15_000 });
    }
    await page.getByRole('button', { name: 'Çalışmayı kapat' }).click();
    await expect(page.getByText('Merhaba,').last()).toBeVisible({ timeout: 10_000 });
  });

  test('AI Tutor: düzeltme, geri bildirim ve kelime kaydı (Faz 4)', async () => {
    await openTab(page, 'AI Tutor');
    await page.getByText('Kafe Siparişi', { exact: true }).first().click();
    await page.getByLabel('Mesajınız').fill('i want tea');
    await page.getByLabel('Gönder').click();

    await expect(page.getByText('Geliştirme önerisi')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('I want tea.', { exact: false }).first()).toBeVisible();
    await page.getByText('+ Desteme Ekle').first().click();
    await expect(page.getByText('Eklendi ✓').first()).toBeVisible({ timeout: 10_000 });
  });

  test('Okuma: kelime sözlüğü ve okuduğunu anlama (Faz 4)', async () => {
    await openTab(page, 'Okuma');
    await page.getByRole('button', { name: 'A1', exact: true }).click();
    await page.getByRole('button', { name: /A Day at Home/ }).click();
    await expect(page.getByText('Tüm metni sesli oku')).toBeVisible({ timeout: 10_000 });

    await page.getByText('wake', { exact: true }).first().click();
    await expect(page.getByText('SRS Desteme Ekle')).toBeVisible({ timeout: 10_000 });
    await page.getByText('SRS Desteme Ekle').click();
    await expect(page.getByText('Eklendi ✓').first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Kapat' }).first().click();

    await page.getByText('At seven', { exact: true }).first().click();
    await expect(page.getByText('Metinde "Every day I wake up at seven', { exact: false }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Kütüphaneye dön' }).click();
  });

  test('Pratik: kelime sıralama, boşluk doldurma ve çeviri lab\'ı (Faz 4)', async () => {
    await openTab(page, 'Pratik');
    await expect(page.getByText('Kelime Sıralama', { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    await expect(page.getByTestId('word-bank').first()).toBeVisible({ timeout: 10_000 });
    let guard = 0;
    while ((await page.getByTestId('word-bank').count()) > 0 && guard++ < 20) {
      await page.getByTestId('word-bank').first().click();
    }
    await page.getByTestId('word-check').click();
    await expect(page.getByText(/Doğru! Harika\.|Olmadı, doğru cümle aşağıda:/)).toBeVisible({ timeout: 5_000 });

    await page.getByText('Boşluk Doldurma', { exact: true }).first().click();
    await page.getByTestId('cloze-option').first().click();
    await expect(page.getByText(/^(Doğru!|Yanlış\.)$/).first()).toBeVisible({ timeout: 5_000 });

    await page.getByText('Çeviri Lab', { exact: true }).first().click();
    await page.getByLabel('İngilizce çeviriniz').fill('This is a test sentence.');
    await page.getByRole('button', { name: 'Değerlendir', exact: true }).click();
    await expect(page.getByText('Doğruluk', { exact: true })).toBeVisible({ timeout: 15_000 });
  });

  test('profil: ısı haritası, istatistikler ve hedef güncelleme (Faz 5)', async () => {
    await openTab(page, 'Profil');
    await expect(page.getByText('Çalışma ısı haritası')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Bellek dağılımı')).toBeVisible();

    // 90 günlük ızgara: her gün tek hücre (ısı haritası hücreleri testid ile işaretli)
    await expect(page.getByTestId('heatmap-cell')).toHaveCount(90);

    // Bugünün hücresi (son hücre) ayrıntı satırını gösterir
    await page.getByTestId('heatmap-cell').last().click();
    await expect(page.getByText(/kart incelendi • \+\d+ XP • \d+ dk/)).toBeVisible();

    await page.getByTestId('profile-goal').fill('25');
    await page.getByTestId('profile-save').click();
    await expect(page.getByText('Ayarlar kaydedildi ✓')).toBeVisible({ timeout: 10_000 });
  });

  test('güncellenen hedef dashboard\'a yansır ve oturum kapanır (Faz 5)', async () => {
    await openTab(page, 'Ana Sayfa');
    await expect(page.getByText(/Bugün: \d+ \/ 25 kart/)).toBeVisible({ timeout: 10_000 });

    await openTab(page, 'Profil');
    await page.getByRole('button', { name: 'Çıkış yap' }).click();
    await expect(page.getByRole('button', { name: 'Giriş yap' })).toBeVisible({ timeout: 10_000 });
  });
});
