import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from './password';

describe('password hashing (scrypt)', () => {
  it('doğru şifreyi kabul eder, yanlış şifreyi reddeder', async () => {
    const hash = await hashPassword('correct-horse-battery');

    expect(await verifyPassword('correct-horse-battery', hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('aynı şifre için her seferinde farklı tuz ve hash üretir', async () => {
    const first = await hashPassword('same-password');
    const second = await hashPassword('same-password');

    expect(first).not.toBe(second);
    expect(first.startsWith('scrypt$')).toBe(true);
  });

  it('bozuk veya beklenmeyen biçimdeki hash değerlerini reddeder', async () => {
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
    expect(await verifyPassword('x', 'bcrypt$10$abc')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$16384$8$1$zz$zz')).toBe(false);
  });
});
