// =============================================================
// Nova Wood — Server Entry Point
// Bootstraps the Express server and database connections
// =============================================================
import 'dotenv/config';
import app from './app';
import { env } from '@config/env';
import { prisma, disconnectDb } from '@config/database';
import { initRedis } from '@config/redis';

async function bootstrap(): Promise<void> {
  console.info('🚀 Starting Nova Wood API server...');

  // 1. Connect to the database
  try {
    await prisma.$connect();
    console.info('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  // 2. Initialize Redis (optional)
  await initRedis();

  // 3. Start HTTP server
  const server = app.listen(env.PORT, () => {
    console.info(`✅ Server running on port ${env.PORT}`);
    console.info(`📍 API: http://localhost:${env.PORT}${env.API_PREFIX}`);
    console.info(`🌍 Environment: ${env.NODE_ENV}`);
  });

  // 4. Graceful shutdown handlers
  const shutdown = async (signal: string): Promise<void> => {
    console.info(`\n📦 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDb();
      console.info('✅ Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    shutdown('uncaughtException').catch(console.error);
  });
}

bootstrap().catch((err) => {
  console.error('💥 Bootstrap failed:', err);
  process.exit(1);
});
