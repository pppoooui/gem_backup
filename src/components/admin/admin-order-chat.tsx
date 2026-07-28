"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

type Message = {
  id: string;
  senderRole: "customer" | "admin";
  senderName: string;
  message: string;
  createdAt: string;
};

function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function AdminOrderChat({ orderNo }: { orderNo: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/admin/orders/${orderNo}/messages`, { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setMessages(data.messages ?? []);
  }, [orderNo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial remote chat synchronization
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const response = await fetch(`/api/admin/orders/${orderNo}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setSending(false);
    if (response.ok) {
      setMessage("");
      await refresh();
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-semibold">
        <MessageCircle className="size-4 text-[#005466]" />
        客户在线沟通
        <span className="ml-auto text-xs font-normal text-slate-400">每 5 秒更新</span>
      </div>
      <div className="h-72 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {messages.length === 0 ? <p className="text-center text-sm text-slate-400">暂无消息</p> : messages.map((item) => (
          <div key={item.id} className={`flex ${item.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] rounded-md px-3 py-2 text-sm ${item.senderRole === "admin" ? "bg-[#003f4b] text-white" : "border border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between gap-3 text-xs opacity-65">
                <span>{item.senderName || (item.senderRole === "admin" ? "DFC Sales" : "客户")}</span>
                <time dateTime={item.createdAt}>{formatMessageDate(item.createdAt)}</time>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{item.message}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="flex gap-2 border-t border-slate-100 p-4" onSubmit={send}>
        <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} className="h-11 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#005466]" placeholder="回复客户..." />
        <button disabled={sending || !message.trim()} className="grid size-11 place-items-center rounded-md bg-[#003f4b] text-white disabled:bg-slate-300" aria-label="发送消息">
          <Send className="size-4" />
        </button>
      </form>
    </section>
  );
}
