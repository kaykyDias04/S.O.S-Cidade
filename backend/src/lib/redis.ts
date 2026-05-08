import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.warn('[Redis] REDIS_URL not set — caching will be disabled');
}

export const redis = REDIS_URL
  ? new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: false,
    })
  : null;

if (redis) {
  redis.on('connect', () => console.log('[Redis] Connected'));
  redis.on('error', (err) => console.error('[Redis] Connection error:', err.message));
}


export async function redisGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}


export async function redisSet(key: string, value: string, exSeconds = 60): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, 'EX', exSeconds);
  } catch {
    
  }
}


export async function redisDel(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    
  }
}


export async function redisKeys(pattern: string): Promise<string[]> {
  if (!redis) return [];
  try {
    return await redis.keys(pattern);
  } catch {
    return [];
  }
}
