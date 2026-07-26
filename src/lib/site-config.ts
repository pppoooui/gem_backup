export const PUBLIC_SITE_NAME = "DFC Cubic Zirconia Factory";
export const DEFAULT_SITE_URL = "https://dfccz.top";
export const PUBLIC_CONTACT_EMAIL = "emilydfccz@gmail.com";
export const PUBLIC_ADDRESS_EN = "Wuzhou, China";
export const PUBLIC_ADDRESS_ZH = "中国梧州";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? DEFAULT_SITE_URL;
