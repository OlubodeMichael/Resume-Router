// redis.ts
import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null =
  (globalThis as any).__RR_REDIS_CLIENT__ ?? null;

function makeClient(url: string): RedisClientType {
  const c = createClient({
    url,
    socket: {
      reconnectStrategy(retries) {
        // exponential-ish backoff, cap at 1s
        return Math.min(retries * 50, 1000);
      },
    },
  });

  c.on("error", (e) => {
    console.error("[redis] error:", e);
  });

  return c as RedisClientType;
}

/**
 * Get a connected Redis client.
 * - Lazily connects.
 * - If previously closed, creates a new client.
 * - Safe under dev HMR via globalThis cache.
 */
export async function getRedis(): Promise<RedisClientType> {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");

  // (Re)create if missing or closed
  if (!client || client.isOpen === false) {
    client = makeClient(url);
    (globalThis as any).__RR_REDIS_CLIENT__ = client;
  }

  // Connect if not already connected
  if (!client.isOpen) {
    await client.connect();
    // Optional quick sanity check; ignore errors so we don’t throw on ping
    try {
      const pong = await client.ping();
      console.log("[redis] connected:", pong);
    } catch (e) {
      console.warn("[redis] ping failed after connect:", e);
    }
  }

  return client;
}

// Optional: graceful shutdown ONLY for long-lived Node servers (not serverless / edge)
if (
  typeof process !== "undefined" &&
  process.env.SERVERLESS_ENV !== "true" &&
  process.env.NEXT_RUNTIME !== "edge"
) {
  const close = async () => {
    try {
      if (client?.isOpen) {
        await client.quit();
        console.log("[redis] closed");
      }
    } catch {
      await client?.disconnect();
    } finally {
      client = null;
      (globalThis as any).__RR_REDIS_CLIENT__ = null;
    }
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}
