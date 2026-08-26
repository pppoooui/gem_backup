import { describe, expect, it } from "vitest";
import { priceTiersForGrade, unitPriceForQuantity } from "@/lib/product-pricing";
import type { ProductVariant } from "@/types/domain";

const variant: ProductVariant = {
  id: "4.25-mm",
  sizeMm: "4.25 mm",
  color: "Colorless",
  clarity: "VS",
  packageUnit: "pcs",
  moq: 1000,
  stockStatus: "in_stock",
  weightGrams: 0,
  price3AUsd: 0.182,
  priceTiers: [
    { minQuantity: 1000, priceUsd: 0.189, label: "1,000+ pcs" },
    { minQuantity: 10000, priceUsd: 0.17, label: "10,000+ pcs" },
  ],
};

describe("grade-aware product pricing", () => {
  it("keeps 5A prices unchanged", () => {
    expect(unitPriceForQuantity(variant, 1000, "5A")).toBe(0.189);
    expect(unitPriceForQuantity(variant, 10000, "5A")).toBe(0.17);
  });

  it("uses the configured 3A price and scales volume tiers", () => {
    expect(unitPriceForQuantity(variant, 1000, "3A")).toBe(0.182);
    expect(priceTiersForGrade(variant, "3A")[1].priceUsd).toBe(0.164);
  });
});
