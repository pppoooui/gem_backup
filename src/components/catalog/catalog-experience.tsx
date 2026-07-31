"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Check,
  ChevronDown,
  ChevronUp,
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
  UserCircle,
  X,
} from "lucide-react";
import { PUBLIC_SITE_NAME } from "@/lib/site-config";
import { clearCart, getCartLines, setCartLines } from "@/lib/cart-store";
import {
  filterCatalogProducts,
  normalizeCatalogColor,
  sortCatalogProducts,
  type CatalogSort,
} from "@/lib/catalog-filters";
import type {
  CartLine,
  Locale,
  PaymentMethod,
  PaymentProvider,
  Product,
  ProductVariant,
} from "@/types/domain";
import { cn, formatUsd } from "@/lib/utils";

const copy = {
  en: {
    products: "Products",
    resources: "Resources",
    search: "Search shape, size, color, SKU...",
    cart: "Cart",
    filters: "Filters",
    clear: "Clear all",
    sort: "Sort by: Best match",
    searchShape: "Search shape",
    showMore: "Show more",
    showLess: "Show less",
    noProducts: "No products match these filters.",
    shape: "Shape",
    color: "Color",
    size: "Size",
    grade: "Quality / Grade",
    cut: "Cut",
    moq: "MOQ",
    add: "Add to cart",
    added: "In cart",
    inStock: "In stock",
    lowStock: "Low stock",
    quoteOnly: "Quote batch",
    requestInvoice: "Proceed to Checkout",
    checkout: "Checkout Details",
    companyName: "Company name",
    contactName: "Contact name",
    whatsappNo: "WhatsApp number",
    email: "Email",
    city: "City",
    country: "Country / Region",
    pinCode: "Postal code",
    address: "Shipping address",
    landmark: "Address details",
    gstin: "Tax / VAT ID",
    iec: "Import / Export ID",
    note: "Note",
    submitOrder: "Place Order",
    submitting: "Submitting...",
    manualOptions: "Manual Payment Options",
    invoiceNote: "Shipping & taxes calculated in final invoice.",
    secure: "Secure & Confidential",
    response: "Sales will confirm the final amount and publish a secure Pay now button on your order page.",
  },
  zh: {
    products: "商品",
    resources: "资料",
    search: "搜索形状、尺寸、颜色、SKU...",
    cart: "购物车",
    filters: "筛选",
    clear: "清空",
    sort: "排序：最佳匹配",
    searchShape: "搜索形状",
    showMore: "展开更多",
    showLess: "收起",
    noProducts: "没有符合当前筛选条件的商品。",
    shape: "形状",
    color: "颜色",
    size: "尺寸",
    grade: "品质 / 等级",
    cut: "切工",
    moq: "起批",
    add: "加入购物车",
    added: "已在购物车",
    inStock: "有货",
    lowStock: "低库存",
    quoteOnly: "确认批次",
    requestInvoice: "去结算",
    checkout: "下单信息",
    companyName: "公司名称",
    contactName: "联系人",
    whatsappNo: "WhatsApp 号码",
    email: "邮箱",
    city: "城市",
    country: "国家 / 地区",
    pinCode: "邮政编码",
    address: "收货地址",
    landmark: "地址补充",
    gstin: "税号 / VAT（可选）",
    iec: "进出口编号（可选）",
    note: "备注",
    submitOrder: "提交订单",
    submitting: "提交中...",
    manualOptions: "人工确认收款方式",
    invoiceNote: "运费和税费将在最终 PI 中确认。",
    secure: "安全保密",
    response: "客服确认最终金额后，订单页会出现安全的“立即支付”按钮。",
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

const shapeOptions = [
  "Round",
  "Princess",
  "Cushion",
  "Oval",
  "Pear",
  "Heart",
  "Marquise",
] as const;

const colorOptions = [
  { name: "Colorless", value: "#f8fafc" },
  { name: "Gray", value: "#d6d7d8" },
  { name: "Yellow", value: "#efd55f" },
  { name: "Champagne", value: "#d6b06d" },
  { name: "Pink", value: "#efafd0" },
  { name: "Purple", value: "#9f74d8" },
  { name: "Red", value: "#b51f2e" },
  { name: "Blue", value: "#3151d3" },
  { name: "Green", value: "#079455" },
  { name: "Black", value: "#09090b" },
] as const;

function lineProduct(line: CartLine, products: Product[]) {
  const product = products.find((item) => item.id === line.productId);
  const variant = product?.variants.find((item) => item.id === line.variantId);
  return { product, variant };
}

function lineTotal(variant: ProductVariant, quantity: number) {
  const tier = [...variant.priceTiers]
    .reverse()
    .find((item) => quantity >= item.minQuantity);
  return (tier?.priceUsd ?? variant.priceTiers[0]?.priceUsd ?? 0) * quantity;
}

function cartLineKey(line: CartLine) {
  return `${line.productId}:${line.variantId}:${line.grade ?? "5A"}`;
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
  whatsapp: "",
  email: "",
  country: "",
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
  showPrices,
}: {
  locale: Locale;
  products: Product[];
  paymentMethods: PaymentMethod[];
  whatsappNumber?: string;
  showPrices: boolean;
}) {
  const t = copy[locale];
  const pathname = usePathname();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shapeSearch, setShapeSearch] = useState("");
  const [selectedShapes, setSelectedShapes] = useState<string[]>(["Round"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["Colorless"]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(["3A", "5A"]);
  const [selectedCuts, setSelectedCuts] = useState<string[]>([]);
  const [minSize, setMinSize] = useState("1");
  const [maxSize, setMaxSize] = useState("12");
  const [sort, setSort] = useState<CatalogSort>("best_match");

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

  const filteredProducts = useMemo(() => {
    const filtered = filterCatalogProducts(products, {
      query,
      shapes: selectedShapes,
      colors: selectedColors,
      grades: selectedGrades,
      cuts: selectedCuts,
      minSize: minSize === "" ? 0 : Number(minSize),
      maxSize: maxSize === "" ? Number.POSITIVE_INFINITY : Number(maxSize),
    });
    return sortCatalogProducts(filtered, sort);
  }, [
    maxSize,
    minSize,
    products,
    query,
    selectedColors,
    selectedCuts,
    selectedGrades,
    selectedShapes,
    sort,
  ]);

  function toggleValue(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function clearFilters() {
    setQuery("");
    setShapeSearch("");
    setSelectedShapes([]);
    setSelectedColors([]);
    setSelectedGrades([]);
    setSelectedCuts([]);
    setMinSize("");
    setMaxSize("");
  }

  function addProduct(product: Product, variantId: string, grade: "3A" | "5A") {
    const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
    setIsCartPanelOpen(true);
    setCart((current) => {
      const existing = current.find(
        (line) =>
          line.productId === product.id &&
          line.variantId === variant.id &&
          (line.grade ?? "5A") === grade,
      );
      if (existing) {
        return current.map((line) =>
          cartLineKey(line) === cartLineKey(existing)
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
          grade,
        },
      ];
    });
  }

  function updateQuantity(key: string, quantity: number) {
    setCart((current) =>
      current
        .map((line) =>
          cartLineKey(line) === key
            ? { ...line, quantity: Math.max(quantity, 0) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function removeLine(key: string) {
    setCart((current) => current.filter((line) => cartLineKey(line) !== key));
  }

  const alternateLocale = locale === "en" ? "zh" : "en";
  const alternateLocaleHref = pathname.replace(
    /^\/(en|zh)(?=\/|$)/,
    `/${alternateLocale}`,
  );
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-[70px] items-center gap-5 px-4 sm:px-6 xl:px-8">
          <Link
            href={`/${locale}`}
            className="shrink-0 text-2xl font-bold tracking-tight text-[#002b35]"
          >
            {PUBLIC_SITE_NAME}
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
            <Link href={`/${locale}/account`} className="inline-flex items-center gap-1.5" title={locale === "zh" ? "客户账号" : "Customer account"}>
              <UserCircle className="size-5 text-[#005466]" />
              <span className="hidden xl:inline">{locale === "zh" ? "账号" : "Account"}</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsCartPanelOpen(true)}
              className="relative inline-flex items-center gap-1.5"
            >
              <ShoppingCart className="size-6" />
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#003f4b] text-[11px] text-white">
                {cart.length}
              </span>
              <span className="hidden sm:inline">{t.cart}</span>
            </button>
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

      <main
        className={cn(
          "grid",
          isCartPanelOpen
            ? "lg:grid-cols-[242px_minmax(0,1fr)_312px]"
            : "lg:grid-cols-[242px_minmax(0,1fr)]",
        )}
      >
        <aside className="hidden min-h-[calc(100vh-134px)] border-r border-slate-200 bg-white lg:block">
          <CatalogFilterPanel
            locale={locale}
            products={products}
            shapeSearch={shapeSearch}
            setShapeSearch={setShapeSearch}
            selectedShapes={selectedShapes}
            selectedColors={selectedColors}
            selectedGrades={selectedGrades}
            selectedCuts={selectedCuts}
            minSize={minSize}
            maxSize={maxSize}
            setMinSize={setMinSize}
            setMaxSize={setMaxSize}
            toggleShape={(value) => toggleValue(setSelectedShapes, value)}
            toggleColor={(value) => toggleValue(setSelectedColors, value)}
            toggleGrade={(value) => toggleValue(setSelectedGrades, value)}
            toggleCut={(value) => toggleValue(setSelectedCuts, value)}
            clearFilters={clearFilters}
          />
        </aside>

        <section className="min-w-0 bg-[#fbfcfc] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                {t.filters}
              </button>
              <p className="text-sm text-slate-500">
                {filteredProducts.length.toLocaleString()} {locale === "zh" ? "个商品" : "products"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as CatalogSort)}
                aria-label={locale === "zh" ? "商品排序" : "Sort products"}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#005466]"
              >
                <option value="best_match">{t.sort}</option>
                <option value="size_asc">{locale === "zh" ? "尺寸：从小到大" : "Size: Low to high"}</option>
                <option value="size_desc">{locale === "zh" ? "尺寸：从大到小" : "Size: High to low"}</option>
                <option value="name_asc">{locale === "zh" ? "名称：A-Z" : "Name: A-Z"}</option>
              </select>
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
            {selectedShapes.length > 0 && (
              <FilterChip
                label={`${t.shape}: ${selectedShapes.join(" / ")}`}
                onRemove={() => setSelectedShapes([])}
              />
            )}
            {selectedColors.length > 0 && (
              <FilterChip
                label={`${t.color}: ${selectedColors.join(" / ")}`}
                onRemove={() => setSelectedColors([])}
              />
            )}
            {(minSize !== "" || maxSize !== "") && (
              <FilterChip
                label={`${t.size}: ${minSize || "0"} - ${maxSize || "∞"} mm`}
                onRemove={() => {
                  setMinSize("");
                  setMaxSize("");
                }}
              />
            )}
            {selectedGrades.length > 0 && (
              <FilterChip
                label={`${t.grade}: ${selectedGrades.join(" / ")}`}
                onRemove={() => setSelectedGrades([])}
              />
            )}
            {selectedCuts.length > 0 && (
              <FilterChip
                label={`${t.cut}: ${selectedCuts.join(" / ")}`}
                onRemove={() => setSelectedCuts([])}
              />
            )}
            {(query ||
              selectedShapes.length > 0 ||
              selectedColors.length > 0 ||
              selectedGrades.length > 0 ||
              selectedCuts.length > 0 ||
              minSize !== "" ||
              maxSize !== "") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-[#005466]"
              >
                {t.clear}
              </button>
            )}
          </div>

          <div
            className={cn(
              "grid gap-6",
              view === "grid"
                ? showPrices
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 min-[1500px]:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                priority={index < 3}
                showPrices={showPrices}
                onAdd={(variantId, grade) => addProduct(product, variantId, grade)}
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
              {t.noProducts}
            </div>
          )}
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
              showPrices={showPrices}
            />
          </aside>
        ) : null}
      </main>
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0"
            aria-label={locale === "zh" ? "关闭筛选" : "Close filters"}
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(88vw,340px)] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-semibold">{t.filters}</h2>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                aria-label={locale === "zh" ? "关闭筛选" : "Close filters"}
              >
                <X className="size-5" />
              </button>
            </div>
            <CatalogFilterPanel
              locale={locale}
              products={products}
              shapeSearch={shapeSearch}
              setShapeSearch={setShapeSearch}
              selectedShapes={selectedShapes}
              selectedColors={selectedColors}
              selectedGrades={selectedGrades}
              selectedCuts={selectedCuts}
              minSize={minSize}
              maxSize={maxSize}
              setMinSize={setMinSize}
              setMaxSize={setMaxSize}
              toggleShape={(value) => toggleValue(setSelectedShapes, value)}
              toggleColor={(value) => toggleValue(setSelectedColors, value)}
              toggleGrade={(value) => toggleValue(setSelectedGrades, value)}
              toggleCut={(value) => toggleValue(setSelectedCuts, value)}
              clearFilters={clearFilters}
              compact
            />
            <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="h-11 w-full rounded-md bg-[#003f4b] text-sm font-semibold text-white"
              >
                {locale === "zh"
                  ? `查看 ${filteredProducts.length} 个商品`
                  : `View ${filteredProducts.length} products`}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-slate-100 pb-6 last:border-0">
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between text-left",
          isOpen && "mb-4",
        )}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        {isOpen ? (
          <ChevronUp className="size-4 text-slate-400" />
        ) : (
          <ChevronDown className="size-4 text-slate-400" />
        )}
      </button>
      {isOpen ? children : null}
    </section>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-100 px-3 text-sm text-slate-700 transition hover:bg-slate-200"
    >
      {label}
      <X className="size-3.5" />
    </button>
  );
}

