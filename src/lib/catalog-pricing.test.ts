import { describe, expect, it } from "vitest";
import { wholesaleUnitPriceUsd } from "@/lib/catalog-pricing";
import { catalogSizeOptions } from "@/lib/catalog-specs";

describe("wholesaleUnitPriceUsd", () => {
  it("increases smoothly with size inside the approved range", () => {
    expect(wholesaleUnitPriceUsd("1 mm")).toBe(0.1);
    expect(wholesaleUnitPriceUsd("2.5 mm")).toBe(0.141);
    expect(wholesaleUnitPriceUsd("4.75 mm")).toBe(0.202);
    expect(wholesaleUnitPriceUsd("6.75 mm")).toBe(0.257);
    expect(wholesaleUnitPriceUsd("9.25 mm")).toBe(0.325);
    expect(wholesaleUnitPriceUsd("12 mm")).toBe(0.4);
  });

  it("gives every one of the 71 catalog sizes a unique price", () => {
    const prices = catalogSizeOptions.map(wholesaleUnitPriceUsd);

    expect(prices).toHaveLength(71);
    expect(new Set(prices)).toHaveLength(71);
    expect(prices[0]).toBe(0.1);
    expect(prices.at(-1)).toBe(0.4);
    expect(prices.every((price, index) => index === 0 || price > prices[index - 1])).toBe(true);
  });
});
