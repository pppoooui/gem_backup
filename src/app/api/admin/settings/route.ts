import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  managedSiteSettings,
  mergeManagedSiteSettings,
} from "@/lib/site-settings";

const settingSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string(),
  labelEn: z.string().trim().optional(),
  descriptionEn: z.string().trim().optional(),
});

const settingsPayloadSchema = z.object({
  settings: z.array(settingSchema).min(1),
});

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

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({
        settings: managedSiteSettings,
        mode: "fallback",
      });
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("key,value,label_en,description_en")
      .order("key", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      settings: mergeManagedSiteSettings(
        data?.map((item) => ({
          key: item.key,
          value: item.value,
          labelEn: item.label_en ?? item.key,
          descriptionEn: item.description_en ?? "",
        })) ?? [],
      ),
      mode: "supabase",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "设置加载失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { settings } = settingsPayloadSchema.parse(await request.json());
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({
        saved: settings.length,
        mode: "validated-only",
      });
    }

    const { error } = await supabase.from("site_settings").upsert(
      settings.map((item) => ({
        key: item.key,
        value: item.value,
        label_en: item.labelEn ?? item.key,
        description_en: item.descriptionEn ?? null,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "key" },
    );

    if (error) throw error;

    revalidatePath("/", "layout");

    return NextResponse.json({
      saved: settings.length,
      mode: "supabase",
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues.map((issue) => issue.message).join("; ")
        : error instanceof Error
          ? error.message
          : "设置保存失败";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
