import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

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

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  name: z.string().min(1).optional(),
  display_instructions_en: z.string().optional(),
  display_instructions_zh: z.string().optional(),
  sort_order: z.number().int().min(0).optional(),
  min_amount_usd: z.number().min(0).optional(),
});

/**
 * PATCH /api/admin/payment-methods/[id]
 * Update a payment method's enabled status, name, instructions, sort order, or min amount.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "未配置 Supabase 后台权限" },
        { status: 503 },
      );
    }

    const { id } = await params;
    const input = updateSchema.parse(await request.json());

    const { data, error } = await supabase
      .from("payment_methods")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ method: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "输入内容无效" },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
