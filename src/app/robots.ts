import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dfcgem.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/en/", "/zh/", "/api/health"],
        disallow: [
          "/admin/",
          "/api/admin/",
          "/en/cart",
          "/zh/cart",
          "/en/checkout",
          "/zh/checkout",
          "/en/order/",
          "/zh/order/",
          "/api/orders/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
