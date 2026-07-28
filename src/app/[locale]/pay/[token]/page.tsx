import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, FileText, ShieldCheck } from "lucide-react";
import { CustomPaymentActions } from "@/components/payments/custom-payment-actions";
import { getCustomPaymentLinkByToken } from "@/lib/custom-payment-links";
import { getEnabledPaymentMethods } from "@/lib/payment-methods";
import { PUBLIC_SITE_NAME } from "@/lib/site-config";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import { formatUsd } from "@/lib/utils";
import type { Locale } from "@/types/domain";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function CustomPaymentPage({
  params,
}: {
  params: Promise<{ locale: Locale; token: string }>;
}) {
  const { locale, token } = await params;
  if (!["en", "zh"].includes(locale)) notFound();

  const [link, paymentMethods, settings] = await Promise.all([
    getCustomPaymentLinkByToken(token),
    getEnabledPaymentMethods(),
    getStorefrontSettings(),
  ]);
  if (!link) notFound();

  const zh = locale === "zh";

  return (
    <main className="min-h-screen bg-[#f7f9f8] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href={`/${locale}`} className="text-xl font-bold text-[#002b35]">
            {PUBLIC_SITE_NAME}
          </Link>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
            <ShieldCheck className="size-4" />
            {zh ? "安全自定义报价" : "Secure custom quote"}
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#005466]">
            {zh ? "自定义规格付款链接" : "Custom specification payment link"}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[#002b35]">
            {link.title}
          </h1>
          {link.customerName && (
            <p className="mt-2 text-sm text-slate-500">
              {zh ? "客户" : "Prepared for"}: {link.customerName}
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                {zh ? "数量 / 包装" : "Quantity / packing"}
              </p>
              <p className="mt-1 font-semibold">{link.quantity}</p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-700">
                {zh ? "应付总额" : "Amount due"}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#003f4b]">
                {formatUsd(link.amountUsd)}
              </p>
              <p className="text-xs text-emerald-700">USD</p>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-slate-200 p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <FileText className="size-4 text-[#005466]" />
              {zh ? "商品规格" : "Specification"}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {link.specification}
            </p>
          </div>

          {link.note && (
            <div className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              {link.note}
            </div>
          )}

          {link.expiresAt && (
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <CalendarClock className="size-4" />
              {zh ? "有效期至" : "Valid until"}{" "}
              {new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(link.expiresAt))}
            </p>
          )}
        </section>

        <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            {zh ? "付款与联系" : "Payment and contact"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {zh
              ? "请核对规格和美元金额。付款前确认网址属于已认可的付款平台。"
              : "Review the specification and USD amount before paying. Confirm that any external payment URL belongs to an approved provider."}
          </p>
          <div className="mt-5">
            <CustomPaymentActions
              link={{ ...link, locale }}
              paymentMethods={paymentMethods}
              whatsappNumber={settings.whatsappNumber}
              lineUrl={settings.lineUrl}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
