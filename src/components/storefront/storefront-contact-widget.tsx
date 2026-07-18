"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardPenLine,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import {
  inquiryGrades,
  makeWhatsAppUrl,
  openInquiryEventName,
} from "@/lib/inquiries";
import type { Locale } from "@/types/domain";

const copy = {
  en: {
    whatsapp: "Chat on WhatsApp",
    inquiry: "Send inquiry",
    title: "Request a quote",
    body: "Tell us the quantity and specification you need. Our team will reply through your preferred contact method.",
    contactName: "Company or contact name",
    quantity: "Quantity (pcs)",
    size: "Size",
    grade: "Grade",
    email: "Email",
    whatsappField: "WhatsApp",
    notes: "Additional requirements",
    notesHint: "Packing, delivery country or special requests",
    submit: "Send inquiry",
    sending: "Sending...",
    success: "Thank you. Your inquiry has been sent.",
    failure: "Unable to send the inquiry. Please try again or contact us on WhatsApp.",
    close: "Close inquiry window",
  },
  zh: {
    whatsapp: "WhatsApp 咨询",
    inquiry: "提交询盘",
    title: "提交询盘",
    body: "填写需要的数量与规格，我们会通过您留下的联系方式回复。",
    contactName: "公司或联系人",
    quantity: "数量（颗）",
    size: "规格",
    grade: "等级",
    email: "邮箱",
    whatsappField: "WhatsApp",
    notes: "补充需求",
    notesHint: "包装、收货国家或其他要求",
    submit: "发送询盘",
    sending: "发送中...",
    success: "已收到您的询盘，我们会尽快回复。",
    failure: "询盘发送失败，请稍后再试或通过 WhatsApp 联系我们。",
    close: "关闭询盘窗口",
  },
} satisfies Record<Locale, Record<string, string>>;

const sizeOptions = Array.from({ length: 12 }, (_, index) => `${index + 1} mm`);

export function StorefrontContactWidget({
  locale,
  whatsappNumber,
}: {
  locale: Locale;
  whatsappNumber: string;
}) {
  const t = copy[locale];
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    contactName: "",
    quantity: "",
    sizeMm: "1 mm",
    grade: "5A",
    email: "",
    whatsapp: "",
    notes: "",
    website: "",
  });
  const whatsappUrl = makeWhatsAppUrl(
    whatsappNumber,
    locale === "zh"
      ? "您好，我想咨询 DFC Cubic Zirconia Factory 的产品。"
      : "Hello, I would like to inquire about DFC Cubic Zirconia Factory products.",
  );

  useEffect(() => {
    const openInquiry = () => {
      setStatus("");
      setIsOpen(true);
    };
    const openFromHash = () => {
      if (window.location.hash === "#inquiry") openInquiry();
    };

    window.addEventListener(openInquiryEventName, openInquiry);
    window.addEventListener("hashchange", openFromHash);
    const frame = window.requestAnimationFrame(openFromHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(openInquiryEventName, openInquiry);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, []);

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus("");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? t.failure);

      setStatus(t.success);
      setForm({
        contactName: "",
        quantity: "",
        sizeMm: "1 mm",
        grade: "5A",
        email: "",
        whatsapp: "",
        notes: "",
        website: "",
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.failure);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3 sm:bottom-6 sm:right-6">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            title={t.whatsapp}
            aria-label={t.whatsapp}
            className="grid size-12 place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:ring-offset-2"
          >
            <MessageCircle className="size-6" />
          </a>
        ) : null}
        <button
          type="button"
          title={t.inquiry}
          aria-label={t.inquiry}
          onClick={() => {
            setStatus("");
            setIsOpen(true);
          }}
          className="grid size-12 place-items-center rounded-full bg-[#003f4b] text-white shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#003f4b] focus:ring-offset-2"
        >
          <ClipboardPenLine className="size-5" />
        </button>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/35 p-4 sm:items-center sm:justify-end sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            id="inquiry"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto border border-black/10 bg-white p-5 shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="inquiry-title" className="text-xl font-semibold text-[#171717]">
                  {t.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/55">{t.body}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t.close}
                title={t.close}
                className="grid size-9 shrink-0 place-items-center border border-black/10 text-black/65 hover:bg-black/5"
              >
                <X className="size-4" />
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={submitInquiry}>
              <Field label={t.contactName} value={form.contactName} onChange={(value) => updateForm("contactName", value)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.quantity} type="number" min="1" value={form.quantity} onChange={(value) => updateForm("quantity", value)} required />
                <SelectField label={t.size} value={form.sizeMm} onChange={(value) => updateForm("sizeMm", value)}>
                  {sizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
                </SelectField>
              </div>
              <SelectField label={t.grade} value={form.grade} onChange={(value) => updateForm("grade", value)}>
                {inquiryGrades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
              </SelectField>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.email} type="email" value={form.email} onChange={(value) => updateForm("email", value)} required />
                <Field label={t.whatsappField} value={form.whatsapp} onChange={(value) => updateForm("whatsapp", value)} required />
              </div>
              <label className="block text-sm font-medium text-black/75">
                {t.notes}
                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder={t.notesHint}
                  maxLength={2_000}
                  rows={3}
                  className="mt-1.5 w-full resize-y border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#003f4b] focus:ring-1 focus:ring-[#003f4b]"
                />
              </label>
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-px w-px opacity-0"
                value={form.website}
                onChange={(event) => updateForm("website", event.target.value)}
              />
              {status ? (
                <p className={status === t.success ? "flex items-center gap-2 text-sm text-emerald-700" : "text-sm text-red-700"}>
                  {status === t.success ? <CheckCircle2 className="size-4 shrink-0" /> : null}
                  {status}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[#003f4b] px-4 text-sm font-semibold text-white transition hover:bg-[#005466] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Send className="size-4" />
                {isSending ? t.sending : t.submit}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number";
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-black/75">
      {label}
      <input
        type={type}
        min={min}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full border border-black/15 px-3 text-sm outline-none focus:border-[#003f4b] focus:ring-1 focus:ring-[#003f4b]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-black/75">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#003f4b] focus:ring-1 focus:ring-[#003f4b]"
      >
        {children}
      </select>
    </label>
  );
}
