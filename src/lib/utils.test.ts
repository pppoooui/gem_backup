import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/lib/utils";

describe("serializeJsonLd", () => {
  it("escapes less-than characters so JSON-LD cannot close the script tag", () => {
    const value = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(value).not.toContain("</script>");
    expect(value).toContain("\\u003c/script>");
  });
});
