import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  FileText,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { PUBLIC_SITE_NAME } from "@/lib/site-config";
import type { LucideIcon } from "lucide-react";
import { usdInrRate } from "@/data/products";
import { getPersistedOrderByToken } from "@/lib/orders";
import { getEnabledPaymentMethods } from "@/lib/payment-methods";
import { formatInr, formatUsd } from "@/lib/utils";
import type { Locale, PaymentProvider } from "@/types/domain";

export const metadata = {
  robots: { index: false, follow: false },
};

const copy = {
  en: {
    invalidTitle: "Order link needs a valid token",
    invalidBody:
      "Open the link sent after checkout, or ask WhatsApp support to resend the secure order link.",
    back: "Back to catalog",
    badge: "Proforma invoice request",
    title: "Order received",
    subtitle:
      "Your wholesale request is saved. We will confirm freight, batch availability, and final payment instructions before issuing PI.",
    status: "Status",
    created: "Created",
    customer: "Customer",
    shipping: "Shipping",
    items: "Items",
    payment: "Payment options",
    subtotal: "Product subtotal",
    shippingFee: "Shipping fee",
    discount: "Discount",
    total: "Estimated total",
    note: "Buyer note",
    whatsapp: "WhatsApp",
    nextSteps: "Next steps",
    nextOne: "Sales confirms stock batch and packing.",
    nextTwo: "Final PI includes freight and bank details.",
    nextThree: "Upload payment proof or confirm via WhatsApp.",
  },
  zh: {
    invalidTitle: "订单链接需要有效 token",
    invalidBody: "请打开下单后生成的链接，或让 WhatsApp 客服重新发送安全订单链接。",
    back: "返回目录",
    badge: "形式发票请求",
    title: "订单已收到",
    subtitle: "批发询价已保存。我们会先确认运费、批次和最终收款信息，再出 PI。",
    status: "状态",
    created: "创建时间",
    customer: "客户",
    shipping: "收货",
    items: "商品",
    payment: "收款方式",
    subtotal: "商品小计",
    shippingFee: "运费",
    discount: "折扣",
    total: "预估合计",
    note: "买家备注",
    whatsapp: "WhatsApp",
    nextSteps: "下一步",
    nextOne: "销售确认库存批次和包装。",
    nextTwo: "最终 PI 包含运费和银行信息。",
    nextThree: "上传付款凭证或通过 WhatsApp 确认。",
  },
} satisfies Record<Locale, Record<string, string>>;

const statusLabel = {
  pending_quote: "Pending quote",
  awaiting_payment: "Awaiting payment",
  payment_submitted: "Payment submitted",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

const providerLabel: Record<PaymentProvider, string> = {
  xtransfer: "XTransfer",
  worldfirst: "WorldFirst",
  airwallex: "Airwallex",
  wise: "Wise",
  bank_transfer: "Bank Transfer",
  manual: "Manual",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; orderNo: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale, orderNo } = await params;
  const { token } = await searchParams;
  const t = copy[locale] ?? copy.en;
  const order = token ? await getPersistedOrderByToken(orderNo, token) : null;
  const whatsappNumber = process.env.WHATSAPP_VENDOR_PHONE_NUMBER;

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f7f9f8] px-4 py-10 text-slate-950">
        <section className="mx-auto max-w-xl rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto size-10 text-[#005466]" />
          <h1 className="mt-5 text-2xl font-semibold">{t.invalidTitle}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t.invalidBody}</p>
          <Link
            href={`/${locale}`}
            className="mt-6 inline-flex h-11 items-center rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white"
          >
            {t.back}
          </Link>
        </section>
      </main>
    );
  }

  const created = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(order.createdAt));
  const enabledPaymentMethods = await getEnabledPaymentMethods();
  const selectedPaymentName =
    enabledPaymentMethods.find(
      (method) => method.provider === order.selectedPaymentProvider,
    )?.name ?? providerLabel[order.selectedPaymentProvider];

  return (
    <main className="min-h-screen bg-[#f7f9f8] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="text-2xl font-bold text-[#002b35]">
            {PUBLIC_SITE_NAME}
          </Link>
          <Link
            href={
              whatsappNumber
                ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
                : `/${locale}/contact`
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#005466]"
          >
            <MessageCircle className="size-4" />
            {t.whatsapp}
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-6">
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="size-4" />
                  {t.badge}
                </span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#002b35]">
                  {t.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {t.subtitle}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold">{order.orderNo}</p>
                <p className="mt-2 text-slate-500">
                  {t.status}: {statusLabel[order.status]}
                </p>
                <p className="mt-1 text-slate-500">
                  {t.created}: {created}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoBlock icon={FileText} title={t.customer}>
              <p className="font-semibold">{order.customer.companyName}</p>
              <p>{order.customer.contactName}</p>
              <p>{order.customer.email}</p>
              <p>{order.customer.whatsapp}</p>
              {order.customer.gstin && <p>GSTIN: {order.customer.gstin}</p>}
              {order.customer.iec && <p>IEC: {order.customer.iec}</p>}
            </InfoBlock>
            <InfoBlock icon={Truck} title={t.shipping}>
              <p>{order.customer.addressLine1}</p>
              {order.customer.landmark && <p>{order.customer.landmark}</p>}
              <p>
                {order.customer.city}, {order.customer.pinCode}
              </p>
              <p>{order.customer.country}</p>
            </InfoBlock>
          </div>

          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-semibold">{t.items}</h2>
              <span className="text-sm text-slate-500">{order.lines.length} lines</span>
            </div>
            <div className="divide-y divide-slate-100">
              {order.lines.map((line) => (
                <div
                  key={line.variantId}
                  className="grid gap-4 px-5 py-4 sm:grid-cols-[72px_minmax(0,1fr)_140px]"
                >
                  <div className="relative size-[72px] overflow-hidden rounded-md bg-slate-950">
                    <Image
                      src={line.imagePath}
                      alt={line.name}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{line.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {line.sizeMm} | {line.grade} | {line.color} | HS {line.hsCode}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {line.quantity.toLocaleString()} pcs / {line.packageUnit} ·{" "}
                      {formatUsd(line.unitPriceUsd, {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}
                    </p>
                  </div>
                  <p className="text-left font-semibold sm:text-right">
                    {formatUsd(line.lineTotalUsd)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.total}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <AmountRow label={t.subtotal} value={formatUsd(order.subtotalUsd)} />
              <AmountRow label={t.shippingFee} value="To confirm" />
              <AmountRow label={t.discount} value={formatUsd(order.discountUsd)} />
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-semibold">{t.total}</span>
                  <span className="text-right text-xl font-semibold text-[#002b35]">
                    {formatUsd(order.totalUsd)}
                    <span className="block text-sm font-normal text-slate-500">
                      ≈ {formatInr(order.totalUsd * usdInrRate)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            {order.note && (
              <div className="mt-5 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">{t.note}</p>
                <p className="mt-1">{order.note}</p>
              </div>
            )}
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.payment}</h2>
            <div className="mt-4 space-y-3">
              {enabledPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm"
                >
                  <span className="font-medium">{method.name}</span>
                  <span className="text-slate-500">{method.currencies.join(", ")}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Selected: {selectedPaymentName}
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock3 className="size-5 text-[#005466]" />
              {t.nextSteps}
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              {[t.nextOne, t.nextTwo, t.nextThree].map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#003f4b] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </section>
    </main>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-950">
        <Icon className="size-5 text-[#005466]" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
