import { NextResponse } from "next/server";
import {
  getCustomPaymentLinkByToken,
  markCustomPaymentSubmitted,
} from "@/lib/custom-payment-links";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const link = await getCustomPaymentLinkByToken(token);
  if (!link) {
    return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
  }
  return NextResponse.json({ link });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = (await request.json()) as { action?: string };
    if (body.action !== "payment_submitted") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    const link = await markCustomPaymentSubmitted(token);
    if (!link) {
      return NextResponse.json(
        { error: "Payment link is not active" },
        { status: 409 },
      );
    }
    return NextResponse.json({ link });
  } catch {
    return NextResponse.json(
      { error: "Unable to update payment status" },
      { status: 400 },
    );
  }
}
