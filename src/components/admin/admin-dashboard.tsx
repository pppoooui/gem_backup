"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Images,
  Gauge,
  Globe2,
  LayoutDashboard,
  MonitorSmartphone,
  PackagePlus,
  QrCode,
  Settings,
  ShieldCheck,
  ShoppingBag,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { PUBLIC_SITE_NAME } from "@/lib/site-config";
import { QRCodeSVG } from "qrcode.react";
import type { AdminOrder, PaymentMethod } from "@/types/domain";
import { cn } from "@/lib/utils";
import { ActionCard } from "./admin-product-manager";
import { AdminOrderDetail } from "./admin-order-detail";

const NAV_LINKS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: LayoutDashboard, label: "工作台", href: "/admin" },
  { icon: ShoppingBag, label: "商品管理", href: "/admin/products" },
  { icon: PackagePlus, label: "批量导入", href: "/admin/products/import" },
  { icon: Images, label: "首页内容", href: "/admin/content" },
  { icon: ClipboardList, label: "订单管理", href: "/admin/orders" },
  { icon: WalletCards, label: "收款方式", href: "/admin/payment-methods" },
  { icon: Gauge, label: "网站检查", href: "/admin/status" },
  { icon: MonitorSmartphone, label: "手机预览", href: "/admin/preview" },
  { icon: Settings, label: "系统设置", href: "/admin/settings" },
];

export function AdminDashboard({
  initialOrders,
  paymentMethods,
  storefrontUrl,
}: {
  initialOrders: AdminOrder[];
  paymentMethods: PaymentMethod[];
  storefrontUrl: string;
}) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [order, setOrder] = useState<AdminOrder | null>(
    initialOrders[0] ?? null,
  );

  function selectOrder(item: AdminOrder) {
    setOrder(item);
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      {/* Fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white xl:block">
        <div className="flex h-16 items-center border-b border-slate-100 px-6">
          <span className="text-base font-bold text-[#002b35]">{PUBLIC_SITE_NAME}</span>
        </div>
        <nav className="space-y-1 p-4 text-sm font-medium">
          {NAV_LINKS.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-slate-600 hover:bg-slate-50"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="xl:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              后台工作台
            </p>
            <h1 className="text-xl font-semibold">
              今日批发订单
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/en"
              className="hidden h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium sm:inline-flex"
            >
              <Globe2 className="size-4" />
              打开前台
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex h-10 items-center rounded-md bg-[#003f4b] px-4 text-sm font-semibold text-white"
            >
              新增商品
            </Link>
          </div>
        </header>

        <div className="grid gap-6 p-5 sm:p-8 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            {/* KPI cards row */}
            <div className="grid gap-4 md:grid-cols-4">
              <ActionCard
                icon={ClipboardList}
                label="今日新订单"
                value={`${orders.length} 个订单`}
                tone="amber"
              />
              <ActionCard
                icon={PackagePlus}
                label="商品"
                value="商品库"
                tone="emerald"
              />
              <ActionCard
                icon={Gauge}
                label="网站检查"
                value="检查配置"
                tone="sky"
              />
              <ActionCard
                icon={MonitorSmartphone}
                label="手机预览"
                value="320 / 360 / 375"
                tone="slate"
              />
            </div>

            {/* Orders + Detail grid */}
            <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
              {/* Order list */}
              <section className="rounded-md border border-slate-200 bg-white">
                <div className="border-b border-slate-100 p-5">
                  <h2 className="font-semibold">订单</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    客户真实下单记录，优先读取 Supabase。
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {orders.length === 0 && (
                    <div className="p-4 text-sm text-slate-500">
                      暂时还没有订单。可以从前台提交一次测试订单。
                    </div>
                  )}
                  {orders.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectOrder(item)}
                      className={cn(
                        "w-full p-4 text-left transition hover:bg-slate-50",
                        order?.id === item.id && "bg-[#f0f8f7]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{item.orderNo}</span>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {item.customerName} · {item.city}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {/* totalUsd formatted inline below */}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 2,
                        }).format(item.totalUsd)}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Order detail panel (extracted component) */}
              {order ? (
                <AdminOrderDetail
                  key={order.id}
                  order={order}
                  paymentMethods={paymentMethods}
                  setOrders={setOrders}
                  setOrder={setOrder}
                />
              ) : (
                <section className="rounded-md border border-slate-200 bg-white p-8 text-sm text-slate-500">
                  从前台提交订单后，这里会显示订单详情。
                </section>
              )}
            </div>

          </section>

          {/* Right sidebar */}
          <aside className="space-y-6">

            {/* Mobile preview card */}
            <section className="rounded-md border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">手机预览</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    扫码用真实手机检查前台页面。
                  </p>
                </div>
                <QrCode className="size-5 text-[#005466]" />
              </div>
              <div className="grid place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
                <QRCodeSVG value={storefrontUrl} size={142} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                {["320px", "360px", "375px"].map((size) => (
                  <span
                    key={size}
                    className="rounded-md border border-slate-200 py-2 font-medium"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </section>

            {/* Security reminders */}
            <section className="rounded-md border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <h2 className="font-semibold">安全提醒</h2>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  客户订单页使用订单号 + token 校验，不公开订单列表。
                </p>
                <p>Service role 密钥只放在服务端环境变量。</p>
                <p>收款账户修改需要超级管理员权限。</p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: import("@/types/domain").OrderStatus }) {
  const statusFlow: {
    status: import("@/types/domain").OrderStatus;
    label: string;
    tone: string;
  }[] = [
    { status: "pending_quote", label: "待报价", tone: "bg-amber-500" },
    { status: "awaiting_payment", label: "待付款", tone: "bg-emerald-600" },
    { status: "payment_submitted", label: "已提交付款", tone: "bg-sky-600" },
    { status: "paid", label: "已付款", tone: "bg-green-700" },
    { status: "processing", label: "处理中", tone: "bg-indigo-600" },
    { status: "shipped", label: "已发货", tone: "bg-slate-700" },
  ];
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
