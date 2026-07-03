import { NextResponse } from "next/server";
import { getPersistedOrderByToken, toPublicOrder } from "@/lib/orders";

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
