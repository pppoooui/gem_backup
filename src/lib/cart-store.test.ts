import { describe, expect, it } from "vitest";
import { deserializeCartLines } from "@/lib/cart-store";

describe("deserializeCartLines", () => {
  it("removes the exact legacy five-item demo cart", () => {
    const legacyCart = [
      { productId: "prod-round-1", variantId: "round-1-1000", quantity: 1000 },
      { productId: "prod-round-125", variantId: "round-125-1000", quantity: 2000 },
      { productId: "prod-round-150", variantId: "round-150-1000", quantity: 3000 },
      { productId: "prod-round-200", variantId: "round-200-1000", quantity: 3000 },
      { productId: "prod-round-250", variantId: "round-250-1000", quantity: 3000 },
    ];

    expect(deserializeCartLines(JSON.stringify(legacyCart))).toEqual([]);
  });

  it("preserves genuine customer cart lines", () => {
    const cart = [
      { productId: "prod-round-1", variantId: "round-1-1000", quantity: 500 },
    ];

    expect(deserializeCartLines(JSON.stringify(cart))).toEqual(cart);
  });
});
