"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPaymentMethods } from "@/components/admin/admin-payment-methods";

export default function AdminPaymentMethodsPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          返回工作台
        </Link>
        <AdminPaymentMethods />
      </div>
    </div>
  );
}
