// =============================================================
// Nova Wood — Environment Configuration
// Validates all required env vars at startup
// =============================================================
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  API_PREFIX: z.string().default('/api/v1'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  ADMIN_URL: z.string().default('http://localhost:3001'),

  // Redis (optional)
  REDIS_URL: z.string().optional(),
  REDIS_TTL: z.string().default('3600').transform(Number),

  // File Upload
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.string().default('10').transform(Number),
  IMAGE_QUALITY_WEBP: z.string().default('85').transform(Number),
  IMAGE_QUALITY_AVIF: z.string().default('80').transform(Number),
  CDN_BASE_URL: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587').transform(Number),
  SMTP_SECURE: z.string().default('false').transform((v) => v === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM_NAME: z.string().default('Nova Wood'),
  EMAIL_FROM_ADDRESS: z.string().optional(),

  // Localization
  DEFAULT_LOCALE: z.string().default('ar'),
  SUPPORTED_LOCALES: z.string().default('ar,en'),

  // Admin
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
