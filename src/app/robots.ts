import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
