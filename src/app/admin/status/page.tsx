"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSiteHealth } from "@/components/admin/admin-site-health";

export default function AdminStatusPage() {
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
        <div className="mb-4">
          <h1 className="text-xl font-semibold">网站状态检查</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            检查前台、API、数据库和 Supabase 连接状态。
          </p>
        </div>
        <AdminSiteHealth />
      </div>
    </div>
  );
}
