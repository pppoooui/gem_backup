import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { defaultHomeContent } from "@/lib/home-content";
import { getHomeContent, saveHomeContent } from "@/lib/home-content-server";

const imageSchema = z.object({
  src: z.string().trim().min(1),
  en: z.string().trim().min(1),
  zh: z.string().trim().min(1),
});

const milestoneSchema = z.object({
  year: z.string().trim().min(1),
  image: z.string().trim().min(1),
  titleEn: z.string().trim().min(1),
  titleZh: z.string().trim().min(1),
  bodyEn: z.string().trim().min(1),
  bodyZh: z.string().trim().min(1),
});

const certificateSchema = z.object({
  image: z.string().trim().optional().default(""),
  code: z.string().trim().min(1),
  labelEn: z.string().trim().min(1),
  labelZh: z.string().trim().min(1),
});

const testimonialSchema = z.object({
  image: z.string().trim().min(1),
  quoteEn: z.string().trim().min(1),
  quoteZh: z.string().trim().min(1),
  nameEn: z.string().trim().min(1),
  nameZh: z.string().trim().min(1),
});

const contentSchema = z.object({
  aboutImage: imageSchema,
  milestones: z.array(milestoneSchema).min(1),
  factoryImages: z.array(imageSchema).min(1),
  certificates: z.array(certificateSchema).min(1),
  testimonials: z.array(testimonialSchema).min(1),
});

export async function GET() {
  return NextResponse.json({
    content: await getHomeContent(),
    defaults: defaultHomeContent,
  });
}

export async function POST(request: Request) {
  try {
    const content = contentSchema.parse(await request.json());
    const result = await saveHomeContent(content);
    revalidatePath("/en");
    revalidatePath("/zh");
    return NextResponse.json({ saved: true, content, ...result });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")
        : error instanceof Error
          ? error.message
          : "首页内容保存失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