function CatalogFilterPanel({
  locale,
  products,
  shapeSearch,
  setShapeSearch,
  selectedShapes,
  selectedColors,
  selectedGrades,
  selectedCuts,
  minSize,
  maxSize,
  setMinSize,
  setMaxSize,
  toggleShape,
  toggleColor,
  toggleGrade,
  toggleCut,
  clearFilters,
  compact = false,
}: {
  locale: Locale;
  products: Product[];
  shapeSearch: string;
  setShapeSearch: (value: string) => void;
  selectedShapes: string[];
  selectedColors: string[];
  selectedGrades: string[];
  selectedCuts: string[];
  minSize: string;
  maxSize: string;
  setMinSize: (value: string) => void;
  setMaxSize: (value: string) => void;
  toggleShape: (value: string) => void;
  toggleColor: (value: string) => void;
  toggleGrade: (value: string) => void;
  toggleCut: (value: string) => void;
  clearFilters: () => void;
  compact?: boolean;
}) {
  const t = copy[locale];
  const [showAllShapes, setShowAllShapes] = useState(false);
  const normalizedShapeSearch = shapeSearch.trim().toLowerCase();
  const matchingShapes = shapeOptions.filter((shape) =>
    shape.toLowerCase().includes(normalizedShapeSearch),
  );
  const visibleShapes = showAllShapes
    ? matchingShapes
    : matchingShapes.slice(0, 5);
  const availableCuts = Array.from(
    new Set([...products.map((product) => product.cut), "Very Good"]),
  );

  return (
    <>
      {!compact && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-7">
          <h2 className="text-xl font-semibold">{t.filters}</h2>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-[#005466]"
          >
            {t.clear}
          </button>
        </div>
      )}
      <div className="space-y-7 px-6 py-6">
        <FilterGroup title={t.shape}>
          <input
            className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#005466]"
            placeholder={t.searchShape}
            value={shapeSearch}
            onChange={(event) => setShapeSearch(event.target.value)}
          />
          <div className="space-y-3 pt-3">
            {visibleShapes.map((shape) => {
              const checked = selectedShapes.includes(shape);
              const count = products.filter(
                (product) => product.shape === shape,
              ).length;
              return (
                <label
                  key={shape}
                  className="flex cursor-pointer items-center justify-between text-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleShape(shape)}
                      className="size-4 accent-[#003f4b]"
                    />
                    {shape}
                  </span>
                  <span className="text-slate-500">
                    {count.toLocaleString()}
                  </span>
                </label>
              );
            })}
          </div>
          {matchingShapes.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllShapes((current) => !current)}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#005466]"
            >
              {showAllShapes ? t.showLess : t.showMore}
              {showAllShapes ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          )}
        </FilterGroup>

        <FilterGroup title={t.color}>
          <div className="grid grid-cols-6 gap-3">
            {colorOptions.map((color) => {
              const checked = selectedColors.includes(color.name);
              const count = products.reduce(
                (total, product) =>
                  total +
                  product.variants.filter(
                    (variant) =>
                      normalizeCatalogColor(variant.color) === color.name,
                  ).length,
                0,
              );
              return (
                <button
                  type="button"
                  key={color.name}
                  className={cn(
                    "relative size-7 rounded-full border shadow-sm transition",
                    checked
                      ? "border-[#003f4b] ring-2 ring-[#003f4b] ring-offset-2"
                      : "border-slate-300 hover:scale-110",
                  )}
                  style={{ backgroundColor: color.value }}
                  aria-label={`${color.name}, ${count} ${locale === "zh" ? "个规格" : "variants"}`}
                  aria-pressed={checked}
                  title={color.name}
                  onClick={() => toggleColor(color.name)}
                >
                  {checked && (
                    <Check
                      className={cn(
                        "absolute inset-1 size-5",
                        color.name === "Black" ||
                          color.name === "Blue" ||
                          color.name === "Red" ||
                          color.name === "Green" ||
                          color.name === "Purple"
                          ? "text-white"
                          : "text-slate-900",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup title={t.size}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <input
              type="number"
              min="0"
              max="12"
              step="0.05"
              aria-label={locale === "zh" ? "最小尺寸" : "Minimum size"}
              className="h-9 min-w-0 rounded-md border border-slate-200 px-3 text-sm"
              value={minSize}
              onChange={(event) => setMinSize(event.target.value)}
            />
            <span className="text-xs text-slate-500">
              {locale === "zh" ? "至" : "to"}
            </span>
            <input
              type="number"
              min="0"
              max="12"
              step="0.05"
              aria-label={locale === "zh" ? "最大尺寸" : "Maximum size"}
              className="h-9 min-w-0 rounded-md border border-slate-200 px-3 text-sm"
              value={maxSize}
              onChange={(event) => setMaxSize(event.target.value)}
            />
          </div>
          <div className="mt-4 space-y-2">
            <input
              type="range"
              min="0"
              max="12"
              step="0.05"
              value={minSize || "0"}
              onChange={(event) => setMinSize(event.target.value)}
              aria-label={locale === "zh" ? "拖动最小尺寸" : "Minimum size slider"}
              className="block h-2 w-full accent-[#005466]"
            />
            <input
              type="range"
              min="0"
              max="12"
              step="0.05"
              value={maxSize || "12"}
              onChange={(event) => setMaxSize(event.target.value)}
              aria-label={locale === "zh" ? "拖动最大尺寸" : "Maximum size slider"}
              className="block h-2 w-full accent-[#005466]"
            />
          </div>
        </FilterGroup>

        <FilterGroup title={t.grade}>
          {["5A", "3A", "2A"].map((grade) => (
            <label
              key={grade}
              className="mt-3 flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedGrades.includes(grade)}
                onChange={() => toggleGrade(grade)}
                className="size-4 accent-[#003f4b]"
              />
              {grade}
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title={t.cut}>
          {availableCuts.map((cut) => (
            <label
              key={cut}
              className="mt-3 flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedCuts.includes(cut)}
                onChange={() => toggleCut(cut)}
                className="size-4 accent-[#003f4b]"
              />
              {cut}
            </label>
          ))}
        </FilterGroup>
      </div>
    </>
  );
}

function ProductCard({
  product,
  locale,
  priority,
  showPrices,
  onAdd,
}: {
  product: Product;
  locale: Locale;
  priority?: boolean;
  showPrices: boolean;
  onAdd: (variantId: string, grade: "3A" | "5A") => void;
}) {
  const t = copy[locale];
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [selectedGrade, setSelectedGrade] = useState<"3A" | "5A">("5A");
  const variant =
    product.variants.find((item) => item.id === selectedVariantId) ??
    product.variants[0];
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
    onAdd(variant.id, selectedGrade);
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
          Round | White | {selectedGrade}
        </p>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_88px] gap-2">
          <select
            aria-label={locale === "zh" ? "选择规格" : "Select size"}
            value={selectedVariantId}
            onChange={(event) => setSelectedVariantId(event.target.value)}
            className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-[#005466]"
          >
            {product.variants.map((item) => (
              <option key={item.id} value={item.id}>{item.sizeMm}</option>
            ))}
          </select>
          <select
            aria-label={locale === "zh" ? "选择等级" : "Select grade"}
            value={selectedGrade}
            onChange={(event) => setSelectedGrade(event.target.value as "3A" | "5A")}
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-[#005466]"
          >
            <option value="5A">5A</option>
            <option value="3A">3A</option>
          </select>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {product.variants.length > 1
            ? `${product.variants.length} sizes: ${product.variants[0].sizeMm} - ${product.variants[product.variants.length - 1].sizeMm}`
            : variant.sizeMm}
        </p>
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="mb-2 flex justify-between text-sm text-slate-500">
            <span>{t.moq}</span>
            <span>{variant.moq.toLocaleString()} pcs</span>
          </div>
          {showPrices && variant.priceTiers.some((tier) => tier.priceUsd > 0) ? <div className="space-y-2">
            {variant.priceTiers.filter((tier) => tier.priceUsd > 0).map((tier) => (
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
                  <span className="block text-xs font-normal text-slate-400">USD</span>
                </span>
              </div>
            ))}
          </div> : showPrices ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              {locale === "zh" ? "价格由后台确认" : "Final price confirmed by sales"}
            </p>
          ) : null}
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
  showPrices,
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
  showPrices: boolean;
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
      setError(locale === "zh" ? "购物车为空。" : "Your cart is empty.");
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
          {locale === "en" ? "Your Cart" : "购物车"} ({validCartLines.length})
        </h2>
        <button onClick={onClose} aria-label="Close cart panel">
          <X className="size-5" />
        </button>
      </div>
      <div className="border-b border-slate-100 p-5">
        <p className="text-sm text-slate-500">
          {showPrices ? "Subtotal" : locale === "zh" ? "订单商品" : "Order items"} ({validCartLines.length})
        </p>
        {showPrices ? <>
          <p className="mt-1 text-2xl font-semibold">
            {subtotal > 0
              ? formatUsd(subtotal)
              : locale === "zh"
                ? "待后台确认"
                : "To be confirmed"}
          </p>
          <p className="text-sm text-slate-500">USD</p>
        </> : <p className="mt-1 text-sm font-medium text-[#005466]">
          {locale === "zh" ? "提交后由客服确认价格" : "Price confirmed by sales after submission"}
        </p>}
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
            <div key={cartLineKey(line)} className="flex gap-3 border-b border-slate-100 pb-4">
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
                      {variant.sizeMm} | {line.grade ?? product.grade} | {variant.color}
                    </p>
                  </div>
                  <button onClick={() => removeLine(cartLineKey(line))} aria-label="Remove item">
                    <X className="size-4 text-slate-400" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex h-8 items-center rounded-md border border-slate-200">
                    <button
                      className="grid size-8 place-items-center"
                      onClick={() =>
                        updateQuantity(cartLineKey(line), Math.max(variant.moq, line.quantity - variant.moq))
                      }
                    >
                      -
                    </button>
                    <input
                      aria-label={locale === "zh" ? "数量" : "Quantity"}
                      type="number"
                      min={variant.moq}
                      step={1}
                      value={line.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          cartLineKey(line),
                          Math.max(variant.moq, Number(event.target.value) || variant.moq),
                        )
                      }
                      className="h-8 w-20 border-x border-slate-200 text-center text-xs outline-none"
                    />
                    <button
                      className="grid size-8 place-items-center"
                      onClick={() =>
                        updateQuantity(cartLineKey(line), line.quantity + variant.moq)
                      }
                    >
                      +
                    </button>
                  </div>
                  {showPrices ? <p className="text-sm font-semibold">
                    {lineTotal(variant, line.quantity) > 0
                      ? formatUsd(lineTotal(variant, line.quantity))
                      : locale === "zh"
                        ? "待报价"
                        : "Pending quote"}
                  </p> : null}
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
          {showPrices
            ? t.requestInvoice
            : locale === "zh"
              ? "提交订单并确认价格"
              : "Submit order for quotation"}
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
                label={t.country}
                value={form.country}
                onChange={(value) => updateForm("country", value)}
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
                inputMode="text"
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
            {showPrices ? <label className="block text-xs font-semibold text-slate-600">
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
            </label> : null}
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
        {showPrices ? <div className="mt-5 border-t border-slate-100 pt-5">
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
        </div> : null}
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
