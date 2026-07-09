/**
 * Supabase-backed product fetching.
 *
 * During static / local-JSON MVP, products are read from a centralised JS
 * data file (src/data/products.ts).  This module provides the same Product[]
 * shape but sourced from Supabase when the table is populated.
 *
 * Usage:
 *   const products = await getPublishedProducts();
 *
 * The function returns the static dataset as a fallback when:
 *   - The Supabase client can't be initialised (missing env vars)
 *   - The products table is empty (initial state)
 */

import { products as staticProducts } from "@/data/products";
import { createClient } from "@supabase/supabase-js";
import { toPublicRoundColorlessProducts } from "@/lib/public-products";
import type { Product } from "@/types/domain";

const fallbackProducts = toPublicRoundColorlessProducts(staticProducts);

async function fetchFromSupabase(): Promise<Product[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return fallbackProducts;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      sku,
      slug,
      name_en,
      name_zh,
      shape,
      material,
      cut,
      clarity,
      grade,
      hs_code,
      cover_image_path,
      status,
      created_at,
      product_variants (
        id,
        product_id,
        size_mm,
        color,
        clarity,
        package_unit,
        moq,
        stock_status,
        stock_note,
        weight_grams,
        price_tiers (
          id,
          variant_id,
          min_quantity,
          price_usd,
          label
        )
      )
    `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[supabase] products fetch failed, using static fallback", error?.message);
    return fallbackProducts;
  }

  const mapped: Product[] = data
    .map((row: Record<string, unknown>) => ({
      id: row.id as string,
      sku: (row.sku as string | null) ?? (row.slug as string),
      slug: row.slug as string,
      nameEn: row.name_en as string,
      nameZh: row.name_zh as string,
      shape: row.shape as Product["shape"],
      material: row.material as string,
      cut: row.cut as string,
      clarity: (row.clarity as string | null) ?? "VS",
      grade: row.grade as Product["grade"],
      hsCode: (row.hs_code as string | null) ?? "",
      imagePath: (row.cover_image_path as string | null) ?? "/products/round-1mm.png",
      variants: ((row.product_variants as Array<Record<string, unknown>>) ?? [])
        .map((v) => ({
          id: v.id as string,
          sizeMm: v.size_mm as string,
          color: v.color as string,
          clarity: (v.clarity as string | null) ?? "VS",
          packageUnit: v.package_unit as string,
          moq: Number(v.moq),
          stockStatus: v.stock_status as Product["variants"][number]["stockStatus"],
          stockNote: v.stock_note as string | undefined,
          weightGrams: Number(v.weight_grams ?? 0),
          priceTiers: ((v.price_tiers as Array<Record<string, unknown>>) ?? [])
            .map((t) => ({
              minQuantity: Number(t.min_quantity),
              priceUsd: Number(t.price_usd),
              label: (t.label as string | null) ?? `${t.min_quantity}+`,
            }))
            .filter((tier) => Number.isFinite(tier.minQuantity) && Number.isFinite(tier.priceUsd))
            .sort((a, b) => a.minQuantity - b.minQuantity),
        }))
        .filter((variant) => variant.priceTiers.length > 0)
        .sort((a, b) => a.sizeMm.localeCompare(b.sizeMm, undefined, { numeric: true })),
    }))
    .filter((product) => product.variants.length > 0);

  const publicProducts = toPublicRoundColorlessProducts(mapped);
  return publicProducts.length > 0 ? publicProducts : fallbackProducts;
}

/**
 * getPublishedProducts returns the full published product list.
 *
 * On first call it fetches from Supabase; subsequent calls return the
 * cached result.  If Supabase is unreachable or empty, falls back to
 * static product data.
 */
export async function getPublishedProducts(): Promise<Product[]> {
  try {
    return await fetchFromSupabase();
  } catch (err) {
    console.warn("[supabase] products fetch failed, using static fallback", err);
    return fallbackProducts;
  }
}

/**
 * getProductBySlug fetches a single published product.  Falls back to static
 * lookup when Supabase is unavailable.
 */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getPublishedProducts();
  return products.find((p) => p.slug === slug);
}

/**
 * Reset the cache — useful in dev / when products are edited from the admin.
 */
export function invalidateProductCache(): void {
  // Product reads are intentionally uncached so admin changes appear immediately.
}
