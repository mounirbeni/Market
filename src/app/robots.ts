import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/favorites"] },
    sitemap: "https://tariqmaroc.com/sitemap.xml",
  };
}
