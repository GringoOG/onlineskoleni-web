/**
 * In-memory sliding-window rate limiter.
 *
 * On Vercel each serverless instance has its own memory, so this is best-effort
 * (stops naive floods / scripted bursts on a single instance). For stronger
 * cross-instance limits add Upstash Redis or enable Vercel Firewall later.
 */

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 5_000;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_KEYS) {
      // Drop oldest-ish entries when the map grows too large.
      const firstKey = buckets.keys().next().value;
      if (firstKey !== undefined) buckets.delete(firstKey);
    }
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  return { ok: true };
}
