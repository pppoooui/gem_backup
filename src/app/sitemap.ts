import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/products-supabase";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProducts();
  const publicPages = [
    "about",
    "contact",
    "shipping",
    "return-refund-policy",
    "terms",
    "privacy",
    "payment",
  ];
  const productPages: MetadataRoute.Sitemap = products.flatMap((product) =>
    (["en", "zh"] as const).map((locale) => ({
      url: `${SITE_URL}/${locale}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: locale === "en" ? 0.8 : 0.7,
    })),
  );
  const informationPages: MetadataRoute.Sitemap = publicPages.flatMap((page) =>
    (["en", "zh"] as const).map((locale) => ({
      url: `${SITE_URL}/${locale}/${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/zh`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/en/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/zh/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...informationPages,
    ...productPages,
  ];
}
