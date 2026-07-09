import type { Product } from "@/types/domain";

export function toPublicRoundColorlessProducts(
  products: Product[],
): Product[] {
  return products.flatMap((product) => {
    if (product.shape !== "Round") return [];

    const variants = product.variants.filter(
      (variant) => variant.color.trim().toLowerCase() === "colorless",
    );

    return variants.length > 0 ? [{ ...product, variants }] : [];
  });
}
