import { z } from 'zod';

const booleanFlag = (defaultValue: 'true' | 'false') =>
  z
    .enum(['true', 'false'])
    .default(defaultValue)
    .transform((value) => value === 'true');

/** Boş string (ör. .env.example kopyası) isteğe bağlı anahtarı "tanımsız" sayar. */
const optionalSecret = z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL zorunlu'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET en az 32 karakter olmalı'),
  ACCESS_TOKEN_TTL_SEC: z.coerce.number().int().positive().default(15 * 60),
  REFRESH_TOKEN_TTL_SEC: z.coerce.number().int().positive().default(30 * 24 * 60 * 60),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:8081,http://localhost:19006')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
  /** auto: OPENAI_API_KEY → GEMINI_API_KEY → mock sırasıyla seçilir. */
  AI_PROVIDER: z.enum(['auto', 'openai', 'gemini', 'mock']).default('auto'),
  OPENAI_API_KEY: optionalSecret,
  OPENAI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  GEMINI_API_KEY: optionalSecret,
  GEMINI_MODEL: z.string().min(1).default('gemini-2.0-flash'),
  RATE_LIMIT_ENABLED: booleanFlag('true'),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Geçersiz ortam değişkenleri:\n${issues.join('\n')}`);
  }

  const env = result.data;
  if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
    throw new Error('AI_PROVIDER=openai için OPENAI_API_KEY zorunlu');
  }
  if (env.AI_PROVIDER === 'gemini' && !env.GEMINI_API_KEY) {
    throw new Error('AI_PROVIDER=gemini için GEMINI_API_KEY zorunlu');
  }

  return env;
}
