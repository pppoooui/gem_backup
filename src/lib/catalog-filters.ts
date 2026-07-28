import type { Product, ProductVariant } from "@/types/domain";

export type CatalogSort =
  | "best_match"
  | "size_asc"
  | "size_desc"
  | "name_asc";

export type CatalogFilterState = {
  query: string;
  shapes: string[];
  colors: string[];
  grades: string[];
  cuts: string[];
  minSize: number;
  maxSize: number;
};

export function normalizeCatalogColor(color: string) {
  const normalized = color.trim().toLowerCase();
  if (normalized === "white" || normalized === "colorless") {
    return "Colorless";
  }
  return color.trim();
}

export function variantSizeRange(variant: Pick<ProductVariant, "sizeMm">) {
  const values = variant.sizeMm
    .match(/\d+(?:\.\d+)?/g)
    ?.map((value) => Number.parseFloat(value))
    .filter(Number.isFinite);

  if (!values?.length) {
    return { min: 0, max: Number.POSITIVE_INFINITY };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function variantMatches(
  variant: ProductVariant,
  filters: CatalogFilterState,
) {
  const size = variantSizeRange(variant);
  const color = normalizeCatalogColor(variant.color);
  const matchesColor =
    filters.colors.length === 0 || filters.colors.includes(color);
  const matchesSize =
    size.max >= filters.minSize && size.min <= filters.maxSize;

  return matchesColor && matchesSize;
}

export function filterCatalogProducts(
  products: Product[],
  filters: CatalogFilterState,
) {
  const query = filters.query.trim().toLowerCase();

  return products.filter((product) => {
    const matchesQuery =
      !query ||
      [
        product.nameEn,
        product.nameZh,
        product.sku,
        product.shape,
        product.cut,
        ...product.variants.flatMap((variant) => [
          variant.id,
          variant.sizeMm,
          variant.color,
        ]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesShape =
      filters.shapes.length === 0 || filters.shapes.includes(product.shape);
    const matchesGrade =
      filters.grades.length === 0 || filters.grades.includes(product.grade);
    const matchesCut =
      filters.cuts.length === 0 || filters.cuts.includes(product.cut);

    return (
      matchesQuery &&
      matchesShape &&
      matchesGrade &&
      matchesCut &&
      product.variants.some((variant) => variantMatches(variant, filters))
    );
  });
}

function firstProductSize(product: Product) {
  return Math.min(
    ...product.variants.map((variant) => variantSizeRange(variant).min),
  );
}

export function sortCatalogProducts(
  products: Product[],
  sort: CatalogSort,
) {
  const sorted = [...products];

  if (sort === "size_asc") {
    return sorted.sort((a, b) => firstProductSize(a) - firstProductSize(b));
  }
  if (sort === "size_desc") {
    return sorted.sort((a, b) => firstProductSize(b) - firstProductSize(a));
  }
  if (sort === "name_asc") {
    return sorted.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }

  return sorted;
}
