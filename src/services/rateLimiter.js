/**
 * In-memory rate limiter using token bucket / sliding window approach.
 * For production, replace with Redis-backed implementation.
 */

const buckets = new Map();

/**
 * Check and consume a rate limit token.
 * @param {string} key - Unique key (e.g. IP address, user ID)
 * @param {number} maxRequests - Maximum requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();

  if (!buckets.has(key)) {
    buckets.set(key, { count: 0, windowStart: now });
  }

  const bucket = buckets.get(key);

  // Reset window if expired
  if (now - bucket.windowStart >= windowMs) {
    bucket.count = 0;
    bucket.windowStart = now;
  }

  const resetAt = bucket.windowStart + windowMs;

  if (bucket.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: maxRequests - bucket.count, resetAt };
}

/**
 * Express middleware factory for rate limiting.
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Window size in milliseconds
 * @param {function} [keyFn] - Function to extract key from request (defaults to IP)
 */
export function createRateLimiter(maxRequests, windowMs, keyFn) {
  return (req, res, next) => {
    const key = keyFn ? keyFn(req) : (req.ip || req.connection.remoteAddress || 'unknown');
    const result = checkRateLimit(key, maxRequests, windowMs);

    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', result.remaining);
    res.set('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      });
    }
    next();
  };
}

/** Clear all rate limit buckets (for testing). */
export function clearBuckets() {
  buckets.clear();
}
