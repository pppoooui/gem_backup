"use client";

import { AdminProductManager } from "@/components/admin/admin-product-manager";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold">商品管理</h1>
          <Link
            href="/admin/products/import"
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-md bg-[#003f4b] px-4 text-sm font-semibold text-white"
          >
            <PackagePlus className="size-4" />
            导入 CSV
          </Link>
        </div>
        <AdminProductManager />
      </div>
    </div>
  );
}
