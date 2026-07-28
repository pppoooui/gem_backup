import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  customerSessionCookie,
  deleteCustomerSession,
  resolveCustomerSession,
} from "@/lib/customer-contact-auth";

export async function GET() {
  const token = (await cookies()).get(customerSessionCookie)?.value;
  const session = await resolveCustomerSession(token);
  return NextResponse.json({ session });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(customerSessionCookie)?.value;
  await deleteCustomerSession(token);
  const response = NextResponse.json({ signedOut: true });
  response.cookies.delete(customerSessionCookie);
  return response;
}
