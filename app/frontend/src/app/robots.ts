import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/client-dashboard/",
          "/dashboard/",
          "/test-sdk/",
          "/checkout/",
        ],
      },
    ],
    sitemap: "https://settlr.dev/sitemap.xml",
  };
}
