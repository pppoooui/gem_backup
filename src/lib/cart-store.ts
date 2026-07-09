import type { CartLine } from "@/types/domain";

const CART_KEY = "upgrade-gem-cart";
const LEGACY_DEMO_CART: CartLine[] = [
  { productId: "prod-round-1", variantId: "round-1-1000", quantity: 1000 },
  { productId: "prod-round-125", variantId: "round-125-1000", quantity: 2000 },
  { productId: "prod-round-150", variantId: "round-150-1000", quantity: 3000 },
  { productId: "prod-round-200", variantId: "round-200-1000", quantity: 3000 },
  { productId: "prod-round-250", variantId: "round-250-1000", quantity: 3000 },
];

function isLegacyDemoCart(lines: CartLine[]) {
  return (
    lines.length === LEGACY_DEMO_CART.length &&
    lines.every((line, index) => {
      const legacyLine = LEGACY_DEMO_CART[index];
      return (
        line.productId === legacyLine.productId &&
        line.variantId === legacyLine.variantId &&
        line.quantity === legacyLine.quantity
      );
    })
  );
}

export function deserializeCartLines(raw: string): CartLine[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  const lines = parsed.filter(
    (item: unknown): item is CartLine =>
      typeof item === "object" &&
      item !== null &&
      "productId" in item &&
      typeof item.productId === "string" &&
      "variantId" in item &&
      typeof item.variantId === "string" &&
      "quantity" in item &&
      typeof item.quantity === "number" &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0,
  );

  return isLegacyDemoCart(lines) ? [] : lines;
}

export function getCartLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const lines = deserializeCartLines(raw);
    if (lines.length === 0) localStorage.removeItem(CART_KEY);
    return lines;
  } catch {
    return [];
  }
}

export function setCartLines(lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}
