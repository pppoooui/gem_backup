import type { ReactNode } from "react";
import Link from "next/link";
import { Gem, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import {
  PUBLIC_ADDRESS_EN,
  PUBLIC_ADDRESS_ZH,
  PUBLIC_CONTACT_EMAIL,
  PUBLIC_CONTACT_PHONE,
  PUBLIC_LINE_URL,
  PUBLIC_SITE_NAME,
} from "@/lib/site-config";
import type { Locale } from "@/types/domain";

export type ComplianceSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const labels = {
  en: {
    home: "Home",
    products: "Products",
    contact: "Contact",
    language: "中文",
    updated: "Last updated",
    business: "Business information",
    location: "Business location",
    policies: "Policies & support",
    about: "About Us",
    shipping: "Shipping Policy",
    returns: "Return & Refund Policy",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    rights: "All rights reserved.",
  },
  zh: {
    home: "首页",
    products: "产品",
    contact: "联系",
    language: "English",
    updated: "最后更新",
    business: "商家信息",
    location: "经营地点",
    policies: "政策与支持",
    about: "关于我们",
    shipping: "运输政策",
    returns: "退货与退款政策",
    terms: "服务条款",
    privacy: "隐私政策",
    rights: "版权所有。",
  },
} as const;

const policyRoutes = [
  ["about", "about"],
  ["shipping", "shipping"],
  ["returns", "return-refund-policy"],
  ["terms", "terms"],
  ["privacy", "privacy"],
] as const;

export function CompliancePage({
  locale,
  slug,
  eyebrow,
  title,
  summary,
  sections,
  children,
}: {
  locale: Locale;
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  sections: ComplianceSection[];
  children?: ReactNode;
}) {
  const t = labels[locale];
  const otherLocale = locale === "en" ? "zh" : "en";
  const base = `/${locale}`;

  return (
    <div className="min-h-screen bg-[#f6f3ef] text-[#1f2424]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex min-h-20 max-w-[1180px] items-center justify-between gap-5 px-5 sm:px-8">
          <Link href={base} className="inline-flex items-center gap-2" aria-label={`${PUBLIC_SITE_NAME} home`}>
            <Gem className="size-6 text-[#a97342]" />
            <span>
              <span className="block text-lg font-semibold tracking-[0.12em]">DFC</span>
              <span className="block text-[9px] uppercase tracking-[0.16em]">Cubic Zirconia Factory</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-7">
            <Link href={base} className="hover:text-[#9a6a3a]">{t.home}</Link>
            <Link href={`${base}/products`} className="hidden hover:text-[#9a6a3a] sm:block">{t.products}</Link>
            <Link href={`${base}/contact`} className="hidden hover:text-[#9a6a3a] sm:block">{t.contact}</Link>
            <Link href={`/${otherLocale}/${slug}`} className="rounded-full border border-black/15 px-3 py-1.5 font-medium hover:border-[#9a6a3a]">
              {t.language}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <article className="rounded-2xl border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(35,29,23,0.05)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6a3a]">{eyebrow}</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-black/62">{summary}</p>
            <p className="mt-4 text-xs text-black/42">{t.updated}: 24 August 2026</p>

            {children}

            <div className="mt-10 space-y-9 border-t border-black/8 pt-9">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-sm leading-7 text-black/62">{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#a97342]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-black/8 bg-white p-5">
              <h2 className="text-sm font-semibold">{t.business}</h2>
              <p className="mt-4 text-sm font-medium">{PUBLIC_SITE_NAME}</p>
              <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="mt-4 flex items-start gap-2 text-sm text-black/58 hover:text-[#9a6a3a]">
                <Mail className="mt-0.5 size-4 shrink-0" />{PUBLIC_CONTACT_EMAIL}
              </a>
              <a href={`https://wa.me/${PUBLIC_CONTACT_PHONE.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="mt-3 flex items-start gap-2 text-sm text-black/58 hover:text-[#9a6a3a]">
                <Phone className="mt-0.5 size-4 shrink-0" />WhatsApp · {PUBLIC_CONTACT_PHONE}
              </a>
              <a href={PUBLIC_LINE_URL} target="_blank" rel="noreferrer" className="mt-3 flex items-start gap-2 text-sm text-black/58 hover:text-[#9a6a3a]">
                <MessageCircle className="mt-0.5 size-4 shrink-0" />LINE · {PUBLIC_CONTACT_PHONE}
              </a>
              <p className="mt-3 flex items-start gap-2 text-sm text-black/58">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span><span className="block text-xs text-black/38">{t.location}</span>{locale === "zh" ? PUBLIC_ADDRESS_ZH : PUBLIC_ADDRESS_EN}</span>
              </p>
            </section>

            <section className="rounded-2xl border border-black/8 bg-white p-5">
              <h2 className="text-sm font-semibold">{t.policies}</h2>
              <nav className="mt-4 space-y-3 text-sm text-black/58">
                {policyRoutes.map(([key, route]) => (
                  <Link key={route} href={`${base}/${route}`} className="block hover:text-[#9a6a3a]">
                    {t[key]}
                  </Link>
                ))}
                <Link href={`${base}/contact`} className="block hover:text-[#9a6a3a]">{t.contact}</Link>
              </nav>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t border-black/10 bg-white px-5 py-7 text-xs text-black/44 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {PUBLIC_SITE_NAME}. {t.rights}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={`${base}/return-refund-policy`}>{t.returns}</Link>
            <Link href={`${base}/terms`}>{t.terms}</Link>
            <Link href={`${base}/privacy`}>{t.privacy}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
