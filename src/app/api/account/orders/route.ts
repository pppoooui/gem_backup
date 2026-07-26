import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ orders: [] });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await admin
    .from("orders")
    .select("order_no,status,total_usd,created_at,customers!inner(email)")
    .eq("customers.email", user.email)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[account/orders] lookup failed", error);
    return NextResponse.json({ error: "订单读取失败" }, { status: 500 });
  }

  return NextResponse.json({
    orders: (data ?? []).map((order) => ({
      orderNo: order.order_no,
      status: order.status,
      totalUsd: Number(order.total_usd),
      createdAt: order.created_at,
    })),
  });
}
