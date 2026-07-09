"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("缺少 Supabase 前台环境变量。");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "邮箱或密码错误。"
            : "登录失败，请检查账号后重试。",
        );
        setIsLoading(false);
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .single();

      if (adminError || !adminData) {
        setError("这个账号没有后台权限。");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      router.push("/admin");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "登录失败，请稍后重试。",
      );
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fa] px-4">
      <section className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-2xl font-semibold text-[#002b35]">
          DFC Cubic Zirconia Factory 后台
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          请使用管理员账号登录。
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">邮箱</span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[#005466] focus:ring-4 focus:ring-cyan-950/5"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@dfccz.top"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">密码</span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[#005466] focus:ring-4 focus:ring-cyan-950/5"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="grid h-11 w-full place-items-center rounded-md bg-[#003f4b] text-sm font-semibold text-white transition hover:bg-[#005466] disabled:cursor-wait disabled:bg-slate-300"
            disabled={isLoading}
          >
            {isLoading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
          仅限 DFC Cubic Zirconia Factory 内部运营人员使用。
        </p>
      </section>
    </main>
  );
}
