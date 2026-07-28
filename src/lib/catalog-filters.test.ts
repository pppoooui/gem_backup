import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import {
  filterCatalogProducts,
  normalizeCatalogColor,
  sortCatalogProducts,
  variantSizeRange,
} from "@/lib/catalog-filters";

describe("catalog filters", () => {
  it("treats white stones as colorless", () => {
    expect(normalizeCatalogColor("White")).toBe("Colorless");
    expect(normalizeCatalogColor("Colorless")).toBe("Colorless");
  });

  it("parses both single sizes and ranges", () => {
    expect(variantSizeRange({ sizeMm: "1.25 mm" })).toEqual({
      min: 1.25,
      max: 1.25,
    });
    expect(variantSizeRange({ sizeMm: "1.00 - 3.00 mm" })).toEqual({
      min: 1,
      max: 3,
    });
  });

  it("filters products by active facets and size", () => {
    const filtered = filterCatalogProducts(products, {
      query: "",
      shapes: ["Round"],
      colors: ["Colorless"],
      grades: ["5A"],
      cuts: ["Excellent"],
      minSize: 1.4,
      maxSize: 1.6,
    });

    expect(
      filtered.some((product) =>
        product.variants.some((variant) => variant.sizeMm === "1.50 mm"),
      ),
    ).toBe(true);
    expect(
      filtered.every((product) =>
        product.variants.some((variant) => {
          const size = variantSizeRange(variant);
          return size.max >= 1.4 && size.min <= 1.6;
        }),
      ),
    ).toBe(true);
  });

  it("sorts matching products by size", () => {
    const sorted = sortCatalogProducts(products, "size_desc");
    expect(
      Number.parseFloat(sorted[0].variants[0].sizeMm),
    ).toBeGreaterThanOrEqual(
      Number.parseFloat(sorted.at(-1)!.variants[0].sizeMm),
    );
  });
});
