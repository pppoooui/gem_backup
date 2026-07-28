"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BadgeDollarSign,
  Check,
  CreditCard,
  ExternalLink,
  MessageCircle,
  Send,
} from "lucide-react";
import type { Locale, OrderStatus } from "@/types/domain";
import type { OrderMessage } from "@/lib/order-messages-server";
import { cn, formatUsd } from "@/lib/utils";

const steps: { status: OrderStatus; en: string; zh: string }[] = [
  { status: "pending_quote", en: "Price confirmation", zh: "确认价格" },
  { status: "awaiting_payment", en: "Awaiting payment", zh: "等待付款" },
  { status: "payment_submitted", en: "Payment verification", zh: "付款核验" },
  { status: "paid", en: "Payment confirmed", zh: "确认收款" },
  { status: "production", en: "Production", zh: "生产" },
  { status: "packing", en: "Packing", zh: "包装" },
  { status: "in_transit", en: "Shipped", zh: "发出物流" },
  { status: "delivered", en: "Delivered", zh: "签收" },
];

function normalizedStatus(status: OrderStatus) {
  if (status === "processing") return "production";
  if (status === "shipped") return "in_transit";
  return status;
}

export function OrderLivePanel({
  locale,
  orderNo,
  token,
  customerName,
  initialStatus,
  initialTotal,
  whatsappNumber,
  lineUrl,
}: {
  locale: Locale;
  orderNo: string;
  token: string;
  customerName: string;
  initialStatus: OrderStatus;
  initialTotal: number;
  whatsappNumber?: string;
  lineUrl?: string;
}) {
  const zh = locale === "zh";
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [total, setTotal] = useState(initialTotal);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const [orderResponse, chatResponse] = await Promise.all([
      fetch(`/api/orders/${orderNo}?token=${encodeURIComponent(token)}`, { cache: "no-store" }),
      fetch(`/api/orders/${orderNo}/messages?token=${encodeURIComponent(token)}`, { cache: "no-store" }),
    ]);
    if (orderResponse.ok) {
      const data = await orderResponse.json();
      setStatus(data.order.status);
      setTotal(data.order.totalUsd);
    }
    if (chatResponse.ok) {
      const data = await chatResponse.json();
      setMessages(data.messages ?? []);
    }
  }, [orderNo, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial remote order synchronization
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function postMessage(nextMessage: string) {
    if (!nextMessage.trim()) return false;
    setSending(true);
    const response = await fetch(`/api/orders/${orderNo}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        senderName: customerName,
        message: nextMessage,
      }),
    });
    setSending(false);
    if (response.ok) {
      await refresh();
      return true;
    }
    return false;
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (await postMessage(message)) {
      setMessage("");
    }
  }

  async function requestPriceReview() {
    const price = Number(targetPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setNotice(
        zh
          ? "请输入有效的美元目标总价。"
          : "Enter a valid target total in USD.",
      );
      return;
    }
    setNotice("");
    const requestMessage = zh
      ? `价格协商：我希望订单 ${orderNo} 的目标总价为 ${formatUsd(price)}，请客服确认。`
      : `Price request: My target total for order ${orderNo} is ${formatUsd(price)}. Please review.`;
    if (await postMessage(requestMessage)) {
      setTargetPrice("");
      setNotice(
        zh
          ? "目标价已发送，客服确认后正式报价会自动更新。"
          : "Target price sent. The official quote will update after sales confirms it.",
      );
    } else {
      setNotice(zh ? "发送失败，请重试。" : "Unable to send. Please try again.");
    }
  }

  async function confirmPayment() {
    setNotice("");
    const response = await fetch(`/api/orders/${orderNo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "payment_submitted" }),
    });
    if (response.ok) {
      setNotice(zh ? "已通知客服核验付款。" : "Payment submitted for verification.");
      await refresh();
    } else {
      setNotice(zh ? "状态更新失败，请联系客服。" : "Unable to update payment status.");
    }
  }

  const activeStatus = normalizedStatus(status);
  const activeIndex = steps.findIndex((step) => step.status === activeStatus);

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{zh ? "订单进度" : "Order progress"}</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {steps.map((step, index) => {
            const done = index <= activeIndex;
            return (
              <div key={step.status} className="flex items-center gap-2 text-sm">
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-full", done ? "bg-[#003f4b] text-white" : "bg-slate-100 text-slate-400")}>
                  {done ? <Check className="size-4" /> : index + 1}
                </span>
                <span className={done ? "font-medium text-slate-900" : "text-slate-400"}>
                  {zh ? step.zh : step.en}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {status === "awaiting_payment" ? (
        <section className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{zh ? "客服已确认价格" : "Your quote is ready"}</p>
              <p className="mt-1 text-2xl font-semibold text-[#003f4b]">{formatUsd(total)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/${locale}/payment`} className="inline-flex h-11 items-center gap-2 bg-[#003f4b] px-4 text-sm font-semibold text-white">
                <CreditCard className="size-4" />
                {zh ? "查看付款方式" : "Payment methods"}
              </a>
              <button onClick={confirmPayment} className="h-11 border border-[#003f4b] bg-white px-4 text-sm font-semibold text-[#003f4b]">
                {zh ? "我已付款" : "I have paid"}
              </button>
            </div>
          </div>
          {notice && <p className="mt-3 text-sm text-[#005466]">{notice}</p>}
        </section>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <BadgeDollarSign className="mt-0.5 size-5 shrink-0 text-[#005466]" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              {zh ? "在线协商价格" : "Negotiate the price online"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {zh
                ? "客户提交目标美元总价，客服可在后台修改正式报价；客户不能直接改动已确认金额。"
                : "Submit a target total in USD. Sales can revise the official quote in the admin panel."}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="flex h-11 min-w-0 flex-1 items-center rounded-md border border-slate-200 bg-white px-3 focus-within:border-[#005466]">
                <span className="mr-2 text-sm text-slate-400">US$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={targetPrice}
                  onChange={(event) => setTargetPrice(event.target.value)}
                  placeholder={zh ? "输入目标总价" : "Target order total"}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </label>
              <button
                type="button"
                onClick={requestPriceReview}
                disabled={sending}
                className="h-11 rounded-md bg-[#003f4b] px-4 text-sm font-semibold text-white disabled:bg-slate-300"
              >
                {zh ? "提交目标价" : "Send target price"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => messageInputRef.current?.focus()}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-[#005466]"
              >
                <MessageCircle className="size-4" />
                {zh ? "站内聊天" : "On-site chat"}
              </button>
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                    zh
                      ? `你好，我想协商订单 ${orderNo} 的价格。`
                      : `Hello, I would like to discuss the price for order ${orderNo}.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700"
                >
                  WhatsApp
                  <ExternalLink className="size-3.5" />
                </a>
              )}
              {lineUrl && (
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700"
                >
                  LINE
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
            {notice && <p className="mt-3 text-sm text-[#005466]">{notice}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <MessageCircle className="size-5 text-[#005466]" />
          <h2 className="font-semibold">{zh ? "在线联系客服" : "Chat with sales"}</h2>
          <span className="ml-auto text-xs text-slate-400">{zh ? "每 5 秒自动更新" : "Updates every 5 seconds"}</span>
        </div>
        <div className="h-72 space-y-3 overflow-y-auto bg-slate-50 p-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-slate-400">{zh ? "发送消息确认价格或交期。" : "Send a message about price or lead time."}</p>
          ) : messages.map((item) => (
            <div key={item.id} className={cn("flex", item.senderRole === "customer" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[82%] rounded-md px-3 py-2 text-sm", item.senderRole === "customer" ? "bg-[#003f4b] text-white" : "border border-slate-200 bg-white text-slate-700")}>
                <p className="text-xs opacity-65">{item.senderName || (item.senderRole === "admin" ? "DFC Sales" : customerName)}</p>
                <p className="mt-1 whitespace-pre-wrap">{item.message}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form className="flex gap-2 border-t border-slate-100 p-4" onSubmit={sendMessage}>
          <input ref={messageInputRef} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} className="h-11 min-w-0 flex-1 border border-slate-200 px-3 text-sm outline-none focus:border-[#005466]" placeholder={zh ? "输入消息..." : "Type a message..."} />
          <button disabled={sending || !message.trim()} className="grid size-11 place-items-center bg-[#003f4b] text-white disabled:bg-slate-300" aria-label={zh ? "发送" : "Send"}>
            <Send className="size-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
