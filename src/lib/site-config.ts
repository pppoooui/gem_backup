export const PUBLIC_SITE_NAME = "DFC Cubic Zirconia Factory";
export const DEFAULT_SITE_URL = "https://dfccz.top";
export const PUBLIC_CONTACT_EMAIL = "sales@dfccz.top";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? DEFAULT_SITE_URL;
