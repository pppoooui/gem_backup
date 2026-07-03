import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function hasSupabaseAuthConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminApi = pathname.startsWith("/api/admin");

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  function rejectAdminRequest(status: number, error: string) {
    if (isAdminApi) {
      return NextResponse.json({ error }, { status });
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", error);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!hasSupabaseAuthConfig()) {
    if (process.env.NODE_ENV === "production") {
      return rejectAdminRequest(503, "missing_supabase_env");
    }

    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return rejectAdminRequest(401, "not_authenticated");
  }

  const { data: adminData } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!adminData) {
    await supabase.auth.signOut();
    return rejectAdminRequest(403, "not_admin");
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin", "/api/admin/:path*"],
};
