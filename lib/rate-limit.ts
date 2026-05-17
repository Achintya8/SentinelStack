// SECURITY FIX: lightweight in-memory rate limiter for auth-sensitive routes.
// Fixed-window counter keyed by `${prefix}:${ip}`. Good enough for a single
// Node process / hackathon scale. For multi-instance prod, swap for Redis.

type Bucket = { count: number; resetAt: number };

const globalForLimiter = globalThis as typeof globalThis & {
  __sentinelRateLimiter?: Map<string, Bucket>;
};

const buckets =
  globalForLimiter.__sentinelRateLimiter ??
  (globalForLimiter.__sentinelRateLimiter = new Map<string, Bucket>());

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
};

export function rateLimit({
  key,
  limit,
  windowMs
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0, resetAt };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      resetAt: existing.resetAt
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
    resetAt: existing.resetAt
  };
}

// Opportunistic cleanup so the map doesn't grow unbounded. Cheap and bounded —
// only triggers when the map is large.
export function pruneExpired() {
  if (buckets.size < 5000) return;
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

export function getRateLimitIp(headerBag: Headers): string {
  const forwarded = headerBag.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerBag.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}
