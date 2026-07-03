import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { products as staticProducts } from "@/data/products";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const productSchema = z.object({
  slug: z.string().transform(normalizeSlug).pipe(z.string().min(1)),
  nameEn: z.string().trim().min(1),
  shape: z.string().trim().min(1).default("Round"),
  sizeMm: z.string().trim().min(1).default("1.00 mm"),
  moq: z.coerce.number().int().positive().default(500),
  priceUsd: z.coerce.number().min(0).default(0),
  imagePath: z
    .string()
    .trim()
    .transform((value) => value || "/products/round-1mm.png")
    .default("/products/round-1mm.png"),
});

type ProductPayload = z.infer<typeof productSchema>;

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

function toManagedProduct(product: (typeof staticProducts)[number]) {
  const variant = product.variants[0];
  const priceTier = variant?.priceTiers[0];

  return {
    slug: product.slug,
    nameEn: product.nameEn,
    shape: product.shape,
    sizeMm: variant?.sizeMm ?? "",
    moq: variant?.moq ?? 0,
    priceUsd: priceTier?.priceUsd ?? 0,
    imagePath: product.imagePath,
  };
}

async function upsertProduct(payload: ProductPayload) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      product: payload,
      mode: "validated-only",
    };
  }

  const sku = payload.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  const { data: product, error: productError } = await supabase
    .from("products")
    .upsert(
      {
        slug: payload.slug,
        sku,
        name_en: payload.nameEn,
        name_zh: payload.nameEn,
        shape: payload.shape,
        material: "Cubic Zirconia",
        cut: "Excellent",
        clarity: "VS",
        grade: "5A",
        hs_code: "7104.90",
        status: "published",
        cover_image_path: payload.imagePath,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (productError || !product) {
    throw new Error(productError?.message ?? "商品保存失败");
  }

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .upsert(
      {
        product_id: product.id,
        size_mm: payload.sizeMm,
        color: "Colorless",
        clarity: "VS",
        package_unit: "pcs",
        moq: payload.moq,
        stock_status: "in_stock",
        weight_grams: 0,
      },
      { onConflict: "product_id,size_mm,color,package_unit" },
    )
    .select("id")
    .single();

  if (variantError || !variant) {
    throw new Error(variantError?.message ?? "商品规格保存失败");
  }

  const { error: priceError } = await supabase.from("price_tiers").upsert(
    {
      variant_id: variant.id,
      min_quantity: payload.moq,
      price_usd: payload.priceUsd,
      label: `${payload.moq}+ pcs`,
    },
    { onConflict: "variant_id,min_quantity" },
  );

  if (priceError) throw priceError;

  return {
    product: payload,
    mode: "supabase",
  };
}

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({
        products: staticProducts.map(toManagedProduct),
        mode: "fallback",
      });
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        slug,
        name_en,
        shape,
        cover_image_path,
        product_variants (
          id,
          size_mm,
          moq,
          price_tiers (
            min_quantity,
            price_usd
          )
        )
      `,
      )
      .neq("status", "archived")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      products:
        data?.map((product) => {
          const variants = [...(product.product_variants ?? [])].sort((a, b) =>
            (a.size_mm ?? "").localeCompare(b.size_mm ?? "", undefined, { numeric: true }),
          );
          const variant = variants[0];
          const priceTiers = [...(variant?.price_tiers ?? [])].sort(
            (a, b) => Number(a.min_quantity) - Number(b.min_quantity),
          );
          const priceTier = priceTiers[0];

          return {
            slug: product.slug,
            nameEn: product.name_en,
            shape: product.shape,
            sizeMm: variant?.size_mm ?? "",
            moq: variant?.moq ?? 0,
            priceUsd: priceTier?.price_usd ?? 0,
            imagePath: product.cover_image_path ?? "/products/round-1mm.png",
          };
        }) ?? [],
      mode: "supabase",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "商品加载失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = productSchema.parse(await request.json());
    const result = await upsertProduct(payload);
    revalidatePath("/en/products");
    revalidatePath("/zh/products");
    revalidatePath(`/en/products/${payload.slug}`);
    revalidatePath(`/zh/products/${payload.slug}`);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues.map((issue) => issue.message).join("; ")
        : error instanceof Error
          ? error.message
          : "商品保存失败";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ deleted: slug, mode: "validated-only" });
    }

    const { error } = await supabase
      .from("products")
      .update({ status: "archived" })
      .eq("slug", slug);

    if (error) throw error;

    revalidatePath("/en/products");
    revalidatePath("/zh/products");
    revalidatePath(`/en/products/${slug}`);
    revalidatePath(`/zh/products/${slug}`);

    return NextResponse.json({ deleted: slug, mode: "supabase" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "商品删除失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
