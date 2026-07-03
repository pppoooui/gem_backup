import { describe, expect, it } from "vitest";
import { defaultHomeContent } from "@/lib/home-content";
import { mergeHomeContent } from "@/lib/home-content-server";

describe("mergeHomeContent", () => {
  it("falls back to default content for empty values", () => {
    expect(mergeHomeContent(null)).toEqual(defaultHomeContent);
    expect(mergeHomeContent({})).toEqual(defaultHomeContent);
  });

  it("keeps provided editable sections and fills missing sections", () => {
    const merged = mergeHomeContent({
      aboutImage: { src: "/custom.jpg", en: "Custom", zh: "自定义" },
    });

    expect(merged.aboutImage.src).toBe("/custom.jpg");
    expect(merged.factoryImages).toEqual(defaultHomeContent.factoryImages);
    expect(merged.milestones).toEqual(defaultHomeContent.milestones);
  });

  it("keeps uploaded certificate images from saved home content", () => {
    const merged = mergeHomeContent({
      certificates: [
        {
          image: "https://example.com/iso.jpg",
          code: "ISO 9001",
          labelEn: "Quality Management",
          labelZh: "质量管理体系",
        },
      ],
    });

    expect(merged.certificates[0].image).toBe("https://example.com/iso.jpg");
  });
});
