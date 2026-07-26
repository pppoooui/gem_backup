import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { inquirySchema, normalizeInquirySize } from "@/lib/inquiries";
import { consumeRateLimit } from "@/lib/rate-limit";

const MAX_INQUIRY_BODY_BYTES = 12 * 1024;
const INQUIRY_RATE_LIMIT = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
};

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
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

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_INQUIRY_BODY_BYTES) {
      return NextResponse.json({ error: "Inquiry request is too large" }, { status: 413 });
    }

    const rateLimit = consumeRateLimit(
      `inquiries:${getClientIp(request)}`,
      INQUIRY_RATE_LIMIT,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many inquiry attempts. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const input = inquirySchema.parse(await request.json());
    // Silently accept honeypot submissions without retaining spam records.
    if (input.website) return NextResponse.json({ received: true }, { status: 201 });

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Inquiry service is temporarily unavailable" },
        { status: 503 },
      );
    }

    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        contact_name: input.contactName,
        quantity: input.quantity,
        size_mm: normalizeInquirySize(input.sizeMm),
        grade: input.grade,
        email: input.email,
        whatsapp: input.whatsapp,
        notes: input.notes || null,
        locale: input.locale,
      })
      .select("id")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Inquiry could not be saved");

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: input.contactName || input.email,
        company_name: input.contactName || input.email,
        contact_name: input.contactName || input.email,
        whatsapp: input.whatsapp,
        email: input.email,
        country: input.country || "Unknown",
        city: input.city || null,
        pin_code: input.pinCode || null,
        shipping_address: input.addressLine1 || null,
      })
      .select("id")
      .single();
    if (customerError || !customer) throw new Error(customerError?.message ?? "Customer could not be saved");

    const token = randomBytes(24).toString("base64url");
    const secureTokenHash = createHash("sha256").update(token).digest("hex");
    const { data: orderNo, error: orderNumberError } = await supabase.rpc("next_order_number");
    if (orderNumberError || typeof orderNo !== "string") throw new Error(orderNumberError?.message ?? "Order number unavailable");
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_no: orderNo,
        customer_id: customer.id,
        locale: input.locale,
        status: "pending_quote",
        subtotal_usd: 0,
        total_usd: 0,
        selected_payment_provider: "manual",
        secure_token_hash: secureTokenHash,
        buyer_note: `Inquiry ${data.id}: ${input.sizeMm}, ${input.grade}, Round, White`,
      })
      .select("id, order_no")
      .single();
    if (orderError || !order) throw new Error(orderError?.message ?? "Quote order could not be saved");
    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_name_en: "Round White Cubic Zirconia",
      product_name_zh: "圆形白色立方氧化锆",
      size_mm: normalizeInquirySize(input.sizeMm),
      color: "White",
      grade: input.grade,
      package_unit: "1,000 pcs",
      quantity: input.quantity,
      price_usd: 0,
      line_total_usd: 0,
    });
    if (itemError) console.error("[inquiries] quote line could not be saved", itemError);

    return NextResponse.json({ received: true, id: data.id, orderNo: order.order_no, token }, { status: 201 });
  } catch (error) {
    const message = error instanceof ZodError
      ? error.issues.map((issue) => issue.message).join("; ")
      : error instanceof Error
        ? error.message
        : "Unable to send inquiry";
    if (!(error instanceof ZodError)) console.error("[inquiries] create failed", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
