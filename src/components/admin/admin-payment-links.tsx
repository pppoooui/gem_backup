"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  MessageCircle,
  Plus,
  XCircle,
} from "lucide-react";
import type {
  CustomPaymentLink,
  CustomPaymentLinkStatus,
  Locale,
} from "@/types/domain";
import { formatUsd } from "@/lib/utils";

const emptyForm = {
  locale: "en" as Locale,
  title: "",
  specification: "",
  quantity: "",
  amountUsd: "",
  customerName: "",
  customerWhatsApp: "",
  note: "",
  paymentUrl: "",
  expiresAt: "",
};

const statusCopy: Record<CustomPaymentLinkStatus, string> = {
  active: "可付款",
  payment_submitted: "客户已提交付款",
  paid: "已确认收款",
  cancelled: "已停用",
  expired: "已过期",
};

function publicPath(link: CustomPaymentLink) {
  return `/${link.locale}/pay/${link.token}`;
}

export function AdminPaymentLinks() {
  const [links, setLinks] = useState<CustomPaymentLink[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [createdLink, setCreatedLink] = useState<CustomPaymentLink | null>(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/payment-links", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "付款链接加载失败");
      setLinks(data.links ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "付款链接加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load persisted admin data after mount
    void loadLinks();
  }, [loadLinks]);

  const createdUrl = useMemo(() => {
    if (!createdLink || typeof window === "undefined") return "";
    return `${window.location.origin}${publicPath(createdLink)}`;
  }, [createdLink]);

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createLink(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amountUsd: Number(form.amountUsd),
          customerName: form.customerName.trim() || undefined,
          customerWhatsApp: form.customerWhatsApp.trim() || undefined,
          note: form.note.trim() || undefined,
          paymentUrl: form.paymentUrl.trim() || undefined,
          expiresAt: form.expiresAt
            ? new Date(form.expiresAt).toISOString()
            : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.link) {
        throw new Error(data.error ?? "付款链接创建失败");
      }
      setCreatedLink(data.link);
      setLinks((current) => [data.link, ...current]);
      setForm(emptyForm);
      setMessage(`订单 ${data.link.orderNo} 的付款链接已生成，可以直接发送给客户。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "付款链接创建失败");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(link: CustomPaymentLink) {
    const url = `${window.location.origin}${publicPath(link)}`;
    await navigator.clipboard.writeText(url);
    setMessage("付款链接已复制。");
  }

  async function changeStatus(
    link: CustomPaymentLink,
    status: "paid" | "cancelled",
  ) {
    const response = await fetch(`/api/admin/payment-links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok || !data.link) {
      setMessage(data.error ?? "状态更新失败");
      return;
    }
    setLinks((current) =>
      current.map((item) => (item.id === link.id ? data.link : item)),
    );
    setMessage(status === "paid" ? "已确认收款。" : "付款链接已停用。");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <form
        onSubmit={createLink}
        className="rounded-md border border-slate-200 bg-white p-5"
      >
        <div className="flex items-center gap-2">
          <Link2 className="size-5 text-[#005466]" />
          <div>
            <h2 className="font-semibold">生成订单付款链接</h2>
            <p className="mt-1 text-sm text-slate-500">
              系统自动生成“客户名称 + 日期 + 序号”的订单编号；客户可核对规格、美元金额并在线付款。
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="客户语言">
            <select
              value={form.locale}
              onChange={(event) => updateField("locale", event.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </FormField>
          <FormField label="客户名称（可选）">
            <input
              value={form.customerName}
              onChange={(event) =>
                updateField("customerName", event.target.value)
              }
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
            />
          </FormField>
          <FormField label="商品 / 报价标题">
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Round white CZ custom quote"
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
              required
            />
          </FormField>
          <FormField label="数量 / 包装">
            <input
              value={form.quantity}
              onChange={(event) => updateField("quantity", event.target.value)}
              placeholder="100,000 pcs / 100 bags"
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
              required
            />
          </FormField>
          <FormField label="金额（USD）">
            <div className="flex h-10 items-center rounded-md border border-slate-200 px-3">
              <span className="mr-2 text-sm text-slate-400">US$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amountUsd}
                onChange={(event) =>
                  updateField("amountUsd", event.target.value)
                }
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                required
              />
            </div>
          </FormField>
          <FormField label="客户 WhatsApp（可选）">
            <input
              value={form.customerWhatsApp}
              onChange={(event) =>
                updateField("customerWhatsApp", event.target.value)
              }
              placeholder="+1 202 555 0123"
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="完整规格">
              <textarea
                value={form.specification}
                onChange={(event) =>
                  updateField("specification", event.target.value)
                }
                placeholder={"Shape: Round\nColor: Colorless\nSize: 1.50 mm\nGrade: 5A\nPacking: 1,000 pcs/bag"}
                className="min-h-32 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm outline-none"
                required
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="连连支付 / 其他真实付款网址（可选）">
              <input
                type="url"
                value={form.paymentUrl}
                onChange={(event) =>
                  updateField("paymentUrl", event.target.value)
                }
                placeholder="https://..."
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
              />
            </FormField>
            <p className="mt-1 text-xs text-slate-400">
              优先粘贴连连支付商户后台生成的安全收款链接，也支持 XTransfer、Wise、Airwallex 等付款网址。
            </p>
          </div>
          <FormField label="有效期（可选）">
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) =>
                updateField("expiresAt", event.target.value)
              }
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
            />
          </FormField>
          <FormField label="备注（可选）">
            <input
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
            />
          </FormField>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white disabled:bg-slate-300"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          {saving ? "生成中..." : "生成付款链接"}
        </button>
        {message && (
          <p className="mt-3 text-sm font-medium text-[#005466]">{message}</p>
        )}

        {createdLink && createdUrl && (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              最新订单 · {createdLink.orderNo}
            </p>
            <p className="mt-2 break-all text-xs text-emerald-700">
              {createdUrl}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyLink(createdLink)}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-emerald-800"
              >
                <Copy className="size-4" />
                复制
              </button>
              {createdLink.customerWhatsApp && (
                <a
                  href={`https://wa.me/${createdLink.customerWhatsApp.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Order ${createdLink.orderNo} — your secure USD payment link: ${createdUrl}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp 发送
                </a>
              )}
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(createdUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-emerald-800"
              >
                LINE 分享
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </form>

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold">已生成链接</h2>
          <p className="mt-1 text-sm text-slate-500">
            查看客户是否已提交付款，并确认收款或停用链接。
          </p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 p-5 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            正在加载...
          </div>
        ) : (
          <div className="max-h-[760px] divide-y divide-slate-100 overflow-y-auto">
            {links.map((link) => (
              <article key={link.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500">
                      {link.orderNo}
                    </p>
                    <p className="truncate font-medium">{link.title}</p>
                    <p className="mt-1 text-sm font-semibold text-[#003f4b]">
                      {formatUsd(link.amountUsd)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {statusCopy[link.status]}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-xs text-slate-500">
                  {link.specification}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyLink(link)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-semibold"
                  >
                    <Copy className="size-3.5" />
                    复制链接
                  </button>
                  <a
                    href={publicPath(link)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-semibold"
                  >
                    <ExternalLink className="size-3.5" />
                    打开
                  </a>
                  {link.status === "payment_submitted" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(link, "paid")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-700 px-2.5 text-xs font-semibold text-white"
                    >
                      <Check className="size-3.5" />
                      确认收款
                    </button>
                  )}
                  {link.status === "active" && (
                    <button
                      type="button"
                      onClick={() => changeStatus(link, "cancelled")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 px-2.5 text-xs font-semibold text-red-700"
                    >
                      <XCircle className="size-3.5" />
                      停用
                    </button>
                  )}
                </div>
              </article>
            ))}
            {links.length === 0 && (
              <p className="p-5 text-sm text-slate-500">
                暂无付款链接，请从左侧生成第一条。
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
