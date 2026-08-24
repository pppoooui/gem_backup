import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Smartphone } from "lucide-react";
import { CompliancePage, type ComplianceSection } from "@/components/storefront/compliance-page";
import {
  PUBLIC_ADDRESS_EN,
  PUBLIC_ADDRESS_ZH,
  PUBLIC_CONTACT_EMAIL,
  PUBLIC_CONTACT_PHONE,
  PUBLIC_LINE_URL,
  PUBLIC_SITE_NAME,
} from "@/lib/site-config";
import type { Locale } from "@/types/domain";

type Props = { params: Promise<{ locale: Locale }> };

const content = {
  en: {
    eyebrow: "Customer support",
    title: "Contact Us",
    summary: "Contact DFC for product specifications, wholesale quotations, custom orders, payment assistance, shipping updates, returns, or after-sales support.",
    sections: [
      { title: "Response and order support", paragraphs: ["Please include your order number when contacting us about an existing purchase. We normally reply within 1–2 business days. Complex specifications, carrier investigations, payment disputes, or refund reviews may require additional time."] },
      { title: "Payment safety", paragraphs: ["Pay only through the secure URL shown on your DFC order page, an approved payment link, or beneficiary details on a verified invoice. We will never ask you to send a complete card number, card security code, or payment-account password through email, WhatsApp, LINE, or website chat."] },
    ] satisfies ComplianceSection[],
  },
  zh: {
    eyebrow: "客户支持",
    title: "联系我们",
    summary: "如需咨询产品规格、批发报价、定制订单、付款、物流进度、退货或售后问题，请联系 DFC。",
    sections: [
      { title: "回复与订单支持", paragraphs: ["咨询已有订单时请提供订单号。我们通常会在 1–2 个工作日内回复；复杂规格、物流调查、支付争议或退款审核可能需要更长时间。"] },
      { title: "付款安全", paragraphs: ["请仅通过 DFC 订单页面显示的安全网址、已批准的付款链接，或经核实发票上的收款资料付款。我们绝不会要求您通过邮件、WhatsApp、LINE 或网站聊天发送完整卡号、卡片安全码或支付账户密码。"] },
    ] satisfies ComplianceSection[],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "zh" ? `联系我们 | ${PUBLIC_SITE_NAME}` : `Contact Us | ${PUBLIC_SITE_NAME}`, description: content[locale].summary };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const page = content[locale];
  const normalizedWhatsApp = PUBLIC_CONTACT_PHONE.replace(/\D/g, "");

  return (
    <CompliancePage locale={locale} slug="contact" {...page} sections={[...page.sections]}>
      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="rounded-xl border border-black/10 p-5 transition hover:border-[#a97342] hover:bg-[#fcfaf7]">
          <Mail className="size-6 text-[#9a6a3a]" />
          <p className="mt-4 text-sm font-semibold">Email</p>
          <p className="mt-1 break-all text-sm text-black/58">{PUBLIC_CONTACT_EMAIL}</p>
        </a>
        <a href={`https://wa.me/${normalizedWhatsApp}`} target="_blank" rel="noreferrer" className="rounded-xl border border-black/10 p-5 transition hover:border-[#a97342] hover:bg-[#fcfaf7]">
          <MessageCircle className="size-6 text-emerald-600" />
          <p className="mt-4 text-sm font-semibold">WhatsApp</p>
          <p className="mt-1 text-sm text-black/58">{PUBLIC_CONTACT_PHONE}</p>
        </a>
        <a href={PUBLIC_LINE_URL} target="_blank" rel="noreferrer" className="rounded-xl border border-black/10 p-5 transition hover:border-[#a97342] hover:bg-[#fcfaf7]">
          <Smartphone className="size-6 text-emerald-600" />
          <p className="mt-4 text-sm font-semibold">LINE</p>
          <p className="mt-1 text-sm text-black/58">{PUBLIC_CONTACT_PHONE}</p>
        </a>
        <div className="rounded-xl border border-black/10 p-5">
          <MapPin className="size-6 text-[#9a6a3a]" />
          <p className="mt-4 text-sm font-semibold">{locale === "zh" ? "经营地点" : "Business location"}</p>
          <p className="mt-1 text-sm text-black/58">{locale === "zh" ? PUBLIC_ADDRESS_ZH : PUBLIC_ADDRESS_EN}</p>
        </div>
      </div>
    </CompliancePage>
  );
}
