import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const importRowSchema = z.object({
  slug: z.string().transform(normalizeSlug).pipe(z.string().min(1, "缺少 slug")),
  nameEn: z.string().min(1, "缺少商品名称"),
  nameZh: z.string().optional().default(""),
  shape: z.string().min(1, "缺少形状"),
  material: z.string().optional().default("Cubic Zirconia"),
  cut: z.string().optional().default("Brilliant"),
  grade: z.enum(["5A", "3A", "2A"]).optional().default("5A"),
  hsCode: z.string().optional().default(""),
  sizeMm: z.string().optional().default(""),
  color: z.string().optional().default("Colorless"),
  packageUnit: z.string().optional().default("pcs"),
  moq: z.coerce.number().int().positive().optional().default(500),
  priceUsd: z.coerce.number().min(0).optional().default(0),
  weightGrams: z.coerce.number().min(0).optional().default(0),
});

const importPayloadSchema = z.object({
  rows: z.array(importRowSchema).min(1, "至少需要一行数据"),
});

export type ImportRow = z.infer<typeof importRowSchema>;

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

async function importProductRows(rows: ImportRow[]) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      imported: rows.length,
      rows,
      mode: "validated-only",
    };
  }

  const imported: { slug: string; productId: string; variantId: string }[] = [];

  for (const row of rows) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .upsert(
        {
          slug: row.slug,
          name_en: row.nameEn,
          name_zh: row.nameZh || row.nameEn,
          shape: row.shape,
          material: row.material,
          cut: row.cut,
          grade: row.grade,
          hs_code: row.hsCode || null,
          status: "published",
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (productError || !product) {
      throw new Error(productError?.message ?? `导入 ${row.slug} 失败`);
    }

    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .upsert(
        {
          product_id: product.id,
          size_mm: row.sizeMm || "1.00 mm",
          color: row.color,
          package_unit: row.packageUnit,
          moq: row.moq,
          stock_status: "in_stock",
          weight_grams: row.weightGrams,
        },
        { onConflict: "product_id,size_mm,color,package_unit" },
      )
      .select("id")
      .single();

    if (variantError || !variant) {
      throw new Error(variantError?.message ?? `导入 ${row.slug} 规格失败`);
    }

    const { error: priceError } = await supabase
      .from("price_tiers")
      .upsert(
        {
          variant_id: variant.id,
          min_quantity: row.moq,
          price_usd: row.priceUsd,
          label: `${row.moq}+ ${row.packageUnit}`,
        },
        { onConflict: "variant_id,min_quantity" },
      );

    if (priceError) {
      throw new Error(priceError.message);
    }

    imported.push({
      slug: row.slug,
      productId: product.id,
      variantId: variant.id,
    });
  }

  return {
    imported: imported.length,
    rows: imported,
    mode: "supabase",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rows } = importPayloadSchema.parse(body);
    const result = await importProductRows(rows);
    revalidatePath("/en/products");
    revalidatePath("/zh/products");

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : error instanceof Error
          ? error.message
          : "导入数据解析失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
