import { createClient } from "redis";

let _client: ReturnType<typeof createClient> | null = null;

export function getRedis() {
  if (_client) return _client;

  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");

  const client = createClient({
    url,
    socket: {
      reconnectStrategy(retries) {
        // backoff to 1s max
        return Math.min(retries * 50, 1000);
      },
    },
  });

  client.on("error", (e) => {
    console.error("[redis] error:", e);
  });

  // connect immediately (safe to call multiple times thanks to our singleton)
  client.connect().then(() => {
    // quick ping to verify connectivity
    client.ping().then((pong) => console.log("[redis] connected:", pong));
  });

  // graceful shutdown
  const close = async () => {
    try {
      await client.quit();
      console.log("[redis] closed");
    } catch {
      await client.disconnect();
    }
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);

  _client = client;
  return _client;
}
