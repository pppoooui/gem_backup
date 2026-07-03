import { describe, expect, it } from "vitest";
import { detectAllowedImageMime } from "./route";

describe("detectAllowedImageMime", () => {
  it("detects supported image signatures", () => {
    expect(
      detectAllowedImageMime(
        new Uint8Array([0xff, 0xd8, 0xff, 0xe0]).buffer,
      ),
    ).toBe("image/jpeg");
    expect(
      detectAllowedImageMime(
        new Uint8Array([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ]).buffer,
      ),
    ).toBe("image/png");
    expect(
      detectAllowedImageMime(
        new Uint8Array([
          0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45,
          0x42, 0x50,
        ]).buffer,
      ),
    ).toBe("image/webp");
  });

  it("rejects content that only pretends to be an image", () => {
    const bytes = new TextEncoder().encode("<script>alert(1)</script>");

    expect(detectAllowedImageMime(bytes.buffer)).toBeNull();
  });
});
