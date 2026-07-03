"use client";

import { useState } from "react";
import type { AdminOrder, PaymentMethod } from "@/types/domain";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";

export function OrderDetailClient({
  orders,
  initialOrder,
  paymentMethods,
}: {
  orders: AdminOrder[];
  initialOrder: AdminOrder;
  paymentMethods: PaymentMethod[];
}) {
  const [, setOrderList] = useState<AdminOrder[]>(orders);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(
    initialOrder,
  );

  return (
    <AdminOrderDetail
      key={selectedOrder!.id}
      order={selectedOrder!}
      paymentMethods={paymentMethods}
      setOrders={setOrderList}
      setOrder={setSelectedOrder}
    />
  );
}
