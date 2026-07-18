import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminInquiryList } from "@/components/admin/admin-inquiry-list";
import { listAdminInquiries } from "@/lib/inquiries-server";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await listAdminInquiries();

  return (
    <main className="min-h-screen bg-[#f7f9fa] p-5 text-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white" aria-label="返回工作台">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">客户询盘</h1>
            <p className="mt-1 text-sm text-slate-500">首页留言窗口提交的数量、规格与联系方式。</p>
          </div>
          <span className="ml-2 text-sm text-slate-500">{inquiries.length} 条</span>
        </div>
        <AdminInquiryList inquiries={inquiries} />
      </div>
    </main>
  );
}
