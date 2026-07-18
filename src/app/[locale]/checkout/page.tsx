import { notFound, redirect } from "next/navigation";
import { getEnabledPaymentMethods } from "@/lib/payment-methods";
import { getPublishedProducts } from "@/lib/products-supabase";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import type { Locale } from "@/types/domain";
import CheckoutPage from "./checkout.client";

const locales = ["en", "zh"];
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CheckoutRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  const storefrontSettings = await getStorefrontSettings();
  if (!storefrontSettings.showPrices) redirect(`/${locale}/products`);
  const [products, paymentMethods] = await Promise.all([
    getPublishedProducts(),
    getEnabledPaymentMethods(),
  ]);

  return (
    <CheckoutPage
      locale={locale as Locale}
      products={products}
      paymentMethods={paymentMethods}
    />
  );
}
