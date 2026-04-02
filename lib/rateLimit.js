import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── Upstash Redis (production) ────────────────────────────────────────────────
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env vars.
// Get them free at https://upstash.com → create a Redis database → REST API tab.
const hasUpstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash ? new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
}) : null;

// ── In-memory fallback (dev / no Redis configured) ───────────────────────────
const windows = new Map();

function inMemoryRateLimit(key, limit, windowMs) {
  const now   = Date.now();
  const entry = windows.get(key) || { count: 0, start: now };
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
  entry.count += 1;
  windows.set(key, entry);
  return {
    allowed:   entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetMs:   entry.start + windowMs - now,
  };
}

// ── Upstash limiter cache (one limiter instance per window config) ────────────
const limiters = new Map();

function getUpstashLimiter(limit, windowMs) {
  const cacheKey = `${limit}:${windowMs}`;
  if (!limiters.has(cacheKey)) {
    limiters.set(cacheKey, new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
      analytics: false,
    }));
  }
  return limiters.get(cacheKey);
}

/**
 * Sliding-window rate limiter.
 * Uses Upstash Redis in production (persistent across serverless instances),
 * falls back to in-memory Map for local dev.
 *
 * @param {string} key      — unique identifier (e.g. IP or userId)
 * @param {number} limit    — max requests allowed
 * @param {number} windowMs — time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export async function rateLimit(key, limit, windowMs) {
  if (!hasUpstash) return inMemoryRateLimit(key, limit, windowMs);

  const limiter = getUpstashLimiter(limit, windowMs);
  const { success, remaining, reset } = await limiter.limit(key);
  return {
    allowed:   success,
    remaining: remaining ?? 0,
    resetMs:   reset ? reset - Date.now() : windowMs,
  };
}

/** Extract best available IP from Next.js request headers */
export function getClientIp(req) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
