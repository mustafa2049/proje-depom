import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Verilen bağlantı dizesiyle yeni bir Prisma istemcisi oluşturur.
 * Uygulama ve entegrasyon testleri kendi istemcisini bu fabrikayla alır.
 */
export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Süreç genelinde paylaşılan istemci (seed ve CLI betikleri için).
 * Geliştirme sırasında hot-reload kaynaklı çoklu örneklemeyi önler.
 */
export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL tanımlı değil. apps/api/.env dosyasını kontrol edin.');
  }

  const client = createPrismaClient(connectionString);
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}
