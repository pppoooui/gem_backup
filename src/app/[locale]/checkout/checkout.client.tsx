"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usdInrRate } from "@/data/products";
import { getCartLines, clearCart } from "@/lib/cart-store";
import { formatInr, formatUsd } from "@/lib/utils";
import type {
  CartLine,
  Locale,
  PaymentMethod,
  PaymentProvider,
  Product,
} from "@/types/domain";
import {
  ArrowLeft,
  Loader2,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";

const copy = {
  en: {
    title: "Checkout",
    back: "Back to Cart",
    customer: "Customer Info",
    companyName: "Company Name",
    companyNameHint: "Business or trading company name",
    contactName: "Contact Person",
    contactNameHint: "Full name",
    whatsapp: "WhatsApp",
    whatsappHint: "+91 98765 43210",
    email: "Email",
    emailHint: "you@company.com",
    country: "Country",
    countryHint: "India",
    city: "City",
    cityHint: "e.g. Jaipur, Mumbai",
    pinCode: "PIN Code",
    pinCodeHint: "6 digits for India",
    addressLine1: "Shipping Address",
    addressLine1Hint: "Street, building, area",
    landmark: "Landmark (optional)",
    landmarkHint: "Nearby landmark",
    gstin: "GSTIN (optional)",
    gstinHint: "Goods and Services Tax ID",
    iec: "IEC (optional)",
    iecHint: "Import Export Code",
    payment: "Payment Method",
    selectPayment: "Select a payment method",
    cartEmpty: "Your cart is empty",
    cartEmptyBody: "Add products before checking out.",
    browseProducts: "Browse Products",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shippingEstimate: "Shipping estimate",
    shippingNote: "To be confirmed after review",
    total: "Estimated Total",
    placeOrder: "Place Order",
    placing: "Submitting...",
    validationRequired: "Please fill in all required fields.",
    submitError: "Failed to create order. Please try again.",
    perPiece: "/pc",
    moq: "MOQ",
  },
  zh: {
    title: "结账",
    back: "返回购物车",
    customer: "客户信息",
    companyName: "公司名称",
    companyNameHint: "企业或贸易公司名称",
    contactName: "联系人",
    contactNameHint: "全名",
    whatsapp: "WhatsApp",
    whatsappHint: "+91 98765 43210",
    email: "邮箱",
    emailHint: "you@company.com",
    country: "国家",
    countryHint: "印度",
    city: "城市",
    cityHint: "如：斋浦尔、孟买",
    pinCode: "PIN 邮编",
    pinCodeHint: "6位印度邮编",
    addressLine1: "收货地址",
    addressLine1Hint: "街道、大楼、区域",
    landmark: "地标（可选）",
    landmarkHint: "附近地标",
    gstin: "GSTIN（可选）",
    gstinHint: "商品服务税号",
    iec: "IEC（可选）",
    iecHint: "进出口编码",
    payment: "收款方式",
    selectPayment: "选择收款方式",
    cartEmpty: "购物车为空",
    cartEmptyBody: "请先添加商品再结账。",
    browseProducts: "浏览商品",
    orderSummary: "订单摘要",
    subtotal: "小计",
    shippingEstimate: "预估运费",
    shippingNote: "审核后确认",
    total: "预估合计",
    placeOrder: "提交订单",
    placing: "提交中...",
    validationRequired: "请填写所有必填字段。",
    submitError: "订单创建失败，请重试。",
    perPiece: "/颗",
    moq: "起订量",
  },
} satisfies Record<Locale, Record<string, string>>;

export default function CheckoutPage({
  locale,
  products,
  paymentMethods,
}: {
  locale: Locale;
  products: Product[];
  paymentMethods: PaymentMethod[];
}) {
  const router = useRouter();
  const t = copy[locale];

  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Customer form state
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [landmark, setLandmark] = useState("");
  const [gstin, setGstin] = useState("");
  const [iec, setIec] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | "">("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setCartLines(getCartLines());
    setIsHydrated(true);
  }, []);

  const lines = useMemo(
    () =>
      cartLines
        .map((line) => {
          const product = products.find((p) => p.id === line.productId);
          const variant = product?.variants.find((v) => v.id === line.variantId);
          if (!product || !variant) return null;

          const tier =
            [...variant.priceTiers]
              .reverse()
              .find((t) => line.quantity >= t.minQuantity) ??
            variant.priceTiers[0];

          const lineTotalUsd = Number((tier.priceUsd * line.quantity).toFixed(2));

          return {
            cartLine: line,
            product,
            variant,
            quantity: line.quantity,
            unitPriceUsd: tier.priceUsd,
            lineTotalUsd,
          };
        })
        .filter(Boolean) as {
        cartLine: CartLine;
        product: (typeof products)[number];
        variant: (typeof products)[number]["variants"][number];
        quantity: number;
        unitPriceUsd: number;
        lineTotalUsd: number;
      }[],
    [cartLines, products],
  );

  const validCartLines = lines.map((line) => line.cartLine);
  const subtotalUsd = lines.reduce((sum, l) => sum + l.lineTotalUsd, 0);

  // Empty cart state
  if (isHydrated && validCartLines.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <Package className="size-12 text-slate-300" />
        <p className="mt-4 text-lg font-medium text-slate-700">{t.cartEmpty}</p>
        <p className="mt-1 text-sm text-slate-500">{t.cartEmptyBody}</p>
        <Link
          href={`/${locale}/products`}
          className="mt-5 inline-flex h-10 items-center rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white transition hover:bg-[#005466]"
        >
          {t.browseProducts}
        </Link>
      </main>
    );
  }

  const enabledPaymentMethods = paymentMethods;
  const isFormValid =
    companyName.trim().length >= 2 &&
    contactName.trim().length >= 2 &&
    whatsapp.trim().length >= 8 &&
    email.trim() !== "" &&
    email.includes("@") &&
    country.trim().length >= 2 &&
    city.trim().length >= 2 &&
    (/^(india|in)$/i.test(country.trim())
      ? /^\d{6}$/.test(pinCode.trim())
      : pinCode.trim().length >= 3) &&
    addressLine1.trim().length >= 5 &&
    validCartLines.length > 0 &&
    selectedProvider !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          lines: validCartLines,
          selectedPaymentProvider: selectedProvider,
          customer: {
            companyName: companyName.trim(),
            contactName: contactName.trim(),
            whatsapp: whatsapp.trim(),
            email: email.trim(),
            country: country.trim(),
            city: city.trim(),
            pinCode: pinCode.trim(),
            addressLine1: addressLine1.trim(),
            landmark: landmark.trim() || undefined,
            gstin: gstin.trim() || undefined,
            iec: iec.trim() || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to create order");
      }

      clearCart();
      router.push(data.orderPath);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t.submitError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9f8] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/cart`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#003f4b]"
          >
            <ArrowLeft className="size-4" />
            {t.back}
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-sm font-semibold text-slate-900">{t.title}</h1>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8"
      >
        <div className="space-y-6">
          {/* Customer Info */}
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#005466]" />
              <h2 className="text-lg font-semibold">{t.customer}</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t.companyName}
                hint={t.companyNameHint}
                value={companyName}
                onChange={setCompanyName}
                required
              />
              <Field
                label={t.contactName}
                hint={t.contactNameHint}
                value={contactName}
                onChange={setContactName}
                required
              />
              <Field
                label={t.whatsapp}
                hint={t.whatsappHint}
                value={whatsapp}
                onChange={setWhatsapp}
                required
              />
              <Field
                label={t.email}
                hint={t.emailHint}
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                label={t.country}
                hint={t.countryHint}
                value={country}
                onChange={setCountry}
                required
              />
              <Field
                label={t.city}
                hint={t.cityHint}
                value={city}
                onChange={setCity}
                required
              />
              <Field
                label={t.pinCode}
                hint={t.pinCodeHint}
                value={pinCode}
                onChange={setPinCode}
                required
                maxLength={16}
                inputMode={/^(india|in)$/i.test(country.trim()) ? "numeric" : "text"}
              />
              <Field
                label={t.addressLine1}
                hint={t.addressLine1Hint}
                value={addressLine1}
                onChange={setAddressLine1}
                required
              />
              <Field
                label={t.landmark}
                hint={t.landmarkHint}
                value={landmark}
                onChange={setLandmark}
              />
              <Field
                label={t.gstin}
                hint={t.gstinHint}
                value={gstin}
                onChange={setGstin}
              />
              <Field
                label={t.iec}
                hint={t.iecHint}
                value={iec}
                onChange={setIec}
              />
            </div>
          </section>

          {/* Order Items */}
          <section className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-semibold">
                {t.orderSummary} · {lines.length}{" "}
                {locale === "zh" ? "项" : "items"}
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {lines.map((line, idx) => (
                <div
                  key={`${line.product.id}-${line.variant.id}-${idx}`}
                  className="grid gap-4 px-5 py-4 sm:grid-cols-[64px_minmax(0,1fr)_120px]"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-slate-950">
                    <Image
                      src={line.product.imagePath}
                      alt={
                        locale === "en"
                          ? line.product.nameEn
                          : line.product.nameZh
                      }
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {locale === "en"
                        ? line.product.nameEn
                        : line.product.nameZh}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {line.variant.sizeMm} · {line.product.grade} ·{" "}
                      {line.variant.color}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {line.quantity.toLocaleString()} pcs ×{" "}
                      {formatUsd(line.unitPriceUsd, {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}{" "}
                      {t.perPiece}
                    </p>
                  </div>
                  <p className="text-sm font-semibold sm:text-right">
                    {formatUsd(line.lineTotalUsd)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Payment */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.payment}</h2>
            <div className="mt-3">
              <select
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#005466] focus:ring-4 focus:ring-cyan-950/5"
                value={selectedProvider}
                onChange={(e) =>
                  setSelectedProvider((e.target.value || "") as PaymentProvider)
                }
                required
              >
                <option value="" disabled>
                  {t.selectPayment}
                </option>
                {enabledPaymentMethods.map((m) => (
                  <option key={m.id} value={m.provider}>
                    {m.name} ({m.currencies.join(", ")})
                  </option>
                ))}
              </select>
              {selectedProvider && (
                <p className="mt-2 text-xs text-slate-500">
                  Min:{" "}
                  {formatUsd(
                    enabledPaymentMethods.find(
                      (m) => m.provider === selectedProvider,
                    )?.minAmountUsd ?? 0,
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.total}</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">{t.subtotal}</span>
                <span className="font-medium">{formatUsd(subtotalUsd)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Truck className="size-4" />
                  {t.shippingEstimate}
                </span>
                <span className="text-xs text-slate-400">{t.shippingNote}</span>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-semibold">{t.total}</span>
                  <span className="text-right text-xl font-semibold text-[#002b35]">
                    {formatUsd(subtotalUsd)}
                    <span className="block text-sm font-normal text-slate-500">
                      ≈ {formatInr(subtotalUsd * usdInrRate)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {submitError && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-md bg-[#003f4b] text-sm font-semibold text-white transition hover:bg-[#005466] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Package className="mr-2 size-4" />
              )}
              {isSubmitting ? t.placing : t.placeOrder}
            </button>
          </div>
        </aside>
      </form>
    </main>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  required = false,
  type = "text",
  maxLength,
  inputMode,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <input
        className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[#005466] focus:ring-4 focus:ring-cyan-950/5"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
      />
    </label>
  );
}
