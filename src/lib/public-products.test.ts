import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { toPublicRoundColorlessProducts } from "@/lib/public-products";

describe("toPublicRoundColorlessProducts", () => {
  it("excludes non-round products", () => {
    const result = toPublicRoundColorlessProducts(products);

    expect(result.every((product) => product.shape === "Round")).toBe(true);
    expect(result.some((product) => product.shape === "Princess")).toBe(false);
  });

  it("removes colored variants and products with no colorless variants", () => {
    const source = [
      {
        ...products[0],
        variants: [
          products[0].variants[0],
          { ...products[0].variants[0], id: "round-red", color: "Red" },
        ],
      },
      {
        ...products[1],
        id: "colored-only",
        variants: [
          { ...products[1].variants[0], id: "round-blue", color: "Blue" },
        ],
      },
    ];

    const result = toPublicRoundColorlessProducts(source);

    expect(result).toHaveLength(1);
    expect(result[0].variants).toHaveLength(1);
    expect(result[0].variants[0].color).toBe("Colorless");
  });
});
