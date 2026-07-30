import "server-only";

import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export type OrderMessage = {
  id: string;
  senderRole: "customer" | "admin";
  senderName: string;
  message: string;
  createdAt: string;
};

function adminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function resolveOrderId(orderNo: string, token?: string) {
  const supabase = adminClient();
  if (!supabase) return null;
  let query = supabase.from("orders").select("id,status").eq("order_no", orderNo);
  if (token) query = query.eq("secure_token_hash", hashToken(token));
  const { data } = await query.maybeSingle();
  return data ?? null;
}

export async function listOrderMessages(orderId: string): Promise<OrderMessage[]> {
  const supabase = adminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("order_messages")
    .select("id,sender_role,sender_name,message,created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({
    id: item.id,
    senderRole: item.sender_role,
    senderName: item.sender_name,
    message: item.message,
    createdAt: item.created_at,
  }));
}

export async function addOrderMessage(input: {
  orderId: string;
  senderRole: "customer" | "admin";
  senderName: string;
  message: string;
}) {
  const supabase = adminClient();
  if (!supabase) throw new Error("Chat service unavailable");
  const { error } = await supabase.from("order_messages").insert({
    order_id: input.orderId,
    sender_role: input.senderRole,
    sender_name: input.senderName,
    message: input.message,
  });
  if (error) throw new Error(error.message);
}

export async function markPaymentSubmitted(orderId: string) {
  const supabase = adminClient();
  if (!supabase) throw new Error("Order service unavailable");
  const { error } = await supabase
    .from("orders")
    .update({ status: "payment_submitted" })
    .eq("id", orderId)
    .eq("status", "awaiting_payment");
  if (error) throw new Error(error.message);
}

export async function markRefundRequested(orderId: string, reason: string) {
  const supabase = adminClient();
  if (!supabase) throw new Error("Order service unavailable");
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "refund_requested",
      refund_reason: reason,
      refund_requested_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .in("status", ["paid", "production", "packing", "in_transit", "delivered"])
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Order is not eligible for a refund request");
}
