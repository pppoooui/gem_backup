import { describe, expect, it } from "vitest";
import {
  DEFAULT_SITE_URL,
  PUBLIC_ADDRESS_EN,
  PUBLIC_ADDRESS_ZH,
  PUBLIC_CONTACT_EMAIL,
  PUBLIC_SITE_NAME,
} from "@/lib/site-config";

describe("public site configuration", () => {
  it("uses the approved provisional brand, domain, and contact email", () => {
    expect(PUBLIC_SITE_NAME).toBe("DFC Cubic Zirconia Factory");
    expect(DEFAULT_SITE_URL).toBe("https://dfccz.top");
    expect(PUBLIC_CONTACT_EMAIL).toBe("emilydfccz@gmail.com");
    expect(PUBLIC_ADDRESS_EN).toBe("Wuzhou, China");
    expect(PUBLIC_ADDRESS_ZH).toBe("中国梧州");
  });
});
