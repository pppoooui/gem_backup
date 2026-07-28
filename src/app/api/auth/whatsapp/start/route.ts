import { NextResponse } from "next/server";
import { z } from "zod";
import { startWhatsAppLogin } from "@/lib/customer-contact-auth";

const schema = z.object({ phone: z.string().trim().min(7).max(30) });

export async function POST(request: Request) {
  try {
    const { phone } = schema.parse(await request.json());
    const result = await startWhatsAppLogin(phone);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start login" },
      { status: 400 },
    );
  }
}
