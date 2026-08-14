type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * A fixed window counter held in memory.
 *
 * Honest about what this is: each serverless instance keeps its own map, so somebody
 * spreading attempts across instances gets more than the stated allowance, and the
 * whole thing empties when an instance is recycled. It is not a defence against a
 * determined attacker.
 *
 * What it does do is stop a script hammering the login endpoint from one place, at no
 * infrastructure cost. The real protection on this endpoint is that Supabase rate
 * limits authentication itself, public signup is disabled so exactly one account can
 * ever exist, and the address is never linked from anywhere. If the admin ever grows
 * past one operator, replace this with something backed by the database.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Keeps the map from growing without bound on a long lived instance. */
export function pruneRateLimits(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}
