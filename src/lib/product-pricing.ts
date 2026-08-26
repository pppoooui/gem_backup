import type { CartLine, PriceTier, ProductVariant } from "@/types/domain";

export type CatalogGrade = NonNullable<CartLine["grade"]>;

function roundUsd(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function priceTiersForGrade(
  variant: ProductVariant,
  grade: CatalogGrade = "5A",
): PriceTier[] {
  const baseTiers = [...variant.priceTiers].sort(
    (a, b) => a.minQuantity - b.minQuantity,
  );
  if (grade === "5A" || baseTiers.length === 0) return baseTiers;

  const basePrice = baseTiers[0].priceUsd;
  const threeAPrice = variant.price3AUsd ?? roundUsd(basePrice * 0.85);
  const ratio = basePrice > 0 ? threeAPrice / basePrice : 0.85;

  return baseTiers.map((tier) => ({
    ...tier,
    priceUsd: roundUsd(tier.priceUsd * ratio),
  }));
}

export function unitPriceForQuantity(
  variant: ProductVariant,
  quantity: number,
  grade: CatalogGrade = "5A",
): number {
  const tiers = priceTiersForGrade(variant, grade);
  const tier = [...tiers]
    .reverse()
    .find((item) => quantity >= item.minQuantity);
  return tier?.priceUsd ?? tiers[0]?.priceUsd ?? 0;
}
