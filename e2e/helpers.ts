import { expect, type Page } from '@playwright/test';

export interface TestAccount {
  email: string;
  password: string;
  name: string;
}

export function newAccount(): TestAccount {
  return {
    email: `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`,
    password: 'password123',
    name: 'E2E Kullanıcı',
  };
}

/** Kayıt formunu UI üzerinden doldurur ve dashboard'un açılmasını bekler. */
export async function registerThroughUi(page: Page, account: TestAccount, level: string, dailyGoal: number): Promise<void> {
  await page.goto('/');
  await page.getByText('Kayıt ol', { exact: true }).first().click();
  // Expo Router önceki ekranı bellekte tutar; alanların son (üstteki) örneğini kullanırız.
  await page.getByLabel('İsim').last().fill(account.name);
  await page.getByLabel('E-posta').last().fill(account.email);
  await page.getByLabel('Şifre (en az 8 karakter)').last().fill(account.password);
  await page.getByRole('button', { name: level, exact: true }).click();
  await page.getByRole('button', { name: String(dailyGoal), exact: true }).click();
  await page.getByRole('button', { name: 'Kayıt ol', exact: true }).click();
  await expect(page.getByText('Merhaba,')).toBeVisible({ timeout: 20_000 });
}

/** Alt sekme çubuğundaki bir sekmeye geçer. */
export async function openTab(page: Page, label: string): Promise<void> {
  await page.getByText(label, { exact: true }).last().click();
}
