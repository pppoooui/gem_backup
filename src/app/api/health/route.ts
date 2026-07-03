import { NextResponse } from "next/server";
import { usdInrRate } from "@/data/products";
import { getEnabledPaymentMethods } from "@/lib/payment-methods";
import { getPublishedProducts } from "@/lib/products-supabase";

async function checkSupabaseConnectivity(): Promise<{
  status: "ok" | "warn" | "error";
  detail: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { status: "warn", detail: "Missing env vars" };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url}/rest/v1/payment_methods?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok || res.status === 200) {
      return { status: "ok", detail: "Connected" };
    }
    return { status: "error", detail: `HTTP ${res.status}` };
  } catch {
    return { status: "error", detail: "Unreachable" };
  }
}

async function checkProductImageBucket(): Promise<{
  status: "ok" | "warn" | "error";
  provider: string;
  bucket: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET ?? "product-images";

  if (!url || !serviceRoleKey) {
    return { status: "warn", provider: "supabase-storage", bucket };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    return {
      status: res.ok ? "ok" : "warn",
      provider: "supabase-storage",
      bucket,
    };
  } catch {
    return { status: "warn", provider: "supabase-storage", bucket };
  }
}

export async function GET() {
  const waConfigured = Boolean(
    (process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_CLOUD_API_TOKEN &&
      process.env.WHATSAPP_VENDOR_PHONE_NUMBER) ||
      process.env.WHATSAPP_NOTIFY_WEBHOOK_URL,
  );

  const supabaseCheck = await checkSupabaseConnectivity();
  const [enabledPaymentMethods, publishedProducts, storageCheck] = await Promise.all([
    getEnabledPaymentMethods(),
    getPublishedProducts(),
    checkProductImageBucket(),
  ]);

  const checks = {
    homepage: { status: "ok", path: "/en" },
    products: {
      status: publishedProducts.length > 0 ? "ok" : "error",
      count: publishedProducts.length,
    },
    supabase: supabaseCheck,
    storage: storageCheck,
    whatsapp: {
      status: waConfigured ? "ok" : "warn",
      configured: waConfigured,
    },
    exchangeRate: {
      status: usdInrRate > 0 ? "ok" : "error",
      pair: "USD/INR",
      rate: usdInrRate,
    },
    paymentMethods: {
      status: enabledPaymentMethods.length > 0 ? "ok" : "error",
      enabled: enabledPaymentMethods.length,
    },
  } as const;

  const allNormal = Object.values(checks).every(
    (check) => check.status === "ok",
  );

  return NextResponse.json({
    allNormal,
    checkedAt: new Date().toISOString(),
    deploymentRegion: process.env.VERCEL_REGION ?? "local",
    checks,
  });
}
