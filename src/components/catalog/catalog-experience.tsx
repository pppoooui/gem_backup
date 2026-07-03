"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Check,
  ChevronDown,
  Factory,
  Grid2X2,
  Heart,
  Info,
  Languages,
  List,
  MessageCircle,
  PackageCheck,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import { usdInrRate } from "@/data/products";
import { clearCart, getCartLines, setCartLines } from "@/lib/cart-store";
import type {
  CartLine,
  Locale,
  PaymentMethod,
  PaymentProvider,
  Product,
  ProductVariant,
} from "@/types/domain";
import { cn, formatInr, formatUsd } from "@/lib/utils";

const copy = {
  en: {
    products: "Products",
    resources: "Resources",
    search: "Search shape, size, color, SKU...",
    cart: "Cart",
    filters: "Filters",
    clear: "Clear all",
    sort: "Sort by: Best match",
    shape: "Shape",
    color: "Color",
    size: "Size",
    grade: "Quality / Grade",
    cut: "Cut",
    moq: "MOQ",
    add: "Add",
    added: "Added",
    inStock: "In stock",
    lowStock: "Low stock",
    quoteOnly: "Quote batch",
    requestInvoice: "Request Final Invoice",
    checkout: "Checkout Details",
    companyName: "Company name",
    contactName: "Contact name",
    whatsappNo: "WhatsApp number",
    email: "Email",
    city: "City",
    pinCode: "PIN code",
    address: "Shipping address",
    landmark: "Landmark",
    gstin: "GSTIN",
    iec: "IEC",
    note: "Note",
    submitOrder: "Submit PI Request",
    submitting: "Submitting...",
    manualOptions: "Manual Payment Options",
    invoiceNote: "Shipping & taxes calculated in final invoice.",
    secure: "Secure & Confidential",
    response: "We will send the proforma invoice within 24 hours.",
  },
  zh: {
    products: "商品",
    resources: "资料",
    search: "搜索形状、尺寸、颜色、SKU...",
    cart: "购物车",
    filters: "筛选",
    clear: "清空",
    sort: "排序：最佳匹配",
    shape: "形状",
    color: "颜色",
    size: "尺寸",
    grade: "品质 / 等级",
    cut: "切工",
    moq: "起批",
    add: "加入",
    added: "已加入",
    inStock: "有货",
    lowStock: "低库存",
    quoteOnly: "确认批次",
    requestInvoice: "请求最终 PI",
    checkout: "下单信息",
    companyName: "公司名称",
    contactName: "联系人",
    whatsappNo: "WhatsApp 号码",
    email: "邮箱",
    city: "城市",
    pinCode: "印度 PIN 邮编",
    address: "收货地址",
    landmark: "地标",
    gstin: "GSTIN",
    iec: "IEC",
    note: "备注",
    submitOrder: "提交 PI 请求",
    submitting: "提交中...",
    manualOptions: "人工确认收款方式",
    invoiceNote: "运费和税费将在最终 PI 中确认。",
    secure: "安全保密",
    response: "我们会在 24 小时内发送形式发票。",
  },
} satisfies Record<Locale, Record<string, string>>;

const trustItems = [
  {
    icon: Factory,
    title: "Factory Direct",
    detail: "Direct from CZ manufacturer",
  },
  {
    icon: PackageCheck,
    title: "Bulk Price",
    detail: "Better price for higher qty",
  },
  {
    icon: Truck,
    title: "Fast Dispatch",
    detail: "Ships in 1-3 business days",
  },
  {
    icon: Box,
    title: "Custom Packing",
    detail: "Logo, labels, blister, zip bags",
  },
];

const shapeFilters = [
  ["Round", "2,450"],
  ["Princess", "1,280"],
  ["Cushion", "980"],
  ["Oval", "1,120"],
  ["Pear", "1,050"],
] as const;

