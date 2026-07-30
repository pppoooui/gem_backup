"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, MessageCircle, Smartphone, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/types/domain";

type AccountOrder = {
  orderNo: string;
  status: string;
  totalUsd: number;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  pending_quote: "待报价",
  awaiting_payment: "待付款",
  payment_submitted: "已提交付款",
  refund_requested: "退款待审核",
  refunded: "已同意退款",
  paid: "已付款",
  production: "生产中",
  packing: "包装中",
  in_transit: "运输中",
  delivered: "已签收",
  processing: "处理中",
  shipped: "已发货",
  cancelled: "已取消",
};

export default function AccountPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [contactIdentity, setContactIdentity] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("");
  const [whatsappChallenge, setWhatsappChallenge] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void params.then(({ locale: nextLocale }) => setLocale(nextLocale));
  }, [params]);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
        void loadOrders();
        return;
      }
      const response = await fetch("/api/auth/contact/session", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json() as {
        session?: {
          provider?: string;
          display_name?: string;
          phone?: string;
        } | null;
      };
      if (payload.session) {
        setContactIdentity(
          payload.session.display_name ||
            payload.session.phone ||
            payload.session.provider ||
            "",
        );
        void loadOrders();
      }
    });
  }, []);

  async function loadOrders() {
    const response = await fetch("/api/account/orders");
    if (!response.ok) return;
    const data = (await response.json()) as { orders?: AccountOrder[] };
    setOrders(data.orders ?? []);
  }

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "register") {
      setMessage("注册成功，请检查邮箱完成验证后登录。");
    } else {
      setUserEmail(email);
      await loadOrders();
    }
    setBusy(false);
  }

  async function signOut() {
    await createClient().auth.signOut();
    await fetch("/api/auth/contact/session", { method: "DELETE" });
    setUserEmail("");
    setContactIdentity("");
    setOrders([]);
  }

  async function startWhatsAppAuth() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/auth/whatsapp/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: whatsappPhone }),
    });
    const payload = await response.json() as { challenge?: string; error?: string };
    setBusy(false);
    if (!response.ok || !payload.challenge) {
      setMessage(payload.error || (locale === "zh" ? "WhatsApp 登录暂不可用。" : "WhatsApp login is unavailable."));
      return;
    }
    setWhatsappChallenge(payload.challenge);
    setMessage(locale === "zh" ? "验证码已发送到 WhatsApp，10 分钟内有效。" : "A verification code was sent to WhatsApp and expires in 10 minutes.");
  }

  async function verifyWhatsAppAuth() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/auth/whatsapp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challenge: whatsappChallenge,
        code: whatsappCode,
      }),
    });
    const payload = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.error || (locale === "zh" ? "验证码错误。" : "Incorrect code."));
      return;
    }
    setContactIdentity(whatsappPhone);
    await loadOrders();
  }

  const isZh = locale === "zh";
  const isSignedIn = Boolean(userEmail || contactIdentity);
  return (
    <main className="min-h-screen bg-[#f7f9f8] px-4 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <Link href={`/${locale}/products`} className="text-sm font-semibold text-[#005466]">
          {isZh ? "返回商城" : "Back to products"}
        </Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">{isZh ? "客户账号" : "Customer account"}</h1>
            {isSignedIn ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-slate-600">{userEmail || contactIdentity}</p>
                <button onClick={signOut} className="h-10 border border-slate-200 px-4 text-sm font-semibold">
                  {isZh ? "退出登录" : "Sign out"}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => setMode("login")} className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-[#003f4b] text-white" : "border border-slate-200"}`}>
                    <LogIn className="size-4" /> {isZh ? "登录" : "Sign in"}
                  </button>
                  <button onClick={() => setMode("register")} className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-[#003f4b] text-white" : "border border-slate-200"}`}>
                    <UserPlus className="size-4" /> {isZh ? "注册" : "Register"}
                  </button>
                </div>
                <form className="mt-5 space-y-4" onSubmit={submitAuth}>
                  <input className="h-11 w-full border border-slate-200 px-3 text-sm" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  <input className="h-11 w-full border border-slate-200 px-3 text-sm" type="password" minLength={6} placeholder={isZh ? "密码（至少 6 位）" : "Password (6+ characters)"} value={password} onChange={(event) => setPassword(event.target.value)} required />
                  <button className="h-11 w-full bg-[#003f4b] text-sm font-semibold text-white disabled:bg-slate-300" disabled={busy}>
                    {busy ? "..." : mode === "login" ? (isZh ? "登录" : "Sign in") : (isZh ? "注册" : "Register")}
                  </button>
                </form>
                <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  {isZh ? "或使用社交账号" : "or use a social account"}
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="space-y-3">
                  {!whatsappChallenge ? (
                    <div className="flex gap-2">
                      <input
                        value={whatsappPhone}
                        onChange={(event) => setWhatsappPhone(event.target.value)}
                        placeholder={isZh ? "WhatsApp 号码（含国家码）" : "WhatsApp number with country code"}
                        className="h-11 min-w-0 flex-1 border border-slate-200 px-3 text-sm"
                      />
                      <button type="button" disabled={busy || whatsappPhone.length < 7} onClick={startWhatsAppAuth} className="inline-flex h-11 items-center gap-2 bg-[#25d366] px-3 text-sm font-semibold text-white disabled:bg-slate-300">
                        <MessageCircle className="size-4" />
                        WhatsApp
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={whatsappCode}
                        onChange={(event) => setWhatsappCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        placeholder={isZh ? "6 位验证码" : "6-digit code"}
                        className="h-11 min-w-0 flex-1 border border-slate-200 px-3 text-sm"
                      />
                      <button type="button" disabled={busy || whatsappCode.length !== 6} onClick={verifyWhatsAppAuth} className="h-11 bg-[#25d366] px-4 text-sm font-semibold text-white disabled:bg-slate-300">
                        {isZh ? "验证登录" : "Verify"}
                      </button>
                    </div>
                  )}
                  <a href={`/api/auth/line/start?locale=${locale}`} className="flex h-11 w-full items-center justify-center gap-2 bg-[#06c755] text-sm font-semibold text-white">
                    <Smartphone className="size-4" />
                    {isZh ? "使用 LINE 账号登录" : "Continue with LINE"}
                  </a>
                </div>
                {message && <p className="mt-4 text-sm text-[#005466]">{message}</p>}
              </>
            )}
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{isZh ? "我的订单" : "My orders"}</h2>
            {!isSignedIn ? (
              <p className="mt-4 text-sm text-slate-500">{isZh ? "登录后查看订单。" : "Sign in to view your orders."}</p>
            ) : orders.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{isZh ? "暂时没有关联订单。" : "No orders found for this account."}</p>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order.orderNo} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-semibold">{order.orderNo}</p>
                      <p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{statusLabels[order.status] ?? order.status}</p>
                      {order.totalUsd > 0 && <p className="text-sm text-slate-500">USD {order.totalUsd.toFixed(2)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
