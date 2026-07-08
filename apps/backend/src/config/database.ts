// =============================================================
// Nova Wood — Prisma Database Client (Singleton)
// Prevents multiple connections in development (hot-reload)
// =============================================================
import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Extend globalThis for dev singleton pattern
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: 'pretty',
  });
};

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

/**
 * Gracefully disconnect from the database.
 * Called on process exit signals.
 */
export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
  console.info('✅ Database disconnected');
}
