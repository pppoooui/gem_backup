import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listPersistedAdminOrders } from "@/lib/orders";
import { getAdminPaymentMethods } from "@/lib/payment-methods";
import { OrderDetailClient } from "./detail.client";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const [orders, paymentMethods] = await Promise.all([
    listPersistedAdminOrders(),
    getAdminPaymentMethods(),
  ]);
  const order = orders.find((item) => item.orderNo === orderNo) ?? null;

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
        <div className="mx-auto max-w-4xl px-5 py-8">
          <Link
            href="/admin/orders"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium"
          >
            <ArrowLeft className="size-4" />
            返回订单列表
          </Link>
          <div className="mt-12 text-center">
            <p className="text-lg font-semibold text-slate-500">
              未找到订单
            </p>
            <p className="mt-1 text-sm text-slate-400">
              没有匹配订单号 &quot;{orderNo}&quot; 的订单。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      <div className="mx-auto max-w-4xl px-5 py-8">
        <Link
          href="/admin/orders"
          className="mb-6 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          返回订单列表
        </Link>
        <OrderDetailClient
          orders={orders}
          initialOrder={order}
          paymentMethods={paymentMethods}
        />
      </div>
    </div>
  );
}
