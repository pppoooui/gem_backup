import { notFound } from "next/navigation";
import { getPublishedProducts } from "@/lib/products-supabase";
import type { Locale } from "@/types/domain";
import CartPage from "./cart.client";

const locales = ["en", "zh"];

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

  return (
    <CartPage
      locale={locale as Locale}
      products={await getPublishedProducts()}
    />
  );
}
