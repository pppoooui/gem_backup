import "server-only";

import { createClient } from "@supabase/supabase-js";
import { paymentMethods as fallbackPaymentMethods } from "@/data/products";
import type { PaymentMethod, PaymentProvider } from "@/types/domain";

const paymentProviders = new Set<PaymentProvider>([
  "xtransfer",
  "worldfirst",
  "airwallex",
  "wise",
  "bank_transfer",
  "manual",
]);

function hasSupabasePublicConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function createSupabasePublicClient() {
  if (!hasSupabasePublicConfig()) return null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function createSupabaseAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

type PaymentMethodRow = {
  id: string;
  provider: string;
  name: string;
  enabled: boolean | null;
  currencies: string[] | null;
  countries: string[] | null;
  min_amount_usd: number | null;
};

function mapPaymentMethods(data: PaymentMethodRow[]) {
  return data
    .filter((item) => paymentProviders.has(item.provider as PaymentProvider))
    .map((item) => ({
      id: item.id,
      provider: item.provider as PaymentProvider,
      name: item.name,
      enabled: Boolean(item.enabled),
      currencies: item.currencies ?? ["USD"],
      countries: item.countries ?? ["Global"],
      minAmountUsd: item.min_amount_usd ?? undefined,
    }));
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return fallbackPaymentMethods;

  const { data, error } = await supabase
    .from("payment_methods")
    .select("id,provider,name,enabled,currencies,countries,min_amount_usd,sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[supabase] payment methods fetch failed, using static fallback", error?.message);
    return fallbackPaymentMethods;
  }

  const methods = mapPaymentMethods(data);

  return methods.length > 0 ? methods : fallbackPaymentMethods;
}

export async function getEnabledPaymentMethods() {
  return (await getPaymentMethods()).filter((method) => method.enabled);
}

export async function getAdminPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = createSupabaseAdminClient() ?? createSupabasePublicClient();
  if (!supabase) return fallbackPaymentMethods;

  const { data, error } = await supabase
    .from("payment_methods")
    .select("id,provider,name,enabled,currencies,countries,min_amount_usd,sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.warn("[supabase] admin payment methods fetch failed, using static fallback", error?.message);
    return fallbackPaymentMethods;
  }

  const methods = mapPaymentMethods(data);
  return methods.length > 0 ? methods : fallbackPaymentMethods;
}
