"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usdInrRate } from "@/data/products";
import { getCartLines, setCartLines } from "@/lib/cart-store";
import type { Locale, Product } from "@/types/domain";
import { cn, formatInr, formatUsd, serializeJsonLd } from "@/lib/utils";
import {
  ArrowLeft,
  Factory,
  Package,
  Scale,
  Truck,
} from "lucide-react";

const copy = {
  en: {
    back: "Back to Products",
    inStock: "In stock",
    lowStock: "Low stock",
    quoteOnly: "Quote batch",
    moq: "MOQ",
    addToCart: "Add to Cart",
    description: "Description",
    specifications: "Specifications",
    shape: "Shape",
    color: "Color",
    size: "Size",
    grade: "Grade",
    cut: "Cut",
    clarity: "Clarity",
    origin: "Material",
    sku: "SKU",
    priceTiers: "Price Tiers",
    perPiece: "/pc",
    factoryDirect: "Factory Direct",
    bulkPrice: "Bulk Price",
    fastDispatch: "Fast Dispatch",
    customPacking: "Custom Packing",
    factoryDirectDesc: "Direct from CZ manufacturer, no middlemen.",
    bulkPriceDesc: "Lower unit price for higher quantities.",
    fastDispatchDesc: "Ships in 1-3 business days after payment.",
    customPackingDesc: "Logo, labels, blister packs available.",
  },
  zh: {
    back: "返回商品列表",
    inStock: "有货",
    lowStock: "低库存",
    quoteOnly: "确认批次",
    moq: "起订量",
    addToCart: "加入购物车",
    description: "商品描述",
    specifications: "规格参数",
    shape: "形状",
    color: "颜色",
    size: "尺寸",
    grade: "等级",
    cut: "切工",
    clarity: "净度",
    origin: "材质",
    sku: "SKU",
    priceTiers: "价格阶梯",
    perPiece: "/颗",
    factoryDirect: "源头工厂",
    bulkPrice: "批量价",
    fastDispatch: "快速发货",
    customPacking: "定制包装",
    factoryDirectDesc: "立方氧化锆工厂直供，无中间环节。",
    bulkPriceDesc: "采购量越多，单价越低。",
    fastDispatchDesc: "付款后 1-3 个工作日内发货。",
    customPackingDesc: "可定制 Logo、标签、吸塑包装。",
  },
} satisfies Record<Locale, Record<string, string>>;

const trustItems = [
  {
    icon: Factory,
    titleKey: "factoryDirect" as const,
    descKey: "factoryDirectDesc" as const,
  },
  {
    icon: Scale,
    titleKey: "bulkPrice" as const,
    descKey: "bulkPriceDesc" as const,
  },
  {
    icon: Truck,
    titleKey: "fastDispatch" as const,
    descKey: "fastDispatchDesc" as const,
  },
  {
    icon: Package,
    titleKey: "customPacking" as const,
    descKey: "customPackingDesc" as const,
  },
];

