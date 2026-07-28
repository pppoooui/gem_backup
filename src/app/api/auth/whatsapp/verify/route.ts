import { NextResponse } from "next/server";
import { z } from "zod";
import {
  customerSessionCookie,
  verifyWhatsAppLogin,
} from "@/lib/customer-contact-auth";

const schema = z.object({
  challenge: z.string().min(20),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const result = await verifyWhatsAppLogin(input.challenge, input.code);
    const response = NextResponse.json({ signedIn: true });
    response.cookies.set(customerSessionCookie, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: result.expiresAt,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify login" },
      { status: 400 },
    );
  }
}
