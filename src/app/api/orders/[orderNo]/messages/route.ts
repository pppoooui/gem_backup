import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addOrderMessage,
  listOrderMessages,
  resolveOrderId,
} from "@/lib/order-messages-server";
import { consumeRateLimit } from "@/lib/rate-limit";

const messageSchema = z.object({
  token: z.string().min(20),
  senderName: z.string().trim().max(120).optional().default("Customer"),
  message: z.string().trim().min(1).max(2000),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const { orderNo } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const order = await resolveOrderId(orderNo, token);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ messages: await listOrderMessages(order.id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  try {
    const { orderNo } = await params;
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const rateLimit = consumeRateLimit(`order-chat:${orderNo}:${ip}`, {
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many messages" }, { status: 429 });
    }
    const input = messageSchema.parse(await request.json());
    const order = await resolveOrderId(orderNo, input.token);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    await addOrderMessage({
      orderId: order.id,
      senderRole: "customer",
      senderName: input.senderName,
      message: input.message,
    });
    return NextResponse.json({ sent: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to send message" }, { status: 400 });
  }
}
