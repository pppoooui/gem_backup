"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CreditCard, MessageCircle, Send } from "lucide-react";
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
}: {
  locale: Locale;
  orderNo: string;
  token: string;
  customerName: string;
  initialStatus: OrderStatus;
  initialTotal: number;
}) {
  const zh = locale === "zh";
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [total, setTotal] = useState(initialTotal);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

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

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const response = await fetch(`/api/orders/${orderNo}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, senderName: customerName, message }),
    });
    setSending(false);
    if (response.ok) {
      setMessage("");
      await refresh();
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
          <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} className="h-11 min-w-0 flex-1 border border-slate-200 px-3 text-sm outline-none focus:border-[#005466]" placeholder={zh ? "输入消息..." : "Type a message..."} />
          <button disabled={sending || !message.trim()} className="grid size-11 place-items-center bg-[#003f4b] text-white disabled:bg-slate-300" aria-label={zh ? "发送" : "Send"}>
            <Send className="size-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
