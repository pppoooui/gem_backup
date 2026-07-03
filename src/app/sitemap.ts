import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/products-supabase";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dfcgem.com";
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProducts();
  const productPages: MetadataRoute.Sitemap = products.flatMap((product) =>
    (["en", "zh"] as const).map((locale) => ({
      url: `${BASE_URL}/${locale}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: locale === "en" ? 0.8 : 0.7,
    })),
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/zh`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/zh/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productPages,
  ];
}
