/**
 * Simple fixed-window rate limiter keyed by an arbitrary string (usually an IP).
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
 *   if (!limiter.allow(ip)) { ... reject ... }
 */
function createRateLimiter({ limit = 60, windowMs = 60_000, now = Date.now } = {}) {
  if (limit < 1) throw new RangeError('limit must be at least 1');
  if (windowMs < 1) throw new RangeError('windowMs must be at least 1');

  const buckets = new Map();

  function bucketFor(key, timestamp) {
    const bucket = buckets.get(key);
    if (bucket && timestamp - bucket.start < windowMs) return bucket;
    const fresh = { start: timestamp, count: 0 };
    buckets.set(key, fresh);
    return fresh;
  }

  function allow(key) {
    const bucket = bucketFor(key, now());
    if (bucket.count >= limit) return false;
    bucket.count += 1;
    return true;
  }

  function remaining(key) {
    const bucket = buckets.get(key);
    if (!bucket || now() - bucket.start >= windowMs) return limit;
    return Math.max(0, limit - bucket.count);
  }

  function prune() {
    const timestamp = now();
    for (const [key, bucket] of buckets) {
      if (timestamp - bucket.start >= windowMs) buckets.delete(key);
    }
  }

  function reset(key) {
    if (key === undefined) buckets.clear();
    else buckets.delete(key);
  }

  return { allow, remaining, prune, reset };
}

module.exports = { createRateLimiter };
