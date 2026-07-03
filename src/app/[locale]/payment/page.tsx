import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Globe,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { Locale } from "@/types/domain";

export const metadata: Metadata = {
  title: "Payment Methods | DFCgem",
  description:
    "Secure international payment options for wholesale gemstone orders including XTransfer, WorldFirst, Airwallex, Wise, and bank transfer.",
};

type Props = { params: Promise<{ locale: Locale }> };

const methods = [
  {
    name: "XTransfer",
    tagline: "Best for Indian buyers importing from abroad",
    details:
      "Fully licensed cross-border payment platform. Competitive FX rates, local INR settlement via NEFT/RTGS, and real-time payment tracking.",
    currencies: "USD, EUR, GBP, CNY, INR → INR settlement",
    timeline: "1–2 business days",
    highlight: true,
  },
  {
    name: "WorldFirst",
    tagline: "Multi-currency account for global traders",
    details:
      "Hold and convert 40+ currencies. Send payments to suppliers at wholesale FX rates. Ideal for bulk commodity payments.",
    currencies: "USD, EUR, GBP, AUD, HKD, SGD, JPY + 35 more",
    timeline: "1–2 business days",
    highlight: false,
  },
  {
    name: "Airwallex",
    tagline: "All-in-one business account",
    details:
      "Global business account with virtual cards and built-in compliance. Fast cross-border transfers at interbank rates.",
    currencies: "USD, EUR, GBP, AUD, HKD, SGD, CNY",
    timeline: "Same day for most corridors",
    highlight: false,
  },
  {
    name: "Wise",
    tagline: "The real exchange rate, always",
    details:
      "Transparent, low-cost international transfers. No hidden markups on exchange rates — you always get the mid-market rate.",
    currencies: "50+ currencies supported",
    timeline: "Same day to 2 business days",
    highlight: false,
  },
  {
    name: "Bank Transfer (SWIFT)",
    tagline: "Traditional wire for larger orders",
    details:
      "Direct SWIFT/TT wire to our Indian export account. Higher fees but unlimited amount — suitable for large bulk orders and LC transactions.",
    currencies: "USD, EUR, GBP",
    timeline: "3–5 business days",
    highlight: false,
  },
];

export default async function PaymentPage({ params }: Props) {
  const { locale } = await params;

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
            <CreditCard className="size-8 text-[#005466]" />
            <h1 className="text-3xl font-semibold">Payment Methods</h1>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            We support multiple international payment channels so you can
            settle invoices in USD, EUR, or INR with minimal fees and
            maximum security. Choose the method that works best for your
            business.
          </p>

          {/* Method cards */}
          <div className="mt-10 space-y-4">
            {methods.map((m) => (
              <div
                key={m.name}
                className={`rounded-lg border p-5 ${
                  m.highlight
                    ? "border-emerald-400 bg-emerald-50/40"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{m.name}</h3>
                  {m.highlight && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{m.tagline}</p>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {m.details}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs text-slate-500">
                  <div className="flex items-start gap-1.5">
                    <Globe className="size-3.5 shrink-0 mt-0.5 text-[#005466]" />
                    <span>{m.currencies}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Clock className="size-3.5 shrink-0 mt-0.5 text-[#005466]" />
                    <span>{m.timeline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="mt-10 rounded-lg bg-slate-50 p-5 flex items-start gap-3">
            <Shield className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold">Payment Security</p>
              <p className="mt-1">
                All payment provider accounts are verified and held in the
                company&apos;s name. Bank details are shared only on the
                Proforma Invoice — never via unsolicited WhatsApp or email.
                Always confirm payment instructions through your assigned
                WhatsApp business chat before transferring funds.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold">How Payment Works</h2>
            <ol className="mt-4 space-y-4 border-l-2 border-slate-200 pl-6 text-sm text-slate-600">
              <li className="relative">
                <span className="absolute -left-[30px] grid size-5 place-items-center rounded-full bg-[#003f4b] text-xs font-bold text-white">
                  1
                </span>
                <p className="font-semibold text-slate-900">
                  Receive Proforma Invoice
                </p>
                <p className="mt-1">
                  After you confirm an order, we send a PI with itemized
                  pricing, freight cost, and bank / payment channel details.
                </p>
              </li>
              <li className="relative">
                <span className="absolute -left-[30px] grid size-5 place-items-center rounded-full bg-[#003f4b] text-xs font-bold text-white">
                  2
                </span>
                <p className="font-semibold text-slate-900">
                  Transfer Funds
                </p>
                <p className="mt-1">
                  Make the payment via your preferred channel. Save a
                  screenshot or PDF receipt for your records.
                </p>
              </li>
              <li className="relative">
                <span className="absolute -left-[30px] grid size-5 place-items-center rounded-full bg-[#003f4b] text-xs font-bold text-white">
                  3
                </span>
                <p className="font-semibold text-slate-900">
                  Upload Payment Confirmation
                </p>
                <p className="mt-1">
                  Share your payment screenshot on the order confirmation
                  page or via WhatsApp. We verify the receipt and begin
                  packing.
                </p>
              </li>
            </ol>
          </div>

          {/* Accepted currencies */}
          <div className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Accepted Currencies
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 text-sm">
              {["USD ($)", "EUR (€)", "GBP (£)", "INR (₹)"].map((c) => (
                <div
                  key={c}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-center font-medium text-slate-700"
                >
                  {c}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              INR pricing is calculated at the prevailing USD/INR rate and
              confirmed on the Proforma Invoice.
            </p>
          </div>

          {/* Quick links */}
          <div className="mt-10 rounded-lg bg-[#f0f7f5] p-5">
            <p className="font-semibold text-sm">Quick Links</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link
                href={`/${locale}/shipping`}
                className="rounded-md bg-white px-3 py-1.5 border border-slate-200 font-medium hover:bg-slate-50"
              >
                Shipping Info
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="rounded-md bg-white px-3 py-1.5 border border-slate-200 font-medium hover:bg-slate-50"
              >
                Contact Us
              </Link>
              <Link
                href={`/${locale}/products`}
                className="rounded-md bg-white px-3 py-1.5 border border-slate-200 font-medium hover:bg-slate-50"
              >
                Product Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
