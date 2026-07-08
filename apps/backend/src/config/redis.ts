// =============================================================
// Nova Wood — Redis Client (Cache)
// Falls back gracefully if Redis is not available
// =============================================================
import { env } from './env';

let redis: import('ioredis').Redis | null = null;

/**
 * Initialize Redis connection if REDIS_URL is configured.
 * Fails silently — the app continues without caching if Redis is down.
 */
export async function initRedis(): Promise<void> {
  if (!env.REDIS_URL) {
    console.warn('⚠️  REDIS_URL not set — caching disabled');
    return;
  }

  try {
    const { default: Redis } = await import('ioredis');
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: () => null, // disable retrying on initial connection failure
    });

    redis.on('error', (err) => {
      // Log errors but don't crash
      console.warn('Redis background error:', err.message);
    });

    await redis.connect();
    console.info('✅ Redis connected');
  } catch {
    console.warn('⚠️  Redis connection failed — caching disabled');
    if (redis) {
      try {
        redis.disconnect();
      } catch {
        // Ignored non-fatal disconnect failure
      }
    }
    redis = null;
  }
}

/** Get a cached value by key. Returns null if no cache or key not found. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

/** Set a cached value with optional TTL (seconds). Defaults to env.REDIS_TTL. */
export async function cacheSet(key: string, value: unknown, ttl?: number): Promise<void> {
  if (!redis) return;
  try {
    const serialized = JSON.stringify(value);
    const expiry = ttl ?? env.REDIS_TTL;
    await redis.setex(key, expiry, serialized);
  } catch {
    // Cache write failure is non-fatal
  }
}

/** Delete a cached key or pattern. */
export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // ignore
  }
}

/** Delete all keys matching a pattern (e.g., "products:*") */
export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // ignore
  }
}

export { redis };
