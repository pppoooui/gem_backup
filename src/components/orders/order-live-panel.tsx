"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CreditCard,
  ExternalLink,
  Bell,
  MessageCircle,
  RotateCcw,
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
  { status: "refund_requested", en: "Negotiated refund", zh: "协商退款" },
];

function normalizedStatus(status: OrderStatus) {
  if (status === "processing") return "production";
  if (status === "shipped") return "in_transit";
  if (status === "refunded") return "refund_requested";
  return status;
}

function messageDay(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function messageTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: locale !== "zh",
  }).format(new Date(value));
}

export function OrderLivePanel({
  locale,
  orderNo,
  token,
  customerName,
  initialStatus,
  initialTotal,
  initialPaymentUrl,
  whatsappNumber,
  lineUrl,
}: {
  locale: Locale;
  orderNo: string;
  token: string;
  customerName: string;
  initialStatus: OrderStatus;
  initialTotal: number;
  initialPaymentUrl?: string;
  whatsappNumber?: string;
  lineUrl?: string;
}) {
  const zh = locale === "zh";
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [total, setTotal] = useState(initialTotal);
  const [paymentUrl, setPaymentUrl] = useState(initialPaymentUrl ?? "");
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [chatLoaded, setChatLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatSectionRef = useRef<HTMLElement>(null);
  const chatViewportRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const initializedMessagesRef = useRef(false);
  const knownAdminMessageIdsRef = useRef(new Set<string>());
  const initialPageScrollDoneRef = useRef(false);
  const chatVisibleRef = useRef(false);
  const originalTitleRef = useRef("");

  const refresh = useCallback(async () => {
    const [orderResponse, chatResponse] = await Promise.all([
      fetch(`/api/orders/${orderNo}?token=${encodeURIComponent(token)}`, { cache: "no-store" }),
      fetch(`/api/orders/${orderNo}/messages?token=${encodeURIComponent(token)}`, { cache: "no-store" }),
    ]);
    if (orderResponse.ok) {
      const data = await orderResponse.json();
      setStatus(data.order.status);
      setTotal(data.order.totalUsd);
      setPaymentUrl(data.order.paymentUrl ?? "");
    }
    if (chatResponse.ok) {
      const data = await chatResponse.json();
      const nextMessages = (data.messages ?? []) as OrderMessage[];
      const nextAdminMessages = nextMessages.filter(
        (item) => item.senderRole === "admin",
      );
      if (initializedMessagesRef.current) {
        const newAdminMessages = nextAdminMessages.filter(
          (item) => !knownAdminMessageIdsRef.current.has(item.id),
        );
        if (newAdminMessages.length > 0 && !chatVisibleRef.current) {
          setUnreadCount((current) => current + newAdminMessages.length);
          document.title = `(${newAdminMessages.length}) ${
            zh ? "客服新消息" : "New sales message"
          } · ${originalTitleRef.current}`;
        }
      } else {
        initializedMessagesRef.current = true;
      }
      knownAdminMessageIdsRef.current = new Set(
        nextAdminMessages.map((item) => item.id),
      );
      setMessages(nextMessages);
      setChatLoaded(true);
    }
  }, [orderNo, token, zh]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial remote order synchronization
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const viewport = chatViewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  useEffect(() => {
    originalTitleRef.current = document.title;
    const section = chatSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        chatVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          setUnreadCount(0);
          document.title = originalTitleRef.current;
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      document.title = originalTitleRef.current;
    };
  }, []);

  useEffect(() => {
    if (!chatLoaded || initialPageScrollDoneRef.current) return;
    initialPageScrollDoneRef.current = true;
    window.requestAnimationFrame(() => {
      chatSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      messageInputRef.current?.focus({ preventScroll: true });
    });
  }, [chatLoaded]);

  function openUnreadMessages() {
    setUnreadCount(0);
    document.title = originalTitleRef.current;
    chatSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

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

  async function requestRefund() {
    const reason = refundReason.trim();
    if (reason.length < 5) {
      setNotice(
        zh
          ? "请填写至少 5 个字的退款原因，并先与客服协商。"
          : "Enter at least 5 characters and discuss the refund with sales first.",
      );
      return;
    }
    setSending(true);
    setNotice("");
    const response = await fetch(`/api/orders/${orderNo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        action: "refund_requested",
        reason,
        customerName,
      }),
    });
    setSending(false);
    if (response.ok) {
      setRefundReason("");
      setNotice(
        zh
          ? "协商退款已提交，正在等待后台审核同意。"
          : "Refund request submitted and awaiting admin approval.",
      );
      await refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setNotice(
        data.error ??
          (zh ? "退款申请提交失败，请联系客服。" : "Unable to submit the refund request."),
      );
    }
  }

  const activeStatus = normalizedStatus(status);
  const activeIndex = steps.findIndex((step) => step.status === activeStatus);
  const canRequestRefund = [
    "paid",
    "production",
    "packing",
    "in_transit",
    "delivered",
  ].includes(status);

  return (
    <div className="space-y-6">
      {unreadCount > 0 ? (
        <button
          type="button"
          onClick={openUnreadMessages}
          className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xl sm:right-6"
        >
          <Bell className="size-4" />
          {zh ? `客服有 ${unreadCount} 条新消息` : `${unreadCount} new sales message${unreadCount > 1 ? "s" : ""}`}
        </button>
      ) : null}
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
              {paymentUrl ? (
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white"
                >
                  <CreditCard className="size-4" />
                  {zh ? `立即支付 ${formatUsd(total)}` : `Pay ${formatUsd(total)} now`}
                  <ExternalLink className="size-4" />
                </a>
              ) : (
                <a href={`/${locale}/payment`} className="inline-flex h-11 items-center gap-2 bg-[#003f4b] px-4 text-sm font-semibold text-white">
                  <CreditCard className="size-4" />
                  {zh ? "查看付款方式" : "Payment methods"}
                </a>
              )}
              {paymentUrl ? (
                <a href={`/${locale}/payment`} className="inline-flex h-11 items-center gap-2 border border-slate-200 bg-white px-4 text-sm font-semibold text-[#003f4b]">
                  {zh ? "其他付款方式" : "Other payment methods"}
                </a>
              ) : null}
              <button onClick={confirmPayment} className="h-11 border border-[#003f4b] bg-white px-4 text-sm font-semibold text-[#003f4b]">
                {zh ? "我已付款" : "I have paid"}
              </button>
            </div>
          </div>
          {notice && <p className="mt-3 text-sm text-[#005466]">{notice}</p>}
        </section>
      ) : null}

      {canRequestRefund || status === "refund_requested" || status === "refunded" ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <RotateCcw className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">
                {zh ? "协商退款" : "Negotiated refund"}
              </h2>
              {status === "refunded" ? (
                <p className="mt-2 text-sm font-medium text-emerald-700">
                  {zh ? "后台已同意退款，请留意到账通知。" : "Your refund has been approved. Please watch for the payment notification."}
                </p>
              ) : status === "refund_requested" ? (
                <p className="mt-2 text-sm font-medium text-amber-800">
                  {zh ? "退款申请已提交，等待后台审核同意。" : "Your request is awaiting admin approval."}
                </p>
              ) : (
                <>
                  <p className="mt-1 text-sm leading-6 text-amber-900/70">
                    {zh
                      ? "请先通过下方聊天、WhatsApp 或 LINE 与客服协商，再提交退款原因。提交后必须由后台审核同意。"
                      : "Discuss the refund with sales by chat, WhatsApp or LINE first. The request only proceeds after admin approval."}
                  </p>
                  <textarea
                    value={refundReason}
                    onChange={(event) => setRefundReason(event.target.value)}
                    maxLength={2000}
                    placeholder={zh ? "填写协商结果和退款原因" : "Describe the agreement and refund reason"}
                    className="mt-4 min-h-24 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={requestRefund}
                    disabled={sending}
                    className="mt-3 h-11 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white disabled:bg-slate-300"
                  >
                    {zh ? "提交协商退款" : "Submit refund request"}
                  </button>
                </>
              )}
              {notice && <p className="mt-3 text-sm text-[#005466]">{notice}</p>}
            </div>
          </div>
        </section>
      ) : null}

      <section
        ref={chatSectionRef}
        id="order-chat"
        className="scroll-mt-4 rounded-md border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-4">
          <MessageCircle className="size-5 text-[#005466]" />
          <h2 className="font-semibold">{zh ? "在线联系客服" : "Chat with sales"}</h2>
          {unreadCount > 0 ? (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                  zh ? `你好，我想咨询订单 ${orderNo}。` : `Hello, I have a question about order ${orderNo}.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
              >
                WhatsApp <ExternalLink className="size-3" />
              </a>
            ) : null}
            {lineUrl ? (
              <a href={lineUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                LINE <ExternalLink className="size-3" />
              </a>
            ) : null}
            <span className="text-xs text-slate-400">{zh ? "每 5 秒自动更新" : "Updates every 5 seconds"}</span>
          </div>
        </div>
        <div ref={chatViewportRef} className="h-80 space-y-3 overflow-y-auto bg-[#f3f4f6] p-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-slate-400">{zh ? "发送消息确认价格或交期。" : "Send a message about price or lead time."}</p>
          ) : messages.map((item, index) => {
            const showDay =
              index === 0 ||
              messageDay(messages[index - 1].createdAt, locale) !==
                messageDay(item.createdAt, locale);
            return (
              <div key={item.id}>
                {showDay ? (
                  <p className="mb-3 text-center text-[11px] text-slate-400">
                    <span className="rounded bg-slate-200/80 px-2 py-1">
                      {messageDay(item.createdAt, locale)}
                    </span>
                  </p>
                ) : null}
                <div className={cn("flex", item.senderRole === "customer" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[82%] rounded-lg px-3 py-2 text-sm shadow-sm", item.senderRole === "customer" ? "bg-[#95ec69] text-slate-900" : "border border-slate-200 bg-white text-slate-700")}>
                    <div className="flex items-center justify-between gap-3 text-[11px] opacity-60">
                      <span>{item.senderName || (item.senderRole === "admin" ? "DFC Sales" : customerName)}</span>
                      <time dateTime={item.createdAt}>{messageTime(item.createdAt, locale)}</time>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap leading-6">{item.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
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
