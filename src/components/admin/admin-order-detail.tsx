"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  ImageIcon,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { usdInrRate } from "@/data/products";
import type {
  AdminOrder,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
} from "@/types/domain";
import { cn, formatInr, formatUsd } from "@/lib/utils";

const statusFlow: { status: OrderStatus; label: string; tone: string }[] = [
  { status: "pending_quote", label: "待报价", tone: "bg-amber-500" },
  {
    status: "awaiting_payment",
    label: "待付款",
    tone: "bg-emerald-600",
  },
  {
    status: "payment_submitted",
    label: "已提交付款",
    tone: "bg-sky-600",
  },
  { status: "paid", label: "已付款", tone: "bg-green-700" },
  { status: "processing", label: "处理中", tone: "bg-indigo-600" },
  { status: "shipped", label: "已发货", tone: "bg-slate-700" },
];

export function AdminOrderDetail({
  order,
  paymentMethods,
  setOrders,
  setOrder,
}: {
  order: AdminOrder;
  paymentMethods: PaymentMethod[];
  setOrders: Dispatch<SetStateAction<AdminOrder[]>>;
  setOrder: Dispatch<SetStateAction<AdminOrder | null>>;
}) {
  const [shippingFee, setShippingFee] = useState(order.shippingFeeUsd);
  const [discount, setDiscount] = useState(order.discountUsd);
  const [provider, setProvider] = useState<PaymentProvider>(
    order.selectedPaymentProvider ?? "xtransfer",
  );
  const [status, setStatus] = useState<OrderStatus>(
    order.status ?? "pending_quote",
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const total = Math.max((order.subtotalUsd ?? 0) + shippingFee - discount, 0);

  const whatsappMessage = useMemo(() => {
    const method =
      paymentMethods.find((item) => item.provider === provider)?.name ??
      "XTransfer";
    const itemSummary =
      order.lines
        ?.map((line) => `${line.name} ${line.sizeMm} x ${line.quantity}`)
        .join("; ") ?? `${order.itemCount} lines`;

    return [
      `Hello ${order.customerName},`,
      `Your proforma invoice for ${order.orderNo} is ready.`,
      `Total: ${formatUsd(total)} (approx. ${formatInr(total * usdInrRate)}).`,
      `Payment method: ${method}.`,
      `Items: ${itemSummary}.`,
      "Please reply here and we will send the full PI and account details.",
    ].join("\n");
  }, [order, paymentMethods, provider, total]);

  async function saveOrderUpdate() {
    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${order.orderNo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          shippingFeeUsd: shippingFee,
          discountUsd: discount,
          selectedPaymentProvider: provider,
        }),
      });
      const data = (await response.json()) as {
        order?: AdminOrder;
        error?: string;
      };

      if (!response.ok || !data.order) {
        setStatusMessage(data.error ?? "订单保存失败。");
        return;
      }

      setOrders((current) =>
        current.map((item) =>
          item.orderNo === data.order?.orderNo ? data.order : item,
        ),
      );
      setOrder(data.order);
      setStatus(data.order.status);
      setStatusMessage("订单已更新。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "订单保存失败。");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyWhatsappMessage() {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setStatusMessage("WhatsApp PI 消息已复制。");
    } catch {
      setStatusMessage("复制失败，请手动选择消息内容复制。");
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{order.orderNo}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {order.customerName} · {order.customerWhatsApp} · PIN{" "}
            {order.pinCode}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="space-y-6 p-5">
        <div className="grid gap-2 md:grid-cols-6">
          {statusFlow.map((step, index) => {
            const currentIndex = statusFlow.findIndex(
              (item) => item.status === status,
            );
            const done = index <= currentIndex;
            return (
              <button
                key={step.status}
                className="flex items-center gap-2 text-left text-xs font-medium"
                onClick={() => setStatus(step.status)}
              >
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full text-white",
                    done ? step.tone : "bg-slate-200 text-slate-500",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className={done ? "text-slate-900" : "text-slate-400"}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <MoneyField label="商品小计" value={order.subtotalUsd} readOnly />
          <MoneyField
            label="运费"
            value={shippingFee}
            onChange={setShippingFee}
          />
          <MoneyField
            label="优惠"
            value={discount}
            onChange={setDiscount}
          />
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="space-y-2">
              <span className="text-sm font-medium">收款方式</span>
              <select
                value={provider}
                onChange={(event) =>
                  setProvider(event.target.value as PaymentProvider)
                }
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.provider}>
                    {method.name}
                    {method.enabled ? "" : "（已停用）"}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <p className="text-sm font-medium">最终金额</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatUsd(total)}
              </p>
              <p className="text-sm text-slate-500">
                ≈ {formatInr(total * usdInrRate)}
              </p>
            </div>
            <button
              className="h-11 rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:bg-slate-300"
              onClick={saveOrderUpdate}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : "保存报价"}
            </button>
          </div>
          {statusMessage && (
            <p className="mt-3 text-sm font-medium text-[#005466]">
              {statusMessage}
            </p>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-md border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <MessageCircle className="size-4 text-emerald-600" />
              WhatsApp PI 消息
            </div>
            <pre className="whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">
              {whatsappMessage}
            </pre>
            <button
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold"
              onClick={copyWhatsappMessage}
            >
              <Copy className="size-4" />
              复制 PI 消息
            </button>
          </section>
          <section className="rounded-md border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <FileSpreadsheet className="size-4 text-[#005466]" />
              商品明细
            </div>
            <div className="space-y-2 text-sm">
              {order.lines?.map((line) => (
                <div
                  key={`${line.sku}-${line.quantity}`}
                  className="rounded-md border border-slate-100 p-2"
                >
                  <p className="font-medium">{line.name}</p>
                  <p className="text-xs text-slate-500">
                    {line.sizeMm} · {line.quantity.toLocaleString()} 件 ·{" "}
                    {formatUsd(line.lineTotalUsd)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Payment Screenshot Section */}
        {order.paymentScreenshotUrl ? (
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ImageIcon className="size-4 text-emerald-600" />
              付款截图
            </div>
            <div className="relative w-full overflow-hidden rounded-md bg-slate-100">
              <Image
                src={order.paymentScreenshotUrl}
                alt="付款凭证截图"
                width={800}
                height={600}
                className="h-auto w-full object-contain"
                style={{ maxHeight: "480px" }}
              />
            </div>
            <a
              href={order.paymentScreenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-50"
            >
              <ImageIcon className="size-4" />
              打开原图
            </a>
          </section>
        ) : (
          <section className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <ImageIcon className="mx-auto size-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              暂未上传付款截图
            </p>
            <p className="mt-1 text-xs text-slate-400">
              客户可以在订单页上传凭证，也可以通过 WhatsApp 发给我们。
            </p>
          </section>
        )}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const statusItem = statusFlow.find((item) => item.status === status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium">
      <span
        className={cn("size-2 rounded-full", statusItem?.tone ?? "bg-slate-300")}
      />
      {statusItem?.label ?? status}
    </span>
  );
}

function MoneyField({
  label,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  value: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex h-11 items-center rounded-md border border-slate-200 bg-white px-3">
        <span className="mr-2 text-slate-400">US$</span>
        <input
          className="w-full bg-transparent text-sm outline-none"
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(Number(event.target.value) || 0)}
        />
      </div>
    </label>
  );
}
