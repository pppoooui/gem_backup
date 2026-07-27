import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addOrderMessage,
  listOrderMessages,
  resolveOrderId,
} from "@/lib/order-messages-server";

const messageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const { orderNo } = await params;
  const order = await resolveOrderId(orderNo);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ messages: await listOrderMessages(order.id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  try {
    const { orderNo } = await params;
    const input = messageSchema.parse(await request.json());
    const order = await resolveOrderId(orderNo);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    await addOrderMessage({
      orderId: order.id,
      senderRole: "admin",
      senderName: "DFC Sales",
      message: input.message,
    });
    return NextResponse.json({ sent: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Message send failed" }, { status: 400 });
  }
}
