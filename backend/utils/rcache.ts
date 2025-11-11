import { getRedis } from "../config/redis";

type SetJsonOpts = { ttlSec?: number };

export async function rget<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedis();
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn(`[rcache] rget fallback for key "${key}":`, error);
    return null;
  }
}

export async function rset<T>(key: string, value: T, opts: SetJsonOpts = {}) {
  try {
    const redis = await getRedis();
    const payload = JSON.stringify(value);
    if (opts.ttlSec && opts.ttlSec > 0) {
      await redis.set(key, payload, { EX: opts.ttlSec });
    } else {
      await redis.set(key, payload);
    }
  } catch (error) {
    console.warn(`[rcache] rset failed for key "${key}":`, error);
  }
}

export async function rdel(key: string) {
  try {
    const redis = await getRedis();
    await redis.del(key);
  } catch (error) {
    console.warn(`[rcache] rdel failed for key "${key}":`, error);
  }
}
