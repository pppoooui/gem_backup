import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function createSupabaseAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function getCurrentAdminRole() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Admin GET routes only need to read the existing session.
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return typeof data?.role === "string" ? data.role : null;
}

export async function attachVisibleBankAccounts<T extends { id: string }>(
  methods: T[],
  loadAccounts: (paymentMethodId: string) => Promise<unknown[]>,
  canReadBankAccounts: boolean,
) {
  if (!canReadBankAccounts) {
    return methods.map((method) => ({ ...method, bank_accounts: [] }));
  }

  return Promise.all(
    methods.map(async (method) => ({
      ...method,
      bank_accounts: await loadAccounts(method.id),
    })),
  );
}

/**
 * GET /api/admin/payment-methods
 * Returns all payment methods ordered by sort_order, including their bank accounts.
 */
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "未配置 Supabase 后台权限" },
        { status: 503 },
      );
    }

    const { data: methods, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const adminRole = await getCurrentAdminRole();
    const withAccounts = await attachVisibleBankAccounts(
      methods ?? [],
      async (paymentMethodId) => {
        const { data: accounts, error: accErr } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("payment_method_id", paymentMethodId);
        if (accErr) {
          console.warn("获取收款账户失败", paymentMethodId, accErr);
          return [];
        }
        return accounts ?? [];
      },
      adminRole === "superadmin",
    );

    return NextResponse.json({ methods: withAccounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
