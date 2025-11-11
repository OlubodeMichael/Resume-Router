import { getRedis } from "../config/redis";

type SetJsonOpts = { ttlSec?: number };

export async function rget<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function rset<T>(key: string, value: T, opts: SetJsonOpts = {}) {
  const redis = await getRedis();
  const payload = JSON.stringify(value);
  if (opts.ttlSec && opts.ttlSec > 0) {
    await redis.set(key, payload, { EX: opts.ttlSec });
  } else {
    await redis.set(key, payload);
  }
}

export async function rdel(key: string) {
  const redis = await getRedis();
  await redis.del(key);
}
