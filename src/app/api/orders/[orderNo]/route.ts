import { NextResponse } from "next/server";
import { getPersistedOrderByToken, toPublicOrder } from "@/lib/orders";
import { markPaymentSubmitted, resolveOrderId } from "@/lib/order-messages-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  try {
    const { orderNo } = await params;
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Order token is required" }, { status: 401 });
    }

    const order = await getPersistedOrderByToken(orderNo, token);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: toPublicOrder(order) });
  } catch (error) {
    console.error("[orders] lookup failed", error);
    return NextResponse.json({ error: "Unable to load order" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  try {
    const { orderNo } = await params;
    const body = (await request.json()) as { token?: string; action?: string };
    if (!body.token || body.action !== "payment_submitted") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const order = await resolveOrderId(orderNo, body.token);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "awaiting_payment") {
      return NextResponse.json({ error: "Order is not awaiting payment" }, { status: 409 });
    }
    await markPaymentSubmitted(order.id);
    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Unable to update payment status" }, { status: 400 });
  }
}
