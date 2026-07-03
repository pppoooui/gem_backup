import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number, options?: Intl.NumberFormatOptions) {
  const minimumFractionDigits = options?.minimumFractionDigits;
  const requestedMaximumFractionDigits = options?.maximumFractionDigits ?? 2;
  const maximumFractionDigits =
    minimumFractionDigits === undefined
      ? requestedMaximumFractionDigits
      : Math.max(requestedMaximumFractionDigits, minimumFractionDigits);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    ...options,
    maximumFractionDigits,
  }).format(value);
}

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
