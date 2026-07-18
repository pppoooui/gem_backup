import "server-only";

import { createClient } from "@supabase/supabase-js";
import { isEnabledSetting } from "@/lib/site-settings";

export type StorefrontSettings = {
  showHistory: boolean;
  showRecognition: boolean;
  showProductDetails: boolean;
  showPrices: boolean;
  whatsappNumber: string;
};

const storefrontSettingKeys = [
  "whatsapp_number",
  "home_show_history",
  "home_show_recognition",
  "catalog_show_product_details",
  "catalog_show_prices",
] as const;

function defaultStorefrontSettings(): StorefrontSettings {
  return {
    showHistory: false,
    showRecognition: false,
    showProductDetails: false,
    showPrices: false,
    whatsappNumber: process.env.WHATSAPP_VENDOR_PHONE_NUMBER?.trim() ?? "",
  };
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

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  const defaults = defaultStorefrontSettings();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return defaults;

  const { data, error } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", storefrontSettingKeys);

  if (error || !data) return defaults;

  const values = new Map(data.map((setting) => [setting.key, setting.value]));
  const configuredWhatsApp = values.get("whatsapp_number")?.trim();

  const showProductDetails = isEnabledSetting(
    values.get("catalog_show_product_details"),
  );

  return {
    showHistory: isEnabledSetting(values.get("home_show_history")),
    showRecognition: isEnabledSetting(values.get("home_show_recognition")),
    showProductDetails,
    showPrices: showProductDetails && isEnabledSetting(values.get("catalog_show_prices")),
    whatsappNumber: configuredWhatsApp || defaults.whatsappNumber,
  };
}
