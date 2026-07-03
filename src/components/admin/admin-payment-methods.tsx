"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CircleDollarSign, Loader2, RefreshCw } from "lucide-react";

type PaymentMethod = {
  id: string;
  provider: string;
  name: string;
  enabled: boolean;
  currencies: string[];
  countries: string[];
  min_amount_usd: number | null;
  display_instructions_en: string;
  display_instructions_zh: string;
  sort_order: number;
  bank_accounts: BankAccount[];
};

type BankAccount = {
  id: string;
  payment_method_id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  swift_code?: string;
  bank_address?: string;
  intermediary_bank?: string;
  currency: string;
  fee_bearer?: string;
};

export function AdminPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState<Set<string>>(new Set());

  async function fetchMethods() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/payment-methods");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "加载失败");
      setMethods(data.methods ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time data fetch on mount
    void fetchMethods();
  }, []);

  async function toggleEnabled(methodId: string, current: boolean) {
    setSaving((prev) => new Set(prev).add(methodId));
    setStatusMessage("");
    try {
      const res = await fetch(`/api/admin/payment-methods/${methodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存失败");
      setMethods((prev) =>
        prev.map((m) =>
          m.id === methodId ? { ...m, enabled: !current } : m,
        ),
      );
      setStatusMessage("收款方式已更新。");
    } catch (e) {
      setStatusMessage(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(methodId);
        return next;
      });
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-5 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        正在加载收款方式...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-sm text-red-600">
        <p>{error}</p>
        <button
          onClick={() => void fetchMethods()}
          className="mt-2 inline-flex items-center gap-1.5 text-[#003f4b] underline"
        >
          <RefreshCw className="size-3.5" />
          重试
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="font-semibold">收款方式</h2>
          <p className="mt-1 text-sm text-slate-500">
            控制结账页展示哪些收款方式，并查看付款说明。
          </p>
        </div>
        <button
          onClick={() => void fetchMethods()}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium hover:bg-slate-200"
        >
          <RefreshCw className="size-3.5" />
          刷新
        </button>
      </div>
      {statusMessage && (
        <p className="border-b border-slate-100 px-5 py-3 text-sm font-medium text-[#005466]">
          {statusMessage}
        </p>
      )}

      <div className="divide-y divide-slate-100">
        {methods.map((method) => {
          const isExpanded = expanded.has(method.id);
          const isSaving = saving.has(method.id);

          return (
            <div key={method.id}>
              <div className="flex items-center gap-4 p-4">
                {/* Enabled toggle */}
                <button
                  onClick={() => toggleEnabled(method.id, method.enabled)}
                  disabled={isSaving}
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                    method.enabled ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`size-5 rounded-full bg-white shadow transition ${
                      method.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                      {method.provider}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {method.currencies.join(", ")} · 最低{" "}
                    {method.min_amount_usd == null
                      ? "未设置"
                      : `$${method.min_amount_usd}`}
                    {" "}
                    · {method.countries.join(", ")}
                  </p>
                </div>

                <span className="text-xs text-slate-400">
                  #{method.sort_order}
                </span>

                <button
                  onClick={() => toggleExpand(method.id)}
                  className="shrink-0 rounded p-1 hover:bg-slate-100"
                >
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Expanded: instructions + bank accounts */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-4 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-slate-700">
                        英文付款说明
                      </p>
                      <p className="whitespace-pre-wrap text-slate-600">
                        {method.display_instructions_en || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-slate-700">
                        中文付款说明
                      </p>
                      <p className="whitespace-pre-wrap text-slate-600">
                        {method.display_instructions_zh || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Bank accounts */}
                  {method.bank_accounts.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 font-medium text-slate-700">
                        收款账户（{method.bank_accounts.length}）
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {method.bank_accounts.map((account) => (
                          <div
                            key={account.id}
                            className="rounded-md border border-slate-200 bg-white p-3"
                          >
                            <div className="flex items-center gap-2">
                              <CircleDollarSign className="size-4 text-emerald-600" />
                              <span className="font-medium">
                                {account.bank_name}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {account.account_name} · {account.account_number}
                            </p>
                            {account.swift_code && (
                              <p className="text-xs text-slate-500">
                                SWIFT: {account.swift_code}
                              </p>
                            )}
                            {account.bank_address && (
                              <p className="text-xs text-slate-500">
                                {account.bank_address}
                              </p>
                            )}
                            {account.intermediary_bank && (
                              <p className="text-xs text-slate-500">
                                中转行：{account.intermediary_bank}
                              </p>
                            )}
                            <p className="text-xs text-slate-400">
                              {account.currency}
                              {account.fee_bearer
                                ? ` · 费用承担：${account.fee_bearer}`
                                : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {methods.length === 0 && (
          <div className="p-5 text-sm text-slate-500">
            暂未找到收款方式，请先运行种子 SQL。
          </div>
        )}
      </div>
    </section>
  );
}
