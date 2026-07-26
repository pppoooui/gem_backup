import type { Product, ProductVariant } from "@/types/domain";

// These are the public quote sizes. The catalog deliberately keeps prices out
// of this list; customer-specific pricing is added by sales after inquiry.
export const catalogSizeValues = [
  1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55,
  1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2, 2.05, 2.1, 2.15,
  2.25, 2.3, 2.5, 2.55, 2.6, 2.65, 2.8, 2.9, 3, 3.1, 3.25, 3.3,
  3.75, 3.8,
  ...Array.from({ length: 33 }, (_, index) => 4 + index * 0.25),
] as const;

export const catalogSizeOptions = catalogSizeValues.map((value) => `${value} mm`);

export function createQuoteVariant(sizeMm: string): ProductVariant {
  return {
    id: `round-white-${sizeMm.replace(".", "-")}`,
    sizeMm,
    color: "White",
    clarity: "VS",
    packageUnit: "1,000 pcs",
    moq: 1000,
    stockStatus: "quote_only",
    stockNote: "Confirm batch",
    weightGrams: 0,
    priceTiers: [{ minQuantity: 1000, priceUsd: 0, label: "Quote" }],
  };
}

export function createQuoteCatalogProduct(): Product {
  const variants = catalogSizeOptions.map(createQuoteVariant);
  return {
    id: "prod-round-white-quote",
    sku: "CZ-ROUND-WHITE-QUOTE",
    slug: "round-white-cubic-zirconia",
    nameEn: "Round White Cubic Zirconia",
    nameZh: "圆形白色立方氧化锆",
    shape: "Round",
    material: "Cubic Zirconia",
    cut: "Excellent",
    clarity: "VS",
    grade: "5A",
    hsCode: "7104.90",
    imagePath: "/products/round-1mm.png",
    variants,
  };
}
