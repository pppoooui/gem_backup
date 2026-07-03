"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usdInrRate } from "@/data/products";
import { clearCart, getCartLines, setCartLines } from "@/lib/cart-store";
import { formatInr, formatUsd } from "@/lib/utils";
import type { CartLine, Locale, Product } from "@/types/domain";
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";

const copy = {
  en: {
    title: "Shopping Cart",
    back: "Back to Products",
    empty: "Your cart is empty.",
    emptyCta: "Browse products",
    quantity: "Qty",
    unitPrice: "Unit price",
    subtotal: "Subtotal",
    shippingEstimate: "Shipping estimate",
    shippingNote: "Calculated at checkout",
    total: "Total",
    checkout: "Proceed to Checkout",
    clearCart: "Clear cart",
    remove: "Remove",
    moq: "MOQ",
    perPiece: "/pc",
  },
  zh: {
    title: "购物车",
    back: "返回商品列表",
    empty: "购物车是空的",
    emptyCta: "浏览商品",
    quantity: "数量",
    unitPrice: "单价",
    subtotal: "小计",
    shippingEstimate: "预估运费",
    shippingNote: "结账时计算",
    total: "合计",
    checkout: "去结算",
    clearCart: "清空购物车",
    remove: "删除",
    moq: "起订量",
    perPiece: "/颗",
  },
} satisfies Record<Locale, Record<string, string>>;

export default function CartPage({
  locale,
  products,
}: {
  locale: Locale;
  products: Product[];
}) {
  const t = copy[locale];

  const [cartLines, setCartLinesState] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setCartLinesState(getCartLines());
    setHydrated(true);
  }, []);

  const lines = useMemo(() => {
    return cartLines
      .map((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (!product) return null;
        const variant = product.variants.find(
          (v) => v.id === line.variantId,
        );
        if (!variant) return null;
        const tier =
          [...variant.priceTiers]
            .reverse()
            .find((t) => line.quantity >= t.minQuantity) ??
          variant.priceTiers[0];
        const lineTotal = tier.priceUsd * line.quantity;
        return {
          product,
          variant,
          quantity: line.quantity,
          unitPriceUsd: tier.priceUsd,
          lineTotalUsd: lineTotal,
        };
      })
      .filter(Boolean) as {
      product: (typeof products)[number];
      variant: (typeof products)[number]["variants"][number];
      quantity: number;
      unitPriceUsd: number;
      lineTotalUsd: number;
    }[];
  }, [cartLines, products]);

  function updateQuantity(productId: string, variantId: string, delta: number) {
    const updated = cartLines.map((l) => {
      if (l.productId === productId && l.variantId === variantId) {
        const newQty = l.quantity + delta;
        return newQty > 0 ? { ...l, quantity: newQty } : null;
      }
      return l;
    }).filter(Boolean) as CartLine[];
    setCartLines(updated);
    setCartLinesState(updated);
  }

  function removeLine(productId: string, variantId: string) {
    const updated = cartLines.filter(
      (l) => !(l.productId === productId && l.variantId === variantId),
    );
    setCartLines(updated);
    setCartLinesState(updated);
  }

  function clearAllCartLines() {
    clearCart();
    setCartLinesState([]);
  }

  const subtotalUsd = lines.reduce((sum, l) => sum + l.lineTotalUsd, 0);

  if (hydrated && lines.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <ShoppingCart className="size-12 text-slate-300" />
        <p className="mt-4 text-lg font-medium text-slate-700">{t.empty}</p>
        <Link
          href={`/${locale}/products`}
          className="mt-4 inline-flex h-10 items-center rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white transition hover:bg-[#005466]"
        >
          {t.emptyCta}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#003f4b]"
          >
            <ArrowLeft className="size-4" />
            {t.back}
          </Link>
          <h1 className="text-sm font-semibold text-slate-900">{t.title}</h1>
          {cartLines.length > 0 ? (
            <button
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={clearAllCartLines}
            >
              <Trash2 className="size-4" />
              {t.clearCart}
            </button>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <ul className="divide-y divide-slate-200">
          {lines.map((line) => (
            <li
              key={`${line.product.id}-${line.variant.id}`}
              className="flex gap-4 py-6"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-slate-950">
                <Image
                  src={line.product.imagePath}
                  alt={
                    locale === "en"
                      ? line.product.nameEn
                      : line.product.nameZh
                  }
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {locale === "en"
                        ? line.product.nameEn
                        : line.product.nameZh}
                    </p>
                    <p className="text-xs text-slate-500">
                      {line.variant.sizeMm} · {line.variant.color} · {line.product.grade}
                    </p>
                  </div>
                  <button
                    className="text-slate-300 hover:text-red-500 transition"
                    aria-label={t.remove}
                    onClick={() => removeLine(line.product.id, line.variant.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{t.unitPrice}: {formatUsd(line.unitPriceUsd, { minimumFractionDigits: 3 })} {t.perPiece}</span>
                  <span>{t.moq}: {line.variant.moq.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      className="flex size-7 items-center justify-center rounded border border-slate-300 text-slate-600 hover:border-slate-400 transition"
                      onClick={() => updateQuantity(line.product.id, line.variant.id, -line.variant.moq)}
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-sm font-medium text-slate-900 tabular-nums">
                      {line.quantity.toLocaleString()}
                    </span>
                    <button
                      className="flex size-7 items-center justify-center rounded border border-slate-300 text-slate-600 hover:border-slate-400 transition"
                      onClick={() => updateQuantity(line.product.id, line.variant.id, line.variant.moq)}
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-950 tabular-nums">
                    {formatUsd(line.lineTotalUsd)}
                    <span className="block text-xs font-normal text-slate-400">
                      ≈ {formatInr(line.lineTotalUsd * usdInrRate)}
                    </span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{t.subtotal}</span>
            <span className="font-semibold text-slate-950 tabular-nums">
              {formatUsd(subtotalUsd)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Truck className="size-4" />
              {t.shippingEstimate}
            </span>
            <span className="text-xs text-slate-400">{t.shippingNote}</span>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">
              {t.total}
            </span>
            <span className="text-lg font-bold text-slate-950 tabular-nums">
              {formatUsd(subtotalUsd)}
              <span className="block text-xs font-normal text-slate-400">
                ≈ {formatInr(subtotalUsd * usdInrRate)}
              </span>
            </span>
          </div>
          <Link
            href={`/${locale}/checkout`}
            className="mt-5 flex w-full h-11 items-center justify-center rounded-md bg-[#003f4b] text-sm font-semibold text-white transition hover:bg-[#005466]"
          >
            <Package className="mr-2 size-4" />
            {t.checkout}
          </Link>
        </div>
      </div>
    </main>
  );
}
