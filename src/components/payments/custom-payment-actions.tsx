"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import type {
  CustomPaymentLink,
  PaymentMethod,
} from "@/types/domain";

export function CustomPaymentActions({
  link,
  paymentMethods,
  whatsappNumber,
  lineUrl,
}: {
  link: CustomPaymentLink;
  paymentMethods: PaymentMethod[];
  whatsappNumber: string;
  lineUrl: string;
}) {
  const zh = link.locale === "zh";
  const [status, setStatus] = useState(link.status);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isPayable = status === "active";

  async function confirmPayment() {
    setSubmitting(true);
    setMessage("");
    const response = await fetch(`/api/payment-links/${link.token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "payment_submitted" }),
    });
    const data = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setMessage(
        data.error ??
          (zh ? "状态更新失败，请联系客服。" : "Unable to update payment status."),
      );
      return;
    }
    setStatus("payment_submitted");
    setMessage(
      zh
        ? "已通知客服核验付款，请保留付款凭证。"
        : "Sales has been notified. Please keep your payment receipt.",
    );
  }

  const contactMessage = zh
    ? `你好，我想咨询自定义付款链接：${link.title}，金额 US$${link.amountUsd.toFixed(2)}。`
    : `Hello, I have a question about the custom payment link for ${link.title}, total US$${link.amountUsd.toFixed(2)}.`;

  return (
    <div className="space-y-5">
      {link.paymentUrl && isPayable ? (
        <a
          href={link.paymentUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#003f4b] px-5 text-sm font-semibold text-white"
        >
          <CreditCard className="size-5" />
          {zh
            ? `立即支付 US$${link.amountUsd.toFixed(2)}`
            : `Pay US$${link.amountUsd.toFixed(2)} now`}
          <ExternalLink className="size-4" />
        </a>
      ) : null}

      {!link.paymentUrl && isPayable ? (
        <section className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold">
            {zh ? "可用付款方式" : "Available payment methods"}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium">{method.name}</p>
                <p className="text-xs text-slate-400">USD</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {zh
              ? "请通过客服获取已核验的收款账户；后台填写真实付款网址后，此页会显示“立即支付”按钮。"
              : "Contact sales for verified account details. When a direct provider URL is attached, this page shows a Pay now button."}
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(contactMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        )}
        {lineUrl && (
          <a
            href={lineUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 px-3 text-sm font-semibold text-emerald-700"
          >
            LINE
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>

      {isPayable ? (
        <button
          type="button"
          onClick={confirmPayment}
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#003f4b] bg-white text-sm font-semibold text-[#003f4b] disabled:border-slate-200 disabled:text-slate-400"
        >
          <CheckCircle2 className="size-4" />
          {submitting
            ? zh
              ? "提交中..."
              : "Submitting..."
            : zh
              ? "我已付款，通知客服核验"
              : "I have paid — notify sales"}
        </button>
      ) : (
        <div className="rounded-md bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
          {status === "payment_submitted"
            ? zh
              ? "付款已提交，等待客服核验。"
              : "Payment submitted and awaiting verification."
            : status === "paid"
              ? zh
                ? "付款已确认。"
                : "Payment confirmed."
              : zh
                ? "此付款链接当前不可用。"
                : "This payment link is not currently payable."}
        </div>
      )}

      {message && (
        <p className="text-sm font-medium text-[#005466]">{message}</p>
      )}
    </div>
  );
}
