import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPaymentLinks } from "@/components/admin/admin-payment-links";

export const dynamic = "force-dynamic";

export default function AdminPaymentLinksPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fa] p-5 text-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white"
            aria-label="返回工作台"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">自定义付款链接</h1>
            <p className="mt-1 text-sm text-slate-500">
              按客户需要填写规格和 USD 金额，生成可直接分享的安全链接。
            </p>
          </div>
        </div>
        <AdminPaymentLinks />
      </div>
    </main>
  );
}
