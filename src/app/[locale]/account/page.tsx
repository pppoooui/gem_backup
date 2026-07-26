"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
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
  paid: "已付款",
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
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void params.then(({ locale: nextLocale }) => setLocale(nextLocale));
  }, [params]);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
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
    setUserEmail("");
    setOrders([]);
  }

  const isZh = locale === "zh";
  return (
    <main className="min-h-screen bg-[#f7f9f8] px-4 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <Link href={`/${locale}/products`} className="text-sm font-semibold text-[#005466]">
          {isZh ? "返回商城" : "Back to products"}
        </Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">{isZh ? "客户账号" : "Customer account"}</h1>
            {userEmail ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-slate-600">{userEmail}</p>
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
                {message && <p className="mt-4 text-sm text-[#005466]">{message}</p>}
              </>
            )}
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{isZh ? "我的订单" : "My orders"}</h2>
            {!userEmail ? (
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
