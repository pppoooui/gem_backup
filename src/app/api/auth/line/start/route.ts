import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export async function GET(request: Request) {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID?.trim();
  if (!channelId) {
    return NextResponse.json(
      { error: "LINE Login is not configured" },
      { status: 503 },
    );
  }
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "zh" ? "zh" : "en";
  const state = randomBytes(24).toString("base64url");
  const callback = `${url.origin}/api/auth/line/callback`;
  const authorize = new URL("https://access.line.me/oauth2/v2.1/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", channelId);
  authorize.searchParams.set("redirect_uri", callback);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("scope", "openid profile email");
  const response = NextResponse.redirect(authorize);
  response.cookies.set("dfc_line_login_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("dfc_line_login_locale", locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
