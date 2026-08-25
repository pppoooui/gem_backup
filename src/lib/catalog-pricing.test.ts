import { describe, expect, it } from "vitest";
import { wholesaleUnitPriceUsd } from "@/lib/catalog-pricing";

describe("wholesaleUnitPriceUsd", () => {
  it("uses the approved USD wholesale price bands", () => {
    expect(wholesaleUnitPriceUsd("1 mm")).toBe(0.1);
    expect(wholesaleUnitPriceUsd("2.5 mm")).toBe(0.12);
    expect(wholesaleUnitPriceUsd("4.75 mm")).toBe(0.18);
    expect(wholesaleUnitPriceUsd("6.75 mm")).toBe(0.26);
    expect(wholesaleUnitPriceUsd("9.25 mm")).toBe(0.35);
    expect(wholesaleUnitPriceUsd("12 mm")).toBe(0.4);
  });

  it("keeps every catalog price inside the public range", () => {
    for (let size = 1; size <= 12; size += 0.05) {
      expect(wholesaleUnitPriceUsd(size)).toBeGreaterThanOrEqual(0.1);
      expect(wholesaleUnitPriceUsd(size)).toBeLessThanOrEqual(0.4);
    }
  });
});
