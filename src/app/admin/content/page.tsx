import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHomeContent } from "@/components/admin/admin-home-content";

export default function AdminContentPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fa] p-5 text-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          返回工作台
        </Link>
        <AdminHomeContent />
      </div>
    </main>
  );
}
