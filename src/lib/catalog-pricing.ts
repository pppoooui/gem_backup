/**
 * Public 5A wholesale unit prices for the standard round white CZ catalog.
 * Prices are intentionally grouped into easy-to-maintain size bands.
 */
export function wholesaleUnitPriceUsd(sizeMm: string | number): number {
  const size = typeof sizeMm === "number" ? sizeMm : Number.parseFloat(sizeMm);

  if (!Number.isFinite(size) || size <= 0) return 0.1;
  if (size < 2) return 0.1;
  if (size < 3) return 0.12;
  if (size < 4) return 0.15;
  if (size < 5) return 0.18;
  if (size < 6) return 0.22;
  if (size < 7) return 0.26;
  if (size < 8) return 0.3;
  if (size < 9) return 0.33;
  if (size < 10) return 0.35;
  if (size < 11) return 0.37;
  return 0.4;
}
