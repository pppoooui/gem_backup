import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { updatePersistedAdminOrder } from "@/lib/orders";

const updateOrderSchema = z.object({
  status: z
    .enum([
      "pending_quote",
      "awaiting_payment",
      "payment_submitted",
      "paid",
      "processing",
      "shipped",
      "cancelled",
    ])
    .optional(),
  shippingFeeUsd: z.number().min(0).optional(),
  discountUsd: z.number().min(0).optional(),
  selectedPaymentProvider: z
    .enum([
      "xtransfer",
      "worldfirst",
      "airwallex",
      "wise",
      "bank_transfer",
      "manual",
    ])
    .optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  try {
    const { orderNo } = await params;
    const input = updateOrderSchema.parse(await request.json());
    const order = await updatePersistedAdminOrder(orderNo, input);

    if (!order) {
      return NextResponse.json({ error: "未找到订单" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues[0]?.message
        : error instanceof Error
          ? error.message
          : "订单更新失败";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
