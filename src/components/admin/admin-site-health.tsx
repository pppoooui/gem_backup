"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from "lucide-react";

type HealthItem = {
  label: string;
  status: "ok" | "warn" | "error";
  detail: string;
};

type HealthPayload = {
  allNormal: boolean;
  checkedAt: string;
  deploymentRegion: string;
  checks: Record<string, { status: string; [key: string]: unknown }>;
};

function buildChecksFromApi(payload: HealthPayload): HealthItem[] {
  const checks = payload.checks;
  const results: HealthItem[] = [];

  // 1. Homepage
  results.push({
    label: "首页",
    status: (checks.homepage?.status as HealthItem["status"]) ?? "error",
    detail: checks.homepage?.status === "ok" ? "可访问" : "无法访问",
  });

  // 2. Products
  const productCount = (checks.products as { count?: number })?.count ?? 0;
  results.push({
    label: "商品",
    status:
      checks.products?.status === "ok" ? "ok" : ("warn" as HealthItem["status"]),
    detail: productCount > 0 ? `${productCount} 个商品` : "没有商品",
  });

  // 3. Supabase connectivity
  results.push({
    label: "Supabase",
    status: (checks.supabase?.status as HealthItem["status"]) ?? "warn",
    detail:
      checks.supabase?.status === "ok" ? "已连接" : "检查环境变量",
  });

  // 4. Storage
  results.push({
    label: "存储",
    status: (checks.storage?.status as HealthItem["status"]) ?? "warn",
    detail:
      typeof checks.storage === "object"
        ? ((checks.storage as { provider?: string }).provider ?? "未知")
        : "未知",
  });

  // 5. WhatsApp
  const waConfigured =
    (checks.whatsapp as { configured?: boolean })?.configured ?? false;
  results.push({
    label: "WhatsApp",
    status: waConfigured ? "ok" : "warn",
    detail: waConfigured ? "已配置" : "需要配置环境变量",
  });

  // 6. Exchange Rate
  const rate = (checks.exchangeRate as { rate?: number })?.rate;
  results.push({
    label: "汇率",
    status: checks.exchangeRate?.status === "ok" ? "ok" : "error",
    detail: rate ? `USD/INR ${rate}` : "缺少汇率",
  });

  // 7. Payment Methods
  const enabledCount =
    (checks.paymentMethods as { enabled?: number })?.enabled ?? 0;
  results.push({
    label: "收款方式",
    status:
      enabledCount >= 1
        ? "ok"
        : ("error" as HealthItem["status"]),
    detail: `已启用 ${enabledCount} 个`,
  });

  // 8. Region / Deployment
  results.push({
    label: "部署区域",
    status: "ok",
    detail: payload.deploymentRegion ?? "local",
  });

  return results;
}

export function AdminSiteHealth() {
  const [items, setItems] = useState<HealthItem[]>([]);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health");
      if (!res.ok) {
        setError(`API 返回 ${res.status}`);
        setLoading(false);
        return;
      }
      const payload = (await res.json()) as HealthPayload;
      setItems(buildChecksFromApi(payload));
      setLastCheck(payload.checkedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time health check on mount
    fetchHealth();
  }, [fetchHealth]);

  const okCount = items.filter((i) => i.status === "ok").length;
  const warnCount = items.filter((i) => i.status === "warn").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">网站状态</h2>
          <p className="mt-1 text-sm text-slate-500">
            只做检查，不自动修改线上配置。
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#005466] disabled:opacity-50"
          title="重新检查"
        >
          <RefreshCw className={loading ? "animate-spin size-4" : "size-4"} />
        </button>
      </div>

      {/* Summary row */}
      {items.length > 0 && (
        <div className="mb-3 flex gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            {okCount} 正常
          </span>
          {warnCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="size-3.5 text-amber-500" />
              {warnCount} 警告
            </span>
          )}
          {errorCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <XCircle className="size-3.5 text-red-500" />
              {errorCount} 错误
            </span>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && items.length === 0 && (
        <div className="space-y-2 text-sm text-slate-400">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          检查失败：{error}
        </div>
      )}

      {/* Checks list */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2 text-sm">
              {item.status === "ok" ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              ) : item.status === "warn" ? (
                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
              ) : (
                <XCircle className="size-4 shrink-0 text-red-500" />
              )}
              {item.label}
            </span>
            <span className="text-right text-xs text-slate-500">
              {item.detail}
            </span>
          </div>
        ))}
      </div>

      {lastCheck && (
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
          上次检查：{new Date(lastCheck).toLocaleTimeString()}
        </p>
      )}
    </section>
  );
}
