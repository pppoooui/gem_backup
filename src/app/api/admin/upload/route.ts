import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const ALLOWED_TYPES = new Set<string>(ALLOWED_MIME_TYPES);
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

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

function safeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function detectAllowedImageMime(
  buffer: ArrayBuffer,
): AllowedMimeType | null {
  const bytes = new Uint8Array(buffer);
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (isJpeg) return "image/jpeg";
  if (isPng) return "image/png";
  if (isWebp) return "image/webp";
  return null;
}

async function ensurePublicImageBucket(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  bucket: string,
) {
  const { error: getError } = await supabase.storage.getBucket(bucket);
  if (!getError) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: [...ALLOWED_MIME_TYPES],
  });

  if (createError && !/already exists/i.test(createError.message)) {
    throw createError;
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "products").replace(/[^a-z0-9-]/gi, "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择要上传的图片" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "只支持 JPG、PNG、WebP 图片" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "图片不能超过 5MB" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const detectedMime = detectAllowedImageMime(fileBuffer);

    if (!detectedMime || detectedMime !== file.type) {
      return NextResponse.json(
        { error: "图片内容与文件类型不匹配" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const bucket = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET ?? "product-images";

    if (!supabase) {
      return NextResponse.json(
        { error: "图片上传需要配置 Supabase service role" },
        { status: 503 },
      );
    }

    await ensurePublicImageBucket(supabase, bucket);

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${folder}/${randomUUID()}-${safeName(file.name) || "image"}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      path,
      publicUrl: data.publicUrl,
      bucket,
      mode: "supabase",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片上传失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
