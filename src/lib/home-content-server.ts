import "server-only";

import { createClient } from "@supabase/supabase-js";
import { defaultHomeContent, type HomeContent } from "@/lib/home-content";

const HOME_CONTENT_KEY = "home_content_json";

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

export function mergeHomeContent(value: unknown): HomeContent {
  if (!value || typeof value !== "object") return defaultHomeContent;
  const input = value as Partial<HomeContent>;

  return {
    aboutImage: input.aboutImage ?? defaultHomeContent.aboutImage,
    milestones:
      Array.isArray(input.milestones) && input.milestones.length > 0
        ? input.milestones
        : defaultHomeContent.milestones,
    factoryImages:
      Array.isArray(input.factoryImages) && input.factoryImages.length > 0
        ? input.factoryImages
        : defaultHomeContent.factoryImages,
    certificates:
      Array.isArray(input.certificates) && input.certificates.length > 0
        ? input.certificates
        : defaultHomeContent.certificates,
    testimonials:
      Array.isArray(input.testimonials) && input.testimonials.length > 0
        ? input.testimonials
        : defaultHomeContent.testimonials,
  };
}

export async function getHomeContent(): Promise<HomeContent> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return defaultHomeContent;

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", HOME_CONTENT_KEY)
    .maybeSingle();

  if (error || !data?.value) return defaultHomeContent;

  try {
    return mergeHomeContent(JSON.parse(data.value));
  } catch {
    return defaultHomeContent;
  }
}

export async function saveHomeContent(content: HomeContent) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { mode: "validated-only" as const };

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: HOME_CONTENT_KEY,
      value: JSON.stringify(content),
      label_en: "Home page content",
      label_zh: "首页内容",
      description_en: "Editable homepage image and proof sections",
      description_zh: "可编辑首页图片与证明区",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) throw error;
  return { mode: "supabase" as const };
}
