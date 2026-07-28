import "server-only";

import { createHash, randomBytes, randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const customerSessionCookie = "dfc_customer_session";

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

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeContactPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? digits : null;
}

export async function startWhatsAppLogin(phoneInput: string) {
  const phone = normalizeContactPhone(phoneInput);
  const supabase = adminClient();
  if (!phone || !supabase) throw new Error("Login service unavailable");

  const challenge = randomBytes(24).toString("base64url");
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const { error } = await supabase.from("customer_login_codes").insert({
    challenge_hash: hash(challenge),
    phone,
    code_hash: hash(`${challenge}:${code}`),
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (error) throw new Error(error.message);

  const webhook = process.env.WHATSAPP_LOGIN_WEBHOOK_URL?.trim();
  const phoneId = process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID?.trim();
  const cloudToken = process.env.WHATSAPP_CLOUD_API_TOKEN?.trim();
  let response: Response | null = null;

  if (webhook) {
    response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, purpose: "customer_login" }),
    });
  } else if (phoneId && cloudToken) {
    response = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cloudToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: `DFC login code: ${code}. It expires in 10 minutes.` },
      }),
    });
  }

  if (!response?.ok) {
    await supabase
      .from("customer_login_codes")
      .delete()
      .eq("challenge_hash", hash(challenge));
    throw new Error("WhatsApp login delivery is not configured");
  }
  return { challenge };
}

export async function verifyWhatsAppLogin(challenge: string, code: string) {
  const supabase = adminClient();
  if (!supabase) throw new Error("Login service unavailable");
  const challengeHash = hash(challenge);
  const { data } = await supabase
    .from("customer_login_codes")
    .select("id,phone,code_hash,attempts,expires_at,used_at")
    .eq("challenge_hash", challengeHash)
    .maybeSingle();
  if (
    !data ||
    data.used_at ||
    data.attempts >= 5 ||
    new Date(data.expires_at).getTime() < Date.now()
  ) {
    throw new Error("Verification code expired");
  }
  if (data.code_hash !== hash(`${challenge}:${code}`)) {
    await supabase
      .from("customer_login_codes")
      .update({ attempts: data.attempts + 1 })
      .eq("id", data.id);
    throw new Error("Incorrect verification code");
  }
  await supabase
    .from("customer_login_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", data.id);
  return createCustomerSession({
    provider: "whatsapp",
    providerUserId: data.phone,
    phone: data.phone,
    displayName: `+${data.phone}`,
  });
}

export async function createCustomerSession(input: {
  provider: "whatsapp" | "line";
  providerUserId: string;
  displayName?: string;
  email?: string;
  phone?: string;
}) {
  const supabase = adminClient();
  if (!supabase) throw new Error("Login service unavailable");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const { error } = await supabase.from("customer_contact_sessions").insert({
    session_hash: hash(token),
    provider: input.provider,
    provider_user_id: input.providerUserId,
    display_name: input.displayName || null,
    email: input.email || null,
    phone: input.phone || null,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error(error.message);
  return { token, expiresAt };
}

export async function resolveCustomerSession(token?: string) {
  const supabase = adminClient();
  if (!supabase || !token) return null;
  const { data } = await supabase
    .from("customer_contact_sessions")
    .select("provider,provider_user_id,display_name,email,phone,expires_at")
    .eq("session_hash", hash(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data;
}

export async function deleteCustomerSession(token?: string) {
  const supabase = adminClient();
  if (!supabase || !token) return;
  await supabase
    .from("customer_contact_sessions")
    .delete()
    .eq("session_hash", hash(token));
}

export async function linkOrderCustomerIdentity(
  orderNo: string,
  session: {
    provider: string;
    provider_user_id: string;
  } | null,
) {
  if (session?.provider !== "line") return;
  const supabase = adminClient();
  if (!supabase) return;
  const { data: order } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (!order?.customer_id) return;
  await supabase
    .from("customers")
    .update({ line_user_id: session.provider_user_id })
    .eq("id", order.customer_id);
}
