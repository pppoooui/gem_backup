"use client";

import { Check, CreditCard, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale, PaymentMethod, PaymentProvider } from "@/types/domain";

// Card payments run through WorldFirst order links, so it leads the list and is
// preselected; the transfer channels stay available underneath.
const CARD_PROVIDER: PaymentProvider = "worldfirst";

const copy = {
  en: {
    card: "Credit / debit card",
    cardNote: "Secure checkout by WorldFirst · USD",
    others: "Other ways to pay",
    transfer: "Bank transfer",
  },
  zh: {
    card: "信用卡 / 借记卡",
    cardNote: "由 WorldFirst 提供安全收款 · USD",
    others: "其他付款方式",
    transfer: "银行转账",
  },
} satisfies Record<Locale, Record<string, string>>;

export function preferredPaymentProvider(
  methods: PaymentMethod[],
): PaymentProvider | "" {
  return (
    methods.find((method) => method.provider === CARD_PROVIDER)?.provider ??
    methods[0]?.provider ??
    ""
  );
}

export function PaymentMethodPicker({
  locale,
  methods,
  value,
  onChange,
}: {
  locale: Locale;
  methods: PaymentMethod[];
  value: PaymentProvider | "";
  onChange: (provider: PaymentProvider) => void;
}) {
  const t = copy[locale];
  const card = methods.find((method) => method.provider === CARD_PROVIDER);
  const others = methods.filter((method) => method.provider !== CARD_PROVIDER);

  return (
    <div role="radiogroup" className="space-y-3">
      {card ? (
        <button
          type="button"
          role="radio"
          aria-checked={value === card.provider}
          onClick={() => onChange(card.provider)}
          className={cn(
            "flex w-full items-start gap-3 rounded-md border p-3 text-left transition",
            value === card.provider
              ? "border-[#005466] bg-[#f0f7f5] ring-1 ring-[#005466]"
              : "border-slate-200 bg-white hover:border-slate-300",
          )}
        >
          <CreditCard className="mt-0.5 size-5 shrink-0 text-[#005466]" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-900">{t.card}</span>
            <span className="mt-1.5 flex flex-wrap gap-1">
              {["VISA", "Mastercard", "AMEX"].map((brand) => (
                <span
                  key={brand}
                  className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-600"
                >
                  {brand}
                </span>
              ))}
            </span>
            <span className="mt-1.5 block text-xs text-slate-500">{t.cardNote}</span>
          </span>
          <RadioDot checked={value === card.provider} />
        </button>
      ) : null}

      {others.length > 0 ? (
        <div>
          {card ? (
            <p className="mb-2 text-xs font-semibold text-slate-500">{t.others}</p>
          ) : null}
          <div className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
            {others.map((method) => (
              <button
                key={method.id}
                type="button"
                role="radio"
                aria-checked={value === method.provider}
                onClick={() => onChange(method.provider)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
              >
                <Landmark className="size-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-slate-800">{method.name}</span>
                  <span className="block text-[11px] text-slate-400">{t.transfer}</span>
                </span>
                <RadioDot checked={value === method.provider} />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-full border",
        checked ? "border-[#005466] bg-[#005466] text-white" : "border-slate-300 bg-white",
      )}
    >
      {checked ? <Check className="size-3" /> : null}
    </span>
  );
}
