import { NextResponse } from "next/server";
import {
  createCustomerSession,
  customerSessionCookie,
} from "@/lib/customer-contact-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.headers.get("cookie")?.match(
    /(?:^|;\s*)dfc_line_login_state=([^;]+)/,
  )?.[1];
  const locale =
    request.headers.get("cookie")?.match(
      /(?:^|;\s*)dfc_line_login_locale=([^;]+)/,
    )?.[1] === "zh"
      ? "zh"
      : "en";
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID?.trim();
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET?.trim();
  if (!code || !state || !expectedState || state !== expectedState || !channelId || !channelSecret) {
    return NextResponse.redirect(new URL(`/${locale}/account?auth_error=line`, url));
  }

  try {
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${url.origin}/api/auth/line/callback`,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });
    if (!tokenResponse.ok) throw new Error("LINE token exchange failed");
    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      id_token?: string;
    };
    if (!tokenData.id_token) throw new Error("LINE ID token missing");
    const profileResponse = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        id_token: tokenData.id_token,
        client_id: channelId,
      }),
    });
    if (!profileResponse.ok) throw new Error("LINE profile lookup failed");
    const profile = await profileResponse.json() as {
      sub?: string;
      name?: string;
      email?: string;
    };
    if (!profile.sub) throw new Error("LINE profile missing");
    const session = await createCustomerSession({
      provider: "line",
      providerUserId: profile.sub,
      displayName: profile.name,
      email: profile.email,
    });
    const response = NextResponse.redirect(new URL(`/${locale}/account`, url));
    response.cookies.set(customerSessionCookie, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: session.expiresAt,
    });
    response.cookies.delete("dfc_line_login_state");
    response.cookies.delete("dfc_line_login_locale");
    return response;
  } catch {
    return NextResponse.redirect(new URL(`/${locale}/account?auth_error=line`, url));
  }
}
