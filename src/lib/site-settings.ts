export type ManagedSiteSetting = {
  key: string;
  value: string;
  labelEn: string;
  descriptionEn: string;
  isToggle?: boolean;
};

export const managedSiteSettings: ManagedSiteSetting[] = [
  {
    key: "whatsapp_number",
    value: "",
    labelEn: "WhatsApp number",
    descriptionEn: "E.164 number used by the public WhatsApp button, for example +8613800000000.",
  },
  {
    key: "home_show_history",
    value: "false",
    labelEn: "Show company journey",
    descriptionEn: "Shows the Our journey section on the homepage.",
    isToggle: true,
  },
  {
    key: "home_show_recognition",
    value: "false",
    labelEn: "Show industry recognition",
    descriptionEn: "Shows the certifications and quality records section on the homepage.",
    isToggle: true,
  },
  {
    key: "catalog_show_product_details",
    value: "false",
    labelEn: "Show product specifications",
    descriptionEn: "Shows product size, grade, MOQ and selection controls. Default range is 1-12 mm, grades 3A and 5A.",
    isToggle: true,
  },
  {
    key: "catalog_show_prices",
    value: "false",
    labelEn: "Show product prices",
    descriptionEn: "Shows public prices and enables the cart. Keep hidden until public prices are confirmed.",
    isToggle: true,
  },
  {
    key: "min_order_amount_usd",
    value: "100",
    labelEn: "Minimum order (USD)",
    descriptionEn: "Orders below this are rejected.",
  },
  {
    key: "business_name_en",
    value: "DFC Cubic Zirconia Factory",
    labelEn: "Business name (EN)",
    descriptionEn: "Shown in PI and email.",
  },
  {
    key: "business_name_zh",
    value: "DFC Cubic Zirconia Factory",
    labelEn: "Business name (ZH)",
    descriptionEn: "Shown in Chinese admin references.",
  },
  {
    key: "default_currency",
    value: "USD",
    labelEn: "Default currency",
    descriptionEn: "USD for approved quotes.",
  },
  {
    key: "reference_currency",
    value: "INR",
    labelEn: "Reference currency",
    descriptionEn: "Reference currency for India buyers.",
  },
];

export const managedSiteSettingKeys = new Set(
  managedSiteSettings.map((setting) => setting.key),
);

export function isEnabledSetting(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export function mergeManagedSiteSettings(
  saved: Array<Partial<ManagedSiteSetting> & { key: string }> = [],
): ManagedSiteSetting[] {
  const savedByKey = new Map(saved.map((setting) => [setting.key, setting]));
  const managed = managedSiteSettings.map((setting) => {
    const savedSetting = savedByKey.get(setting.key);
    return {
      ...setting,
      value: savedSetting?.value ?? setting.value,
      labelEn: savedSetting?.labelEn ?? setting.labelEn,
      descriptionEn: savedSetting?.descriptionEn ?? setting.descriptionEn,
    };
  });

  const extras = saved
    .filter((setting) => !managedSiteSettingKeys.has(setting.key))
    .map((setting) => ({
      key: setting.key,
      value: setting.value ?? "",
      labelEn: setting.labelEn ?? setting.key,
      descriptionEn: setting.descriptionEn ?? "",
    }));

  return [...managed, ...extras];
}