const colors = [
  "#f8fafc",
  "#d6d7d8",
  "#efd55f",
  "#d6b06d",
  "#efafd0",
  "#9f74d8",
  "#b51f2e",
  "#3151d3",
  "#079455",
  "#09090b",
];

function lineProduct(line: CartLine, products: Product[]) {
  const product = products.find((item) => item.id === line.productId);
  const variant = product?.variants.find((item) => item.id === line.variantId);
  return { product, variant };
}

function lineTotal(variant: ProductVariant, quantity: number) {
  const tier = [...variant.priceTiers]
    .reverse()
    .find((item) => quantity >= item.minQuantity);
  return (tier ?? variant.priceTiers[0]).priceUsd * quantity;
}

type CheckoutFormState = {
  companyName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;
  pinCode: string;
  addressLine1: string;
  landmark: string;
  gstin: string;
  iec: string;
};

const defaultCheckoutForm: CheckoutFormState = {
  companyName: "",
  contactName: "",
  whatsapp: "+91 ",
  email: "",
  country: "India",
  city: "",
  pinCode: "",
  addressLine1: "",
  landmark: "",
  gstin: "",
  iec: "",
};

export function CatalogExperience({
  locale,
  products,
  paymentMethods,
  whatsappNumber,
}: {
  locale: Locale;
  products: Product[];
  paymentMethods: PaymentMethod[];
  whatsappNumber?: string;
}) {
  const t = copy[locale];
  const pathname = usePathname();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore browser storage after hydration
    setCart(getCartLines());
    setIsCartHydrated(true);
  }, []);

  useEffect(() => {
    if (isCartHydrated) setCartLines(cart);
  }, [cart, isCartHydrated]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, line) => {
      const { variant } = lineProduct(line, products);
      return variant ? sum + lineTotal(variant, line.quantity) : sum;
    }, 0);
  }, [cart, products]);

  function addProduct(product: Product) {
    const variant = product.variants[0];
    setIsCartPanelOpen(true);
    setCart((current) => {
      const existing = current.find((line) => line.variantId === variant.id);
      if (existing) {
        return current.map((line) =>
          line.variantId === variant.id
            ? { ...line, quantity: line.quantity + variant.moq }
            : line,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          variantId: variant.id,
          quantity: variant.moq,
        },
      ];
    });
  }

  function updateQuantity(variantId: string, quantity: number) {
    setCart((current) =>
      current
        .map((line) =>
          line.variantId === variantId
            ? { ...line, quantity: Math.max(quantity, 0) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function removeLine(variantId: string) {
    setCart((current) => current.filter((line) => line.variantId !== variantId));
  }

  const alternateLocale = locale === "en" ? "zh" : "en";
  const alternateLocaleHref = pathname.replace(
    /^\/(en|zh)(?=\/|$)/,
    `/${alternateLocale}`,
  );
  const cartHref = `/${locale}/cart`;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-[70px] items-center gap-5 px-4 sm:px-6 xl:px-8">
          <Link
            href={`/${locale}`}
            className="shrink-0 text-2xl font-bold tracking-tight text-[#002b35]"
          >
            DFCgem
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <button className="inline-flex items-center gap-1.5">
              {t.products} <ChevronDown className="size-4" />
            </button>
            <button className="inline-flex items-center gap-1.5">
              {t.resources} <ChevronDown className="size-4" />
            </button>
          </nav>
          <div className="relative mx-auto hidden w-full max-w-[470px] lg:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#005466] focus:ring-4 focus:ring-cyan-950/5"
              placeholder={t.search}
            />
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm font-medium">
            <Link
              href={alternateLocaleHref}
              className="hidden items-center gap-1.5 md:inline-flex"
            >
              <Languages className="size-4" />
              EN / ZH
            </Link>
            <Link
              href={
                whatsappNumber
                  ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
                  : `/${locale}/contact`
              }
              className="inline-flex items-center gap-1.5"
            >
              <MessageCircle className="size-5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Link>
            <Link
              href={cartHref}
              className="relative inline-flex items-center gap-1.5"
            >
              <ShoppingCart className="size-6" />
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#003f4b] text-[11px] text-white">
                {cart.length}
              </span>
              <span className="hidden sm:inline">{t.cart}</span>
            </Link>
          </div>
        </div>
        <div className="hidden border-t border-slate-100 md:grid md:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 border-r border-slate-100 px-8 py-4 last:border-r-0"
            >
              <item.icon className="size-6 text-slate-500" />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <main className="grid lg:grid-cols-[242px_minmax(0,1fr)_312px]">
        <aside className="hidden min-h-[calc(100vh-134px)] border-r border-slate-200 bg-white lg:block">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-7">
            <h2 className="text-xl font-semibold">{t.filters}</h2>
            <button className="text-xs font-medium text-[#005466]">
              {t.clear}
            </button>
          </div>
          <div className="space-y-7 px-6 py-6">
            <FilterGroup title={t.shape}>
              <input
                className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
                placeholder="Search shape"
              />
              <div className="space-y-3 pt-2">
                {shapeFilters.map(([shape, count], index) => (
                  <label
                    key={shape}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-4 place-items-center rounded-[3px] border border-slate-300",
                          index === 0 && "border-[#003f4b] bg-[#003f4b]",
                        )}
                      >
                        {index === 0 && <Check className="size-3 text-white" />}
                      </span>
                      {shape}
                    </span>
                    <span className="text-slate-500">{count}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title={t.color}>
              <div className="grid grid-cols-6 gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="size-6 rounded-full border border-slate-300 shadow-sm"
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title={t.size}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <input
                  className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                  defaultValue="0.80"
                />
                <span className="text-xs text-slate-500">to</span>
                <input
                  className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                  defaultValue="10.00"
                />
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-slate-200">
                <div className="h-full w-[92%] rounded-full bg-[#005466]" />
              </div>
            </FilterGroup>

            <FilterGroup title={t.grade}>
              {["5A", "3A", "2A"].map((grade, index) => (
                <label key={grade} className="mt-3 flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded-[3px] border border-slate-300",
                      index === 0 && "border-[#003f4b] bg-[#003f4b]",
                    )}
                  >
                    {index === 0 && <Check className="size-3 text-white" />}
                  </span>
                  {grade}
                </label>
              ))}
            </FilterGroup>
          </div>
        </aside>

        <section className="min-w-0 bg-[#fbfcfc] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium lg:hidden">
                <SlidersHorizontal className="size-4" />
                {t.filters}
              </button>
              <p className="text-sm text-slate-500">
                {products.length.toLocaleString()} {locale === "zh" ? "个商品" : "products"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex h-10 items-center justify-between gap-16 rounded-md border border-slate-200 bg-white px-4 text-sm">
                {t.sort}
                <ChevronDown className="size-4" />
              </button>
              <div className="hidden rounded-md border border-slate-200 bg-white md:flex">
                <button
                  className={cn(
                    "grid size-10 place-items-center border-r border-slate-200",
                    view === "grid" && "bg-slate-50 text-[#003f4b]",
                  )}
                  onClick={() => setView("grid")}
                >
                  <Grid2X2 className="size-5" />
                </button>
                <button
                  className={cn(
                    "grid size-10 place-items-center",
                    view === "list" && "bg-slate-50 text-[#003f4b]",
                  )}
                  onClick={() => setView("list")}
                >
                  <List className="size-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-7 flex flex-wrap gap-3">
            {["Shape: Round", "Color: Colorless", "Size: 1.00 - 3.00 mm", "Grade: 5A"].map(
              (item) => (
                <button
                  key={item}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-100 px-3 text-sm text-slate-700"
                >
                  {item}
                  <X className="size-3.5" />
                </button>
              ),
            )}
            <button className="text-sm font-medium text-[#005466]">{t.clear}</button>
          </div>

          <div
            className={cn(
              "grid gap-6",
              view === "grid"
                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 min-[1400px]:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                priority={index < 3}
                onAdd={() => addProduct(product)}
              />
            ))}
          </div>
        </section>

        {isCartPanelOpen ? (
          <aside className="border-l border-slate-200 bg-white">
            <CartPanel
              cart={cart}
              products={products}
              paymentMethods={paymentMethods}
              locale={locale}
              subtotal={subtotal}
              updateQuantity={updateQuantity}
              removeLine={removeLine}
              onCheckoutSuccess={() => setCart([])}
              onClose={() => setIsCartPanelOpen(false)}
            />
          </aside>
        ) : null}
      </main>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-100 pb-6 last:border-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <ChevronDown className="size-4 text-slate-400" />
      </div>
      {children}
    </section>
  );
}

function ProductCard({
  product,
  locale,
  priority,
  onAdd,
}: {
  product: Product;
  locale: Locale;
  priority?: boolean;
  onAdd: () => void;
}) {
  const t = copy[locale];
  const variant = product.variants[0];
  const [isAdded, setIsAdded] = useState(false);
  const statusText =
    variant.stockStatus === "in_stock"
      ? t.inStock
      : variant.stockStatus === "low_stock"
        ? `${t.lowStock} (${variant.stockNote})`
        : t.quoteOnly;

  useEffect(() => {
    if (!isAdded) {
      return;
    }

    const timer = window.setTimeout(() => setIsAdded(false), 1200);
    return () => window.clearTimeout(timer);
  }, [isAdded]);

  function handleAdd() {
    onAdd();
    setIsAdded(true);
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-md border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition",
        isAdded
          ? "border-emerald-300 shadow-[0_12px_40px_rgba(5,150,105,0.12)]"
          : "border-slate-200",
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-950">
        {priority ? (
          <Image
            src={product.imagePath}
            alt={product.nameEn}
            fill
            className="object-cover"
            priority
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <Image
            src={product.imagePath}
            alt={product.nameEn}
            fill
            className="object-cover"
            loading="lazy"
            fetchPriority="auto"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        <button className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/25 text-white backdrop-blur">
          <Heart className="size-5" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-950">
          {locale === "en" ? product.nameEn : product.nameZh}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {variant.sizeMm} | {product.grade} | {variant.color}
        </p>
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="mb-2 flex justify-between text-sm text-slate-500">
            <span>{t.moq}</span>
            <span>{variant.moq.toLocaleString()} pcs</span>
          </div>
          <div className="space-y-2">
            {variant.priceTiers.map((tier) => (
              <div
                key={tier.label}
                className="flex items-start justify-between text-sm"
              >
                <span className="text-slate-500">{tier.label}</span>
                <span className="text-right font-medium">
                  {formatUsd(tier.priceUsd, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                  <span className="block text-xs font-normal text-slate-400">
                    {formatInr(tier.priceUsd * usdInrRate)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-sm",
              variant.stockStatus === "low_stock"
                ? "text-amber-600"
                : "text-emerald-700",
            )}
          >
            <span className="size-2 rounded-full bg-current" />
            {statusText}
          </span>
          <button
            className={cn(
              "inline-flex h-10 min-w-20 items-center justify-center gap-1.5 rounded-md px-5 text-sm font-semibold text-white transition",
              isAdded
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-[#003f4b] hover:bg-[#005466]",
            )}
            onClick={handleAdd}
            aria-live="polite"
          >
            {isAdded ? <Check className="size-4" /> : null}
            {isAdded ? t.added : t.add}
          </button>
        </div>
      </div>
    </article>
  );
}

function CartPanel({
  cart,
  products,
  paymentMethods,
  locale,
  subtotal,
  updateQuantity,
  removeLine,
  onCheckoutSuccess,
  onClose,
}: {
  cart: CartLine[];
  products: Product[];
  paymentMethods: PaymentMethod[];
  locale: Locale;
  subtotal: number;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  onCheckoutSuccess: () => void;
  onClose: () => void;
}) {
  const t = copy[locale];
  const router = useRouter();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [form, setForm] = useState<CheckoutFormState>(defaultCheckoutForm);
  const [selectedPaymentProvider, setSelectedPaymentProvider] =
    useState<PaymentProvider | "">("xtransfer");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const enabledPaymentMethods = useMemo(
    () => paymentMethods.filter((method) => method.enabled),
    [paymentMethods],
  );
  const validCartLines = useMemo(
    () =>
      cart.filter((line) => {
        const { product, variant } = lineProduct(line, products);
        return Boolean(product && variant);
      }),
    [cart, products],
  );

  const activePaymentProvider =
    enabledPaymentMethods.find(
      (method) => method.provider === selectedPaymentProvider,
    )?.provider ??
    enabledPaymentMethods[0]?.provider ??
    "";

  function updateForm(field: keyof CheckoutFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!activePaymentProvider) {
      setError(locale === "zh" ? "请先启用收款方式。" : "No payment option is enabled.");
      return;
    }
    if (validCartLines.length === 0) {
      setError(locale === "zh" ? "询价车为空。" : "Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale,
          customer: form,
          selectedPaymentProvider: activePaymentProvider,
          lines: validCartLines,
          note,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        orderPath?: string;
      };

      if (!response.ok || !data.orderPath) {
        setError(data.error ?? (locale === "zh" ? "提交失败，请重试。" : "Unable to submit checkout."));
        return;
      }

      clearCart();
      onCheckoutSuccess();
      router.push(data.orderPath);
    } catch {
      setError(locale === "zh" ? "网络错误，请重试。" : "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="sticky top-[70px] flex max-h-[calc(100vh-70px)] flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold">
          {locale === "en" ? "Your Cart" : "询价车"} ({validCartLines.length})
        </h2>
        <button onClick={onClose} aria-label="Close cart panel">
          <X className="size-5" />
        </button>
      </div>
      <div className="border-b border-slate-100 p-5">
        <p className="text-sm text-slate-500">
          Subtotal ({validCartLines.length} items)
        </p>
        <p className="mt-1 text-2xl font-semibold">{formatUsd(subtotal)}</p>
        <p className="text-sm text-slate-500">≈ {formatInr(subtotal * usdInrRate)}</p>
        <div className="mt-5 flex gap-3 rounded-md bg-sky-50 p-4 text-sm text-slate-600">
          <Info className="mt-0.5 size-5 shrink-0 text-[#005466]" />
          <span>{t.invoiceNote}</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {validCartLines.map((line) => {
          const { product, variant } = lineProduct(line, products);
          if (!product || !variant) return null;
          return (
            <div key={variant.id} className="flex gap-3 border-b border-slate-100 pb-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-slate-950">
                <Image
                  src={product.imagePath}
                  alt={product.nameEn}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{product.nameEn}</p>
                    <p className="text-xs text-slate-500">
                      {variant.sizeMm} | {product.grade} | {variant.color}
                    </p>
                  </div>
                  <button onClick={() => removeLine(variant.id)} aria-label="Remove item">
                    <X className="size-4 text-slate-400" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex h-8 items-center rounded-md border border-slate-200">
                    <button
                      className="grid size-8 place-items-center"
                      onClick={() =>
                        updateQuantity(variant.id, line.quantity - variant.moq)
                      }
                    >
                      -
                    </button>
                    <span className="min-w-14 text-center text-sm">
                      {line.quantity.toLocaleString()}
                    </span>
                    <button
                      className="grid size-8 place-items-center"
                      onClick={() =>
                        updateQuantity(variant.id, line.quantity + variant.moq)
                      }
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatUsd(lineTotal(variant, line.quantity))}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-100 p-5">
        <button
          className="h-12 w-full rounded-md bg-[#003f4b] text-sm font-semibold text-white transition hover:bg-[#005466] disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={cart.length === 0}
          onClick={() => setIsCheckoutOpen((current) => !current)}
        >
          {t.requestInvoice}
        </button>
        {isCheckoutOpen && (
          <form className="mt-5 space-y-4" onSubmit={submitCheckout}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{t.checkout}</h3>
              <button type="button" onClick={() => setIsCheckoutOpen(false)}>
                <X className="size-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CheckoutInput
                label={t.companyName}
                value={form.companyName}
                onChange={(value) => updateForm("companyName", value)}
                required
              />
              <CheckoutInput
                label={t.contactName}
                value={form.contactName}
                onChange={(value) => updateForm("contactName", value)}
                required
              />
              <CheckoutInput
                label={t.whatsappNo}
                value={form.whatsapp}
                onChange={(value) => updateForm("whatsapp", value)}
                required
              />
              <CheckoutInput
                label={t.email}
                type="email"
                value={form.email}
                onChange={(value) => updateForm("email", value)}
                required
              />
              <CheckoutInput
                label={t.city}
                value={form.city}
                onChange={(value) => updateForm("city", value)}
                required
              />
              <CheckoutInput
                label={t.pinCode}
                value={form.pinCode}
                onChange={(value) => updateForm("pinCode", value)}
                inputMode="numeric"
                required
              />
            </div>
            <CheckoutInput
              label={t.address}
              value={form.addressLine1}
              onChange={(value) => updateForm("addressLine1", value)}
              required
            />
            <div className="grid grid-cols-1 gap-3">
              <CheckoutInput
                label={t.landmark}
                value={form.landmark}
                onChange={(value) => updateForm("landmark", value)}
              />
              <CheckoutInput
                label={t.gstin}
                value={form.gstin}
                onChange={(value) => updateForm("gstin", value)}
              />
              <CheckoutInput
                label={t.iec}
                value={form.iec}
                onChange={(value) => updateForm("iec", value)}
              />
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              {t.manualOptions}
              <select
                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-[#005466]"
                value={activePaymentProvider}
                onChange={(event) =>
                  setSelectedPaymentProvider(event.target.value as PaymentProvider)
                }
              >
                {enabledPaymentMethods.map((method) => (
                  <option key={method.id} value={method.provider}>
                    {method.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              {t.note}
              <textarea
                className="mt-1 min-h-20 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-[#005466]"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="h-11 w-full rounded-md bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:bg-slate-300"
              disabled={isSubmitting || enabledPaymentMethods.length === 0 || validCartLines.length === 0}
            >
              {isSubmitting ? t.submitting : t.submitOrder}
            </button>
          </form>
        )}
        <p className="mt-3 text-center text-xs font-medium text-slate-500">
          {t.secure}
        </p>
        <p className="mt-2 text-center text-xs text-slate-500">{t.response}</p>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold text-slate-600">
            {t.manualOptions}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {enabledPaymentMethods.map((method) => (
              <div
                key={method.id}
                className="rounded-md border border-slate-200 p-2 text-center text-[11px] text-slate-600"
              >
                <span className="mx-auto mb-1 grid size-7 place-items-center rounded-md bg-slate-100 font-bold text-[#005466]">
                  {method.name.slice(0, 1)}
                </span>
                {method.name}
              </div>
            ))}
            <div className="rounded-md border border-slate-200 p-2 text-center text-[11px] text-slate-600">
              <MessageCircle className="mx-auto mb-1 size-7 rounded-md bg-emerald-50 p-1 text-emerald-600" />
              WhatsApp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutInput({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
}) {
  return (
    <label className="block min-w-0 text-xs font-semibold text-slate-600">
      <span className="truncate">{label}</span>
      <input
        className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-[#005466]"
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}
