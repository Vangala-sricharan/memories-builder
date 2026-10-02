/**
 * Lightweight in-memory sliding-window rate limiter for free-tier abuse protection.
 * Protects server endpoints from automated spam without requiring third-party paid services.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Purge old IP entries periodically to avoid memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 3600000); // 1 hour
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}, 600000); // Every 10 minutes

/**
 * Checks if a client IP exceeds the allowed request count within the specified window.
 */
export function checkRateLimit(
  ip: string,
  action: 'publish' | 'upload' | 'read' | 'ai',
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds?: number } {
  const key = `${action}:${ip || 'unknown'}`;
  const now = Date.now();

  let entry = rateLimitMap.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(key, entry);
  }

  // Remove timestamps outside the sliding window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}
