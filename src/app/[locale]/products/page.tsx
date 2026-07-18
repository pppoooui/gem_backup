import { notFound } from "next/navigation";
import { CatalogExperience } from "@/components/catalog/catalog-experience";
import { getPaymentMethods } from "@/lib/payment-methods";
import { getPublishedProducts } from "@/lib/products-supabase";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import type { Locale } from "@/types/domain";

const locales = ["en", "zh"];
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const [products, paymentMethods, storefrontSettings] = await Promise.all([
    getPublishedProducts(),
    getPaymentMethods(),
    getStorefrontSettings(),
  ]);

  return (
    <CatalogExperience
      locale={locale as Locale}
      products={products}
      paymentMethods={paymentMethods}
      whatsappNumber={storefrontSettings.whatsappNumber}
      showProductDetails={storefrontSettings.showProductDetails}
      showPrices={storefrontSettings.showPrices}
    />
  );
}
