import { describe, expect, it } from "vitest";
import {
  isEnabledSetting,
  managedSiteSettings,
  mergeManagedSiteSettings,
} from "@/lib/site-settings";

describe("managed storefront settings", () => {
  it("keeps public sections and catalog prices hidden by default", () => {
    const values = new Map(managedSiteSettings.map((setting) => [setting.key, setting.value]));

    expect(values.get("home_show_history")).toBe("false");
    expect(values.get("home_show_recognition")).toBe("false");
    expect(values.get("catalog_show_product_details")).toBe("false");
    expect(values.get("catalog_show_prices")).toBe("false");
  });

  it("merges saved setting values without dropping managed defaults", () => {
    const merged = mergeManagedSiteSettings([
      { key: "home_show_history", value: "true" },
      { key: "site_url", value: "https://dfccz.top", labelEn: "Site URL" },
    ]);

    expect(merged.find((setting) => setting.key === "home_show_history")?.value).toBe("true");
    expect(merged.find((setting) => setting.key === "catalog_show_prices")?.value).toBe("false");
    expect(merged.find((setting) => setting.key === "site_url")?.value).toBe("https://dfccz.top");
  });

  it("only treats true as an enabled switch value", () => {
    expect(isEnabledSetting("true")).toBe(true);
    expect(isEnabledSetting(" TRUE ")).toBe(true);
    expect(isEnabledSetting("1")).toBe(false);
    expect(isEnabledSetting("false")).toBe(false);
  });
});
