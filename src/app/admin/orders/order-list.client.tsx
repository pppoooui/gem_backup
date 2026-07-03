"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import type { AdminOrder, OrderStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const statusFlow: { status: OrderStatus; label: string; tone: string }[] = [
  { status: "pending_quote", label: "待报价", tone: "bg-amber-500" },
  { status: "awaiting_payment", label: "待付款", tone: "bg-emerald-600" },
  { status: "payment_submitted", label: "已提交付款", tone: "bg-sky-600" },
  { status: "paid", label: "已付款", tone: "bg-green-700" },
  { status: "processing", label: "处理中", tone: "bg-indigo-600" },
  { status: "shipped", label: "已发货", tone: "bg-slate-700" },
];

export function AdminOrderList({ orders }: { orders: AdminOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-12 text-center">
        <ClipboardList className="mx-auto size-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">
          暂时还没有订单
        </p>
        <p className="mt-1 text-xs text-slate-400">
          前台提交的订单会显示在这里。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">订单号</th>
              <th className="px-5 py-3">客户</th>
              <th className="px-5 py-3">商品</th>
              <th className="px-5 py-3">金额</th>
              <th className="px-5 py-3">状态</th>
              <th className="px-5 py-3">日期</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/orders/${order.orderNo}`}
                    className="font-medium text-[#005466] hover:underline"
                  >
                    {order.orderNo}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-slate-500">{order.city}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {order.itemCount} 行商品
                </td>
                <td className="px-5 py-4 font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  }).format(order.totalUsd)}
                </td>
                <td className="px-5 py-4">
                  <StatusPill status={order.status} />
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("en-SG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const statusItem = statusFlow.find((item) => item.status === status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium">
      <span
        className={cn("size-2 rounded-full", statusItem?.tone ?? "bg-slate-300")}
      />
      {statusItem?.label ?? status}
    </span>
  );
}
