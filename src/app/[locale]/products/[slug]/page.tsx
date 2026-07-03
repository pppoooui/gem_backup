import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { getProductBySlug } from "@/lib/products-supabase";
import type { Locale } from "@/types/domain";
import ProductDetailPage from "./[slug].client";

const locales = ["en", "zh"];
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dfcgem.com";
export const revalidate = 60;

export function generateStaticParams() {
  return products.flatMap((product) =>
    locales.map((locale) => ({
      locale,
      slug: product.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const name = locale === "zh" ? product.nameZh : product.nameEn;
  const baseVariant = product.variants[0];
  const minPrice = baseVariant?.priceTiers?.[0]?.priceUsd ?? 0;

  return {
    title: `${name} | CZ Wholesale — DFCgem`,
    description: `B2B ${name} — ${product.shape} ${product.material} ${product.grade} grade. MOQ from ${baseVariant?.moq ?? 0} pcs. Factory-direct pricing.`,
    alternates: {
      canonical: `${BASE_URL}/${locale}/products/${slug}`,
      languages: {
        en: `${BASE_URL}/en/products/${slug}`,
        zh: `${BASE_URL}/zh/products/${slug}`,
      },
    },
    openGraph: {
      title: `${name} — CZ Wholesale`,
      description: `MOQ ${baseVariant?.moq ?? 0} pcs · from US$ ${minPrice.toFixed(3)}/pc`,
      url: `${BASE_URL}/${locale}/products/${slug}`,
      images: [product.imagePath],
    },
  };
}

export default async function ProductRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!locales.includes(locale)) notFound();

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetailPage locale={locale as Locale} product={product} />;
}
