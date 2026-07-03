import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listPersistedAdminOrders } from "@/lib/orders";
import { AdminOrderList } from "./order-list.client";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listPersistedAdminOrders();

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold">订单管理</h1>
          <span className="ml-2 text-sm text-slate-500">
            {orders.length} 个订单
          </span>
        </div>
        <AdminOrderList orders={orders} />
      </div>
    </div>
  );
}
