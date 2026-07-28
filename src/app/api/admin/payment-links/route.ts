import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createCustomPaymentLink,
  listCustomPaymentLinks,
} from "@/lib/custom-payment-links";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^https?:\/\//i.test(value),
    "Payment URL must start with http:// or https://",
  )
  .optional();

const createSchema = z.object({
  locale: z.enum(["en", "zh"]).default("en"),
  title: z.string().trim().min(2).max(160),
  specification: z.string().trim().min(2).max(4000),
  quantity: z.string().trim().min(1).max(160),
  amountUsd: z.number().positive().max(10_000_000),
  customerName: z.string().trim().max(160).optional(),
  customerWhatsApp: z.string().trim().max(40).optional(),
  note: z.string().trim().max(2000).optional(),
  paymentUrl: optionalUrl,
  expiresAt: z.string().datetime().optional(),
});

export async function GET() {
  try {
    return NextResponse.json({ links: await listCustomPaymentLinks() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "付款链接加载失败" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const input = createSchema.parse(await request.json());
    const link = await createCustomPaymentLink(input);
    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message
        : error instanceof Error
          ? error.message
          : "付款链接创建失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
