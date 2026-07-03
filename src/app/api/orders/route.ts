import { NextResponse } from "next/server";
import { createPersistedCheckoutOrder, toPublicOrder } from "@/lib/orders";
import { toOrderApiError } from "@/lib/order-api-error";
import { consumeRateLimit } from "@/lib/rate-limit";

const MAX_ORDER_BODY_BYTES = 64 * 1024;
const ORDER_RATE_LIMIT = {
  limit: 10,
  windowMs: 10 * 60 * 1000,
};

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_ORDER_BODY_BYTES) {
      return NextResponse.json(
        { error: "Order request is too large" },
        { status: 413 },
      );
    }

    const rateLimit = consumeRateLimit(
      `orders:${getClientIp(request)}`,
      ORDER_RATE_LIMIT,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many order attempts. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const input = await request.json();
    const { order, token } = await createPersistedCheckoutOrder(input);
    const publicOrder = toPublicOrder(order);
    const orderPath = `/${order.locale}/order/${order.orderNo}?token=${encodeURIComponent(token)}`;

    return NextResponse.json(
      {
        order: publicOrder,
        token,
        orderPath,
      },
      { status: 201 },
    );
  } catch (error) {
    const response = toOrderApiError(error);
    if (response.status === 500) {
      console.error("[orders] create failed", error);
    }
    return NextResponse.json(
      { error: response.message },
      { status: response.status },
    );
  }
}
