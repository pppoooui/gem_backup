import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Globe, Package, Plane, Shield, Ship } from "lucide-react";
import { PUBLIC_SITE_NAME } from "@/lib/site-config";
import type { Locale } from "@/types/domain";

export const metadata: Metadata = {
  title: `Shipping & Logistics | ${PUBLIC_SITE_NAME}`,
  description:
    "International shipping options, delivery timelines, and packaging information for wholesale gemstone orders.",
};

type Props = { params: Promise<{ locale: Locale }> };

export default async function ShippingPage({ params }: Props) {
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
            <Plane className="size-8 text-[#005466]" />
            <h1 className="text-3xl font-semibold">Shipping & Logistics</h1>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            We ship from our warehouse in Jaipur (Rajasthan, India) to customers worldwide. Every shipment is insured and packaged to survive international transit.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-5">
              <Plane className="size-6 text-[#005466]" />
              <h3 className="mt-3 font-semibold">Air Freight</h3>
              <p className="mt-2 text-sm text-slate-500">
                Fastest option. 5–14 business days door-to-door. Best for orders under 30 kg and urgent shipments.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-5">
              <Ship className="size-6 text-[#005466]" />
              <h3 className="mt-3 font-semibold">Sea Freight</h3>
              <p className="mt-2 text-sm text-slate-500">
                Most economical for bulk orders. 30–45 days port-to-port. We handle all customs documentation.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Package className="size-5 text-[#005466]" />
              Packaging
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Shield className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                Each parcel is double-boxed with foam cushioning.
              </li>
              <li className="flex items-start gap-2">
                <Shield className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                Individual stone papers and bubble wrap for every line item.
              </li>
              <li className="flex items-start gap-2">
                <Shield className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                Insurance against loss or damage included in freight quote.
              </li>
              <li className="flex items-start gap-2">
                <Shield className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                Parcel photos shared on WhatsApp before dispatch.
              </li>
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Clock className="size-5 text-[#005466]" />
              Typical Timeline
            </h2>
            <ol className="mt-4 space-y-4 border-l-2 border-slate-200 pl-6 text-sm text-slate-600">
              <li className="relative">
                <span className="absolute -left-[30px] grid size-5 place-items-center rounded-full bg-[#003f4b] text-xs font-bold text-white">1</span>
                <p className="font-semibold text-slate-900">Quote & Confirmation</p>
                <p className="mt-1">We confirm freight cost and PI details within 1 business day.</p>
              </li>
              <li className="relative">
                <span className="absolute -left-[30px] grid size-5 place-items-center rounded-full bg-[#003f4b] text-xs font-bold text-white">2</span>
                <p className="font-semibold text-slate-900">Payment & Packing</p>
                <p className="mt-1">After payment confirmation, orders are packed within 2 business days.</p>
              </li>
              <li className="relative">
                <span className="absolute -left-[30px] grid size-5 place-items-center rounded-full bg-[#003f4b] text-xs font-bold text-white">3</span>
                <p className="font-semibold text-slate-900">Dispatch & Tracking</p>
                <p className="mt-1">Tracking number shared via WhatsApp / email on dispatch day.</p>
              </li>
            </ol>
          </div>

          <div className="mt-8 rounded-lg bg-slate-50 p-5 flex items-start gap-3">
            <Globe className="size-5 text-[#005466] shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold">Customs & Duties</p>
              <p className="mt-1">Import duties, taxes, and clearance fees are the buyer&apos;s responsibility and are not included in our freight quotes. Contact your local customs broker for estimates.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
