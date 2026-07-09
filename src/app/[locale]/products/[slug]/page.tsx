import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { getProductBySlug } from "@/lib/products-supabase";
import { PUBLIC_SITE_NAME, SITE_URL } from "@/lib/site-config";
import type { Locale } from "@/types/domain";
import ProductDetailPage from "./[slug].client";

const locales = ["en", "zh"];
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
    title: `${name} | ${PUBLIC_SITE_NAME}`,
    description: `B2B ${name} — ${product.shape} ${product.material} ${product.grade} grade. MOQ from ${baseVariant?.moq ?? 0} pcs. Factory-direct pricing.`,
    alternates: {
      canonical: `${SITE_URL}/${locale}/products/${slug}`,
      languages: {
        en: `${SITE_URL}/en/products/${slug}`,
        zh: `${SITE_URL}/zh/products/${slug}`,
      },
    },
    openGraph: {
      title: `${name} — CZ Wholesale`,
      description: `MOQ ${baseVariant?.moq ?? 0} pcs · from US$ ${minPrice.toFixed(3)}/pc`,
      url: `${SITE_URL}/${locale}/products/${slug}`,
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
