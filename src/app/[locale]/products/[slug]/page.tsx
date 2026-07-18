import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { getProductBySlug } from "@/lib/products-supabase";
import { PUBLIC_SITE_NAME, SITE_URL } from "@/lib/site-config";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import type { Locale } from "@/types/domain";
import ProductDetailPage from "./[slug].client";

const locales = ["en", "zh"];
export const dynamic = "force-dynamic";

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
  return {
    title: `${name} | ${PUBLIC_SITE_NAME}`,
    description: `B2B ${name} from DFC Cubic Zirconia Factory. Request a quotation for 1-12 mm, 3A and 5A requirements.`,
    alternates: {
      canonical: `${SITE_URL}/${locale}/products/${slug}`,
      languages: {
        en: `${SITE_URL}/en/products/${slug}`,
        zh: `${SITE_URL}/zh/products/${slug}`,
      },
    },
    openGraph: {
      title: `${name} — CZ Wholesale`,
      description: `Wholesale cubic zirconia. Request a quotation for your quantity and specification.`,
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

  const storefrontSettings = await getStorefrontSettings();
  return <ProductDetailPage locale={locale as Locale} product={product} showProductDetails={storefrontSettings.showProductDetails} showPrices={storefrontSettings.showPrices} />;
}