export default function ProductDetailPage({
  locale,
  product,
}: {
  locale: Locale;
  product: Product;
}) {
  const router = useRouter();
  const t = copy[locale];
  const activeProduct = product;
  const variant = activeProduct.variants[0];
  const [selectedVariant, setSelectedVariant] = useState(variant);

  const statusColor =
    selectedVariant.stockStatus === "low_stock"
      ? "text-amber-600"
      : selectedVariant.stockStatus === "in_stock"
        ? "text-emerald-700"
        : "text-slate-400";

  const statusText =
    selectedVariant.stockStatus === "in_stock"
      ? t.inStock
      : selectedVariant.stockStatus === "low_stock"
        ? `${t.lowStock} (${selectedVariant.stockNote})`
        : t.quoteOnly;

  function addSelectedVariantToCart() {
    const current = getCartLines();
    const existing = current.find(
      (line) =>
        line.productId === activeProduct.id && line.variantId === selectedVariant.id,
    );
    const nextCart = existing
      ? current.map((line) =>
          line.productId === activeProduct.id && line.variantId === selectedVariant.id
            ? { ...line, quantity: line.quantity + selectedVariant.moq }
            : line,
        )
      : [
          ...current,
          {
            productId: activeProduct.id,
            variantId: selectedVariant.id,
            quantity: selectedVariant.moq,
          },
        ];

    setCartLines(nextCart);
    router.push(`/${locale}/cart`);
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 xl:px-8">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#003f4b]"
          >
            <ArrowLeft className="size-4" />
            {t.back}
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-sm font-medium text-slate-900 truncate">
            {locale === "en" ? activeProduct.nameEn : activeProduct.nameZh}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 xl:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-950">
            <Image
              src={activeProduct.imagePath}
              alt={locale === "en" ? activeProduct.nameEn : activeProduct.nameZh}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  {locale === "en" ? activeProduct.nameEn : activeProduct.nameZh}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedVariant.sizeMm} | {activeProduct.grade} |{" "}
                  {selectedVariant.color}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                  statusColor,
                )}
              >
                <span className="size-2 rounded-full bg-current" />
                {statusText}
              </span>
            </div>

            {/* Price Tiers */}
            <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                {t.priceTiers}
              </h3>
              <div className="mt-4 space-y-3">
                {selectedVariant.priceTiers.map((tier) => (
                  <div
                    key={tier.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600">{tier.label}</span>
                    <span className="text-right font-semibold text-slate-950">
                      {formatUsd(tier.priceUsd, {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        {t.perPiece}
                      </span>
                      <span className="block text-xs font-normal text-slate-400">
                        ≈ {formatInr(tier.priceUsd * usdInrRate)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variant Selector */}
            {activeProduct.variants.length > 1 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900">
                  {t.size}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      className={cn(
                        "rounded-md border px-4 py-2 text-sm font-medium transition",
                        selectedVariant.id === v.id
                          ? "border-[#003f4b] bg-[#003f4b] text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                      )}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.sizeMm}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-5">
              <SpecItem label={t.shape} value={activeProduct.shape} />
              <SpecItem
                label={t.color}
                value={selectedVariant.color}
              />
              <SpecItem
                label={t.size}
                value={selectedVariant.sizeMm}
              />
              <SpecItem label={t.grade} value={activeProduct.grade} />
              <SpecItem label={t.cut} value={activeProduct.cut} />
              <SpecItem
                label={t.clarity}
                value={selectedVariant.clarity}
              />
              <SpecItem
                label={t.origin}
                value={activeProduct.material}
              />
              <SpecItem label={t.sku} value={activeProduct.sku} />
            </div>

            {/* Action */}
            <div className="mt-6 flex items-center gap-4">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{t.moq}:</span>{" "}
                {selectedVariant.moq.toLocaleString()} pcs
              </div>
              <button
                type="button"
                onClick={addSelectedVariantToCart}
                className="ml-auto inline-flex h-12 items-center rounded-md bg-[#003f4b] px-6 text-sm font-semibold text-white transition hover:bg-[#005466]"
              >
                {t.addToCart}
              </button>
            </div>
          </div>
        </div>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "Product",
              name: activeProduct.nameEn,
              image: activeProduct.imagePath,
              description: `Cubic Zirconia ${activeProduct.shape} ${activeProduct.grade} grade, factory-direct wholesale.`,
              sku: activeProduct.sku,
              offers: {
                "@type": "AggregateOffer",
                lowPrice: Math.min(
                  ...selectedVariant.priceTiers.map((tier) => tier.priceUsd),
                ),
                highPrice: Math.max(
                  ...selectedVariant.priceTiers.map((tier) => tier.priceUsd),
                ),
                priceCurrency: "USD",
                offerCount: activeProduct.variants.length,
              },
            }),
          }}
        />

        {/* Trust Bar */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item.titleKey}
              className="flex gap-4 rounded-lg border border-slate-200 p-5"
            >
              <item.icon className="mt-0.5 size-6 shrink-0 text-[#003f4b]" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {t[item.titleKey]}
                </p>
                <p className="text-xs text-slate-500">{t[item.descKey]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
