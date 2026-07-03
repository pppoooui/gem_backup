import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import type { Locale } from "@/types/domain";

export const metadata: Metadata = {
  title: "Contact Us | DFCgem",
  description:
    "Get in touch with DFCgem for wholesale gemstone inquiries, orders, and support.",
};

type Props = { params: Promise<{ locale: Locale }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const whatsappNumber = process.env.WHATSAPP_VENDOR_PHONE_NUMBER;
  const normalizedWhatsApp = whatsappNumber?.replace(/\D/g, "");

  return (
    <main className="min-h-screen bg-[#f7f9f8] text-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#005466] hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to Catalog
        </Link>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <MessageCircle className="size-8 text-[#005466]" />
            <h1 className="text-3xl font-semibold">Contact Us</h1>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Reach out for product questions, wholesale quotations, order support,
            or long-term supply partnerships.
          </p>

          <div className="mt-10 space-y-5">
            {normalizedWhatsApp ? (
              <a
                href={`https://wa.me/${normalizedWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-lg border border-slate-200 p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-100">
                  <MessageCircle className="size-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-sm text-slate-500">+{normalizedWhatsApp}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Wholesale inquiries and order support</p>
                </div>
              </a>
            ) : null}

            <a
              href="mailto:sales@dfcgem.com"
              className="flex items-center gap-4 rounded-lg border border-slate-200 p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-sky-100">
                <Mail className="size-6 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-slate-500">sales@dfcgem.com</p>
                <p className="text-xs text-slate-400 mt-0.5">For PI requests, invoices, and formal documentation</p>
              </div>
            </a>

          </div>

          <div className="mt-10 rounded-lg bg-[#f0f7f5] p-5">
            <p className="font-semibold text-sm">Quick Links</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link href={`/${locale}/payment`} className="rounded-md bg-white px-3 py-1.5 border border-slate-200 font-medium hover:bg-slate-50">
                Payment Methods
              </Link>
              <Link href={`/${locale}/shipping`} className="rounded-md bg-white px-3 py-1.5 border border-slate-200 font-medium hover:bg-slate-50">
                Shipping Info
              </Link>
              <Link href={`/${locale}/products`} className="rounded-md bg-white px-3 py-1.5 border border-slate-200 font-medium hover:bg-slate-50">
                Product Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
