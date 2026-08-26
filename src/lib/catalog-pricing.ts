/** Public 5A wholesale unit price for standard round white CZ. */
export function wholesaleUnitPriceUsd(sizeMm: string | number): number {
  const size = typeof sizeMm === "number" ? sizeMm : Number.parseFloat(sizeMm);

  if (!Number.isFinite(size) || size <= 0) return 0.1;
  if (size <= 1) return 0.1;
  if (size >= 12) return 0.4;

  // One distinct three-decimal price per listed size, increasing smoothly
  // from 1 mm (US$0.100) to 12 mm (US$0.400).
  return Math.round((0.1 + ((size - 1) / 11) * 0.3) * 1000) / 1000;
}
