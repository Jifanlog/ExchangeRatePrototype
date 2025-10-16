// Server-only Redis caching logic
import { UsdRates } from "./rates-client.js";

const REDIS_KEY = "usd_rates_v1";

// In-memory backup cache (fallback when Redis fails)
let backupCache: { data: UsdRates; timestamp: number } | null = null;
const BACKUP_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours max age for backup

let redisClientPromise: Promise<any> | null = null;
async function getRedis() {
  if (!process.env.REDIS_URL) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [rates] Redis disabled: missing REDIS_URL`);
    return null; // allow running without Redis
  }
  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const { default: IORedis } = await import("ioredis");
      const client = new IORedis(process.env.REDIS_URL as string, {
        // reasonable defaults for serverless/Next.js edge-ish usage
        lazyConnect: true,
        maxRetriesPerRequest: 2,
      });
      try {
        await client.connect();
      } catch (err) {
        const ts = new Date().toISOString();
        console.log(`[${ts}] [rates] Redis connect failed, falling back (reason: ${(err as Error)?.message ?? "unknown"})`);
        // If connect fails, fall back to no-redis mode
        return null;
      }
      return client;
    })();
  }
  return redisClientPromise;
}

export async function fetchUsdRatesCached(): Promise<UsdRates> {
  const redis = await getRedis();
  if (redis) {
    try {
      const cached = await redis.get(REDIS_KEY);
      if (cached) {
        const ts = new Date().toISOString();
        console.log(`[${ts}] [rates] Redis HIT for ${REDIS_KEY}`);
        return JSON.parse(cached) as UsdRates;
      }
      const tsMiss = new Date().toISOString();
      console.log(`[${tsMiss}] [rates] Redis MISS for ${REDIS_KEY}`);
    } catch {}
  }

  // Redis failed or empty - check backup cache first
  const now = Date.now();
  if (backupCache && (now - backupCache.timestamp) < BACKUP_MAX_AGE_MS) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [rates] Serving STALE backup cache (age: ${Math.round((now - backupCache.timestamp) / 1000 / 60)}min)`);
    return backupCache.data;
  }

  // No valid cache - this should rarely happen if scheduled refresh works
  const ts = new Date().toISOString();
  console.error(`[${ts}] [rates] No valid cache available! This indicates scheduled refresh may be failing.`);
  throw new Error("No exchange rate data available. Please check scheduled refresh.");
}

// Force refresh: bypass Redis read, fetch fresh, and overwrite Redis
export async function refreshUsdRatesNow(): Promise<UsdRates> {
  const url ="https://v6.exchangerate-api.com/v6/be7da88391f18267cf7b9541/latest/USD";
  const startedAt = Date.now();
  const tsStart = new Date().toISOString();
  console.log(`[${tsStart}] [rates] Force refresh: calling third-party: ${url}`);
  const res = await fetch(url, { cache: "no-store" });
  const durationMs = Date.now() - startedAt;
  const tsDone = new Date().toISOString();
  console.log(`[${tsDone}] [rates] Force refresh response status=${res.status} time=${durationMs}ms`);
  if (!res.ok) throw new Error(`Force refresh failed: ${res.status}`);
  const json = (await res.json()) as { conversion_rates: Record<string, number> };
  const mapped: Partial<UsdRates> = {};
  for (const [code, r] of Object.entries(json.conversion_rates)) {
    if (typeof r === "number") mapped[code] = r;
  }
  mapped["USD"] = 1;
  const usdRates = mapped as UsdRates;
  
  // Update both Redis and backup cache
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, JSON.stringify(usdRates));
      const tsSet = new Date().toISOString();
      console.log(`[${tsSet}] [rates] Redis OVERWRITE ${REDIS_KEY} (no TTL)`);
    } catch {}
  }
  
  // Always update backup cache
  backupCache = { data: usdRates, timestamp: Date.now() };
  const tsBackup = new Date().toISOString();
  console.log(`[${tsBackup}] [rates] Backup cache updated`);
  
  return usdRates;
}
