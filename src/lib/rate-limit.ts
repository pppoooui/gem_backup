type RateLimitOptions = {
  limit: number;
  windowMs: number;
  now?: number;
};

type RateLimitResult =
  | { allowed: true; remaining: number; retryAfterSeconds: 0 }
  | { allowed: false; remaining: 0; retryAfterSeconds: number };

type RateLimitStore = Map<string, number[]>;

declare global {
  var __dfcgemRateLimits: RateLimitStore | undefined;
}

function rateLimitStore() {
  if (!globalThis.__dfcgemRateLimits) {
    globalThis.__dfcgemRateLimits = new Map();
  }

  return globalThis.__dfcgemRateLimits;
}

export function consumeRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = options.now ?? Date.now();
  const windowStart = now - options.windowMs;
  const store = rateLimitStore();
  const hits = (store.get(key) ?? []).filter((hit) => hit > windowStart);

  if (hits.length >= options.limit) {
    const retryAfterMs = hits[0] + options.windowMs - now;
    store.set(key, hits);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  hits.push(now);
  store.set(key, hits);

  return {
    allowed: true,
    remaining: options.limit - hits.length,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitsForTests() {
  rateLimitStore().clear();
}
