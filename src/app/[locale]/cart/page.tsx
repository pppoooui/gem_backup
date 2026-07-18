import { notFound, redirect } from "next/navigation";
import { getPublishedProducts } from "@/lib/products-supabase";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import type { Locale } from "@/types/domain";
import CartPage from "./cart.client";

const locales = ["en", "zh"];
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CartRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  const storefrontSettings = await getStorefrontSettings();
  if (!storefrontSettings.showPrices) redirect(`/${locale}/products`);

  return (
    <CartPage
      locale={locale as Locale}
      products={await getPublishedProducts()}
    />
  );
}
