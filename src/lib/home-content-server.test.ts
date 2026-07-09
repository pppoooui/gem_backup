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

  it("uses the approved factory photos and Vietnam customer by default", () => {
    expect(defaultHomeContent.aboutImage.src).toBe(
      "/media/dfc-hearts-arrows.png",
    );
    expect(defaultHomeContent.factoryImages.map((image) => image.src)).toEqual(
      expect.arrayContaining([
        "/media/dfc-factory-stock.jpeg",
        "/media/dfc-factory-sorting.jpeg",
        "/media/dfc-cz-stock.jpeg",
      ]),
    );
    expect(defaultHomeContent.testimonials.some(
      (item) => item.nameEn.includes("Vietnam"),
    )).toBe(true);
  });

  it("does not use Dubai or fancy-cut content in homepage defaults", () => {
    expect(JSON.stringify(defaultHomeContent)).not.toMatch(/Dubai|迪拜/);
    expect(JSON.stringify(defaultHomeContent)).not.toMatch(
      /Princess|公主方|Fancy cut|异形切工/,
    );
  });
});
