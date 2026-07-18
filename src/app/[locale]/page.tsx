import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/home/home-experience";
import { getHomeContent } from "@/lib/home-content-server";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import type { Locale } from "@/types/domain";

const locales = ["en", "zh"];
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const [content, storefrontSettings] = await Promise.all([
    getHomeContent(),
    getStorefrontSettings(),
  ]);

  return <HomeExperience locale={locale as Locale} content={content} storefrontSettings={storefrontSettings} />;
}
