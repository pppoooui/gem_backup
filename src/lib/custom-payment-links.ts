import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type {
  CustomPaymentLink,
  CustomPaymentLinkStatus,
  Locale,
} from "@/types/domain";

export type CreateCustomPaymentLinkInput = {
  locale: Locale;
  title: string;
  specification: string;
  quantity: string;
  amountUsd: number;
  customerName?: string;
  customerWhatsApp?: string;
  note?: string;
  paymentUrl?: string;
  expiresAt?: string;
};

type PaymentLinkStore = Map<string, CustomPaymentLink>;

declare global {
  var __upgradeGemPaymentLinkStore: PaymentLinkStore | undefined;
}

function paymentLinkStore() {
  if (!globalThis.__upgradeGemPaymentLinkStore) {
    globalThis.__upgradeGemPaymentLinkStore = new Map();
  }
  return globalThis.__upgradeGemPaymentLinkStore;
}

function createSupabaseAdminClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function mapRow(row: Record<string, unknown>): CustomPaymentLink {
  return {
    id: String(row.id),
    token: String(row.public_token),
    locale: (row.locale === "zh" ? "zh" : "en") as Locale,
    title: String(row.title ?? ""),
    specification: String(row.specification ?? ""),
    quantity: String(row.quantity ?? ""),
    amountUsd: Number(row.amount_usd),
    customerName: row.customer_name ? String(row.customer_name) : undefined,
    customerWhatsApp: row.customer_whatsapp
      ? String(row.customer_whatsapp)
      : undefined,
    note: row.note ? String(row.note) : undefined,
    paymentUrl: row.payment_url ? String(row.payment_url) : undefined,
    status: String(row.status ?? "active") as CustomPaymentLinkStatus,
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    paymentSubmittedAt: row.payment_submitted_at
      ? String(row.payment_submitted_at)
      : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at ?? row.created_at),
  };
}

function isExpired(link: CustomPaymentLink) {
  return Boolean(
    link.expiresAt && new Date(link.expiresAt).getTime() < Date.now(),
  );
}

function withEffectiveStatus(link: CustomPaymentLink): CustomPaymentLink {
  return link.status === "active" && isExpired(link)
    ? { ...link, status: "expired" }
    : link;
}

export async function createCustomPaymentLink(
  input: CreateCustomPaymentLinkInput,
) {
  const now = new Date().toISOString();
  const token = randomBytes(24).toString("base64url");
  const fallback: CustomPaymentLink = {
    id: randomUUID(),
    token,
    ...input,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    paymentLinkStore().set(token, fallback);
    return fallback;
  }

  const { data, error } = await supabase
    .from("custom_payment_links")
    .insert({
      public_token: token,
      locale: input.locale,
      title: input.title,
      specification: input.specification,
      quantity: input.quantity,
      amount_usd: input.amountUsd,
      customer_name: input.customerName || null,
      customer_whatsapp: input.customerWhatsApp || null,
      note: input.note || null,
      payment_url: input.paymentUrl || null,
      expires_at: input.expiresAt || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV !== "production") {
      paymentLinkStore().set(token, fallback);
      return fallback;
    }
    throw new Error(error?.message ?? "Custom payment link could not be saved");
  }

  return mapRow(data);
}

export async function listCustomPaymentLinks() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return Array.from(paymentLinkStore().values())
      .map(withEffectiveStatus)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const { data, error } = await supabase
    .from("custom_payment_links")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      return Array.from(paymentLinkStore().values())
        .map(withEffectiveStatus)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    throw new Error(error.message);
  }

  return (data ?? []).map(mapRow).map(withEffectiveStatus);
}

export async function getCustomPaymentLinkByToken(token: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    const link = paymentLinkStore().get(token);
    return link ? withEffectiveStatus(link) : null;
  }

  const { data, error } = await supabase
    .from("custom_payment_links")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();

  if (error || !data) {
    const fallback = paymentLinkStore().get(token);
    return fallback ? withEffectiveStatus(fallback) : null;
  }

  return withEffectiveStatus(mapRow(data));
}

export async function updateCustomPaymentLinkStatus(
  id: string,
  status: CustomPaymentLinkStatus,
) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  if (!supabase) {
    const entry = Array.from(paymentLinkStore().entries()).find(
      ([, link]) => link.id === id,
    );
    if (!entry) return null;
    const updated = {
      ...entry[1],
      status,
      paymentSubmittedAt:
        status === "payment_submitted"
          ? entry[1].paymentSubmittedAt ?? now
          : entry[1].paymentSubmittedAt,
      updatedAt: now,
    };
    paymentLinkStore().set(entry[0], updated);
    return updated;
  }

  const update: Record<string, string> = {
    status,
    updated_at: now,
  };
  if (status === "payment_submitted") {
    update.payment_submitted_at = now;
  }

  const { data, error } = await supabase
    .from("custom_payment_links")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Payment link not found");
  }

  return mapRow(data);
}

export async function markCustomPaymentSubmitted(token: string) {
  const link = await getCustomPaymentLinkByToken(token);
  if (!link || link.status !== "active") return null;
  return updateCustomPaymentLinkStatus(link.id, "payment_submitted");
}
