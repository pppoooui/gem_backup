import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { AdminInquiry } from "@/lib/inquiries";

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

export async function listAdminInquiries(): Promise<AdminInquiry[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("inquiries")
    .select("id,contact_name,quantity,size_mm,grade,email,whatsapp,notes,locale,status,created_at")
    .order("created_at", { ascending: false })
    .limit(250);

  if (error || !data) {
    console.error("[inquiries] unable to load inquiries", error?.message);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    contactName: item.contact_name,
    quantity: Number(item.quantity),
    sizeMm: item.size_mm,
    grade: item.grade as AdminInquiry["grade"],
    email: item.email,
    whatsapp: item.whatsapp,
    notes: item.notes ?? "",
    locale: item.locale as AdminInquiry["locale"],
    status: item.status as AdminInquiry["status"],
    createdAt: item.created_at,
  }));
}
