import type { PrismaClient } from '@prisma/client';

import type { LlmProvider } from './services/llmService';
import type { TokenService } from './lib/tokens';

/**
 * Rotaların ve servislerin ihtiyaç duyduğu paylaşılan bağımlılıklar.
 */
export interface AppContext {
  db: PrismaClient;
  llm: LlmProvider;
  tokens: TokenService;
}
