"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Settings, Wrench } from "lucide-react";
import { managedSiteSettings, type ManagedSiteSetting } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

type SiteSetting = ManagedSiteSetting;

const INITIAL_SETTINGS: SiteSetting[] = managedSiteSettings;

const SETTING_COPY: Record<string, { label: string; description: string }> = {
  whatsapp_number: {
    label: "WhatsApp 号码",
    description: "用于首页直达 WhatsApp 按钮；请填写含国家码的真实号码，例如 +8613800000000",
  },
  home_show_history: {
    label: "显示发展历程",
    description: "默认隐藏；打开后在首页展示 Our journey。",
  },
  home_show_recognition: {
    label: "显示行业认可",
    description: "默认隐藏；打开后在首页展示认证与品质记录。",
  },
  catalog_show_product_details: {
    label: "显示商品规格",
    description: "默认隐藏；打开后显示 1-12 mm、3A / 5A 等规格信息。",
  },
  catalog_show_prices: {
    label: "显示商品价格与购物车",
    description: "默认隐藏；打开后才会公开价格并恢复购物车。",
  },
  min_order_amount_usd: {
    label: "最低订单金额（USD）",
    description: "低于该金额的订单会被拦截",
  },
  business_name_en: {
    label: "英文品牌名",
    description: "用于 PI / 邮件等英文场景",
  },
  business_name_zh: {
    label: "中文品牌名",
    description: "用于 PI / 邮件等中文场景",
  },
  default_currency: {
    label: "默认报价币种",
    description: "所有报价默认使用 USD",
  },
  reference_currency: {
    label: "参考币种",
    description: "页面估算给印度客户参考",
  },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [statusMessage, setStatusMessage] = useState("");
  const [mode, setMode] = useState<"fallback" | "supabase" | "validated-only">("fallback");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!active || !res.ok) return;
        setSettings(data.settings ?? INITIAL_SETTINGS);
        setMode(data.mode ?? "fallback");
      } catch {
        if (active) setMode("fallback");
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function updateSetting(index: number, newValue: string) {
    const next = [...settings];
    next[index] = { ...next[index], value: newValue };
    setSettings(next);
  }

  function toggleSetting(index: number) {
    updateSetting(index, settings[index].value === "true" ? "false" : "true");
  }

  async function saveAll() {
    setSaving(true);
    setStatusMessage("正在保存设置...");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "设置保存失败");
      setMode(data.mode ?? mode);
      setStatusMessage(
        data.mode === "supabase"
          ? "设置已保存到 Supabase。"
          : "设置已在本地校验。配置 Supabase 环境变量后才会持久保存。",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "设置保存失败");
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold">系统设置</h1>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {mode === "supabase" ? "Supabase" : "本地预览"}
          </span>
        </div>

        <div className="rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Settings className="size-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">
                键值配置
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              数据来自{" "}
              <code className="rounded bg-slate-100 px-1">
                public.site_settings
              </code>
              ，保存会通过受保护的后台 API 写入。
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-5 py-2">
            {settings.map((item, index) => {
              const copy = SETTING_COPY[item.key] ?? {
                label: item.labelEn,
                description: item.descriptionEn ?? "",
              };
              return (
                <div
                  key={item.key}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{copy.label}</p>
                    {copy.description && (
                      <p className="text-xs text-slate-400">
                        {copy.description}
                      </p>
                    )}
                    <p className="mt-0.5 font-mono text-[11px] text-slate-300">
                      {item.key}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:w-64">
                    {item.isToggle ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.value === "true"}
                        aria-label={copy.label}
                        onClick={() => toggleSetting(index)}
                        className={cn(
                          "relative h-7 w-12 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#005466] focus:ring-offset-2",
                          item.value === "true" ? "bg-[#005466]" : "bg-slate-300",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 size-5 rounded-full bg-white shadow-sm transition",
                            item.value === "true" ? "left-6" : "left-1",
                          )}
                        />
                      </button>
                    ) : (
                      <input
                        className={cn(
                          "h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#005466] focus:ring-1 focus:ring-[#005466]",
                          "font-mono",
                        )}
                        value={item.value}
                        onChange={(event) => updateSetting(index, event.target.value)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#003f4b] px-4 text-sm font-semibold text-white"
              onClick={saveAll}
              disabled={saving}
            >
              <Check className="size-4" />
              {saving ? "保存中..." : "保存全部"}
            </button>
            {statusMessage && (
              <p className="text-sm font-medium text-[#005466]">
                {statusMessage}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Wrench className="size-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                说明
              </p>
              <p className="mt-1 text-xs text-amber-700">
                配置会保存到{" "}
                <code className="rounded bg-amber-100 px-1">
                  public.site_settings
                </code>
                。如果没有配置 Supabase service role 环境变量，本地预览只会校验数据，不会写入。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
