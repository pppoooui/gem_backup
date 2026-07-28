import { NextResponse } from "next/server";
import { z } from "zod";
import { updateCustomPaymentLinkStatus } from "@/lib/custom-payment-links";

const updateSchema = z.object({
  status: z.enum(["active", "payment_submitted", "paid", "cancelled"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = updateSchema.parse(await request.json());
    const link = await updateCustomPaymentLinkStatus(id, status);
    if (!link) {
      return NextResponse.json({ error: "未找到付款链接" }, { status: 404 });
    }
    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "付款链接状态更新失败",
      },
      { status: 400 },
    );
  }
}
