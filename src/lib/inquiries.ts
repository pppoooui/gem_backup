import { z } from "zod";
import type { Locale } from "@/types/domain";

export const inquiryGrades = ["3A", "5A"] as const;
export const openInquiryEventName = "dfcgem:open-inquiry";

export const inquirySchema = z.object({
  contactName: z.string().trim().max(120).optional().default(""),
  quantity: z.coerce.number().int().positive().max(100_000_000),
  sizeMm: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^([1-9]|1[0-2])(?:\s?mm)?$/i, "Size must be between 1 and 12 mm"),
  grade: z.enum(inquiryGrades),
  email: z.string().trim().email().max(254),
  whatsapp: z
    .string()
    .trim()
    .min(7)
    .max(32)
    .regex(/^[+()\-\s0-9]+$/, "Enter a valid WhatsApp number"),
  notes: z.string().trim().max(2_000).optional().default(""),
  locale: z.enum(["en", "zh"] satisfies Locale[]),
  website: z.string().max(0).optional().default(""),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type AdminInquiry = {
  id: string;
  contactName: string;
  quantity: number;
  sizeMm: string;
  grade: (typeof inquiryGrades)[number];
  email: string;
  whatsapp: string;
  notes: string;
  locale: Locale;
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

export function normalizeInquirySize(sizeMm: string) {
  return `${sizeMm.trim().replace(/\s*mm$/i, "")} mm`;
}

export function toWhatsAppNumber(value: string) {
  const normalized = value.replace(/\D/g, "");
  return normalized.length >= 7 && normalized.length <= 15 ? normalized : "";
}

export function makeWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = toWhatsAppNumber(phone);
  if (!normalizedPhone) return null;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
