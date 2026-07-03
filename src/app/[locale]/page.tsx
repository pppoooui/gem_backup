import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/home/home-experience";
import { getHomeContent } from "@/lib/home-content-server";
import type { Locale } from "@/types/domain";

const locales = ["en", "zh"];

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

  const content = await getHomeContent();

  return <HomeExperience locale={locale as Locale} content={content} />;
}
