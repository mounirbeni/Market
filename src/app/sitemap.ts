import type { MetadataRoute } from "next";
import { VEHICLES } from "@/lib/data/vehicles";
import { CITIES } from "@/lib/cities";

const BASE = "https://triq.ma";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "", "/vehicles", "/estimate", "/cost", "/compare", "/sell", "/inspection", "/safety",
  ].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const vehicles = VEHICLES.map((v) => ({
    url: `${BASE}/vehicles/${v.id}`,
    lastModified: new Date(v.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const cities = CITIES.map((c) => ({
    url: `${BASE}/vehicles?city=${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...vehicles, ...cities];
}
