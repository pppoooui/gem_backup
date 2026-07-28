import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  customerSessionCookie,
  resolveCustomerSession,
} from "@/lib/customer-contact-auth";

export async function GET() {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  const contactToken = (await cookies()).get(customerSessionCookie)?.value;
  const contactSession = await resolveCustomerSession(contactToken);
  const accountEmail = user?.email || contactSession?.email || "";
  const accountPhone = contactSession?.phone || "";
  const lineUserId =
    contactSession?.provider === "line"
      ? contactSession.provider_user_id
      : "";

  if (!accountEmail && !accountPhone && !lineUserId) {
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
  let query = admin
    .from("orders")
    .select("order_no,status,total_usd,created_at,customers!inner(email,whatsapp_normalized,line_user_id)")
    .order("created_at", { ascending: false })
    .limit(50);
  query = accountEmail
    ? query.eq("customers.email", accountEmail)
    : accountPhone
      ? query.eq("customers.whatsapp_normalized", accountPhone)
      : query.eq("customers.line_user_id", lineUserId);
  const { data, error } = await query;

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
