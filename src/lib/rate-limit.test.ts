import { describe, expect, it } from "vitest";
import { consumeRateLimit, resetRateLimitsForTests } from "@/lib/rate-limit";

describe("consumeRateLimit", () => {
  it("blocks requests after the configured window limit", () => {
    resetRateLimitsForTests();

    const first = consumeRateLimit("orders:127.0.0.1", {
      limit: 2,
      windowMs: 1000,
      now: 1_000,
    });
    const second = consumeRateLimit("orders:127.0.0.1", {
      limit: 2,
      windowMs: 1000,
      now: 1_100,
    });
    const third = consumeRateLimit("orders:127.0.0.1", {
      limit: 2,
      windowMs: 1000,
      now: 1_200,
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third).toMatchObject({ allowed: false, retryAfterSeconds: 1 });
  });

  it("allows requests again after the window expires", () => {
    resetRateLimitsForTests();

    consumeRateLimit("orders:127.0.0.1", {
      limit: 1,
      windowMs: 1000,
      now: 1_000,
    });

    expect(
      consumeRateLimit("orders:127.0.0.1", {
        limit: 1,
        windowMs: 1000,
        now: 2_001,
      }).allowed,
    ).toBe(true);
  });
});
