// Simple in-memory sliding-window rate limiter.
// For multi-instance deployments, swap the Map for Redis.
const windows = new Map();

/**
 * @param {string} key      — unique identifier (e.g. IP or userId)
 * @param {number} limit    — max requests allowed
 * @param {number} windowMs — time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = windows.get(key) || { count: 0, start: now };

  // Reset window if expired
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }

  entry.count += 1;
  windows.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const resetMs   = entry.start + windowMs - now;
  return { allowed: entry.count <= limit, remaining, resetMs };
}

/** Extract best available IP from Next.js request headers */
export function getClientIp(req) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
