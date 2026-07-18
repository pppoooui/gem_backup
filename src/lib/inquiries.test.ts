import { describe, expect, it } from "vitest";
import {
  inquirySchema,
  makeWhatsAppUrl,
  normalizeInquirySize,
} from "@/lib/inquiries";

describe("customer inquiry validation", () => {
  const validInquiry = {
    contactName: "Aarav Gems",
    quantity: "5000",
    sizeMm: "5 mm",
    grade: "5A",
    email: "buyer@example.com",
    whatsapp: "+91 90000 11111",
    notes: "Need export packing.",
    locale: "en",
    website: "",
  };

  it("accepts the supported size range and grades", () => {
    const parsed = inquirySchema.parse(validInquiry);

    expect(parsed.quantity).toBe(5000);
    expect(normalizeInquirySize(parsed.sizeMm)).toBe("5 mm");
    expect(parsed.grade).toBe("5A");
  });

  it("rejects unsupported grades, sizes and contact values", () => {
    expect(() => inquirySchema.parse({ ...validInquiry, sizeMm: "13 mm" })).toThrow();
    expect(() => inquirySchema.parse({ ...validInquiry, grade: "2A" })).toThrow();
    expect(() => inquirySchema.parse({ ...validInquiry, email: "not-an-email" })).toThrow();
    expect(() => inquirySchema.parse({ ...validInquiry, website: "spam" })).toThrow();
  });

  it("only creates WhatsApp links for valid E.164-sized numbers", () => {
    expect(makeWhatsAppUrl("+86 138 0000 0000", "Hello")).toBe(
      "https://wa.me/8613800000000?text=Hello",
    );
    expect(makeWhatsAppUrl("+91", "Hello")).toBeNull();
  });
});
