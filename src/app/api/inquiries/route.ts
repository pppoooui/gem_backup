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

    return NextResponse.json({ received: true, id: data.id }, { status: 201 });
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
