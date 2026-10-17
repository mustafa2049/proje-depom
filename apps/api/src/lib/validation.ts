import type { z } from 'zod';

import { ValidationError } from './errors';

/**
 * Girdiyi şemayla doğrular; hata durumunda alan bazlı detayları taşıyan 400 hatası fırlatır.
 */
export function parseWith<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(
      'İstek doğrulanamadı',
      result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    );
  }
  return result.data;
}
