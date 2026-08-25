import type { MetadataRoute } from "next";
import { VEHICLES } from "@/lib/data/vehicles";
import { CITIES } from "@/lib/cities";
import { DEALERS } from "@/lib/data/dealers";
import { GUIDES } from "@/lib/data/guides";
import { brandsWithCounts, vehicleSlug } from "@/lib/slug";

const BASE = "https://triq.ma";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { p: "", pr: 1 },
    { p: "/cars", pr: 0.95 },
    { p: "/motorcycles", pr: 0.95 },
    { p: "/search", pr: 0.85 },
    { p: "/dealers", pr: 0.8 },
    { p: "/valuation", pr: 0.8 },
    { p: "/financing", pr: 0.75 },
    { p: "/cost", pr: 0.75 },
    { p: "/compare", pr: 0.7 },
    { p: "/sell", pr: 0.85 },
    { p: "/promote", pr: 0.7 },
    { p: "/assistant", pr: 0.8 },
    { p: "/inspection", pr: 0.7 },
    { p: "/safety", pr: 0.7 },
    { p: "/guides", pr: 0.8 },
    { p: "/about", pr: 0.5 },
    { p: "/contact", pr: 0.5 },
    { p: "/help", pr: 0.5 },
    { p: "/terms", pr: 0.3 },
    { p: "/privacy", pr: 0.3 },
  ].map(({ p, pr }) => ({
    url: `${BASE}${p}`,
    changeFrequency: "daily" as const,
    priority: pr,
  }));

  const vehicles = VEHICLES.map((v) => ({
    url: `${BASE}/vehicle/${vehicleSlug(v)}`,
    lastModified: new Date(v.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const carBrands = brandsWithCounts("car").map((b) => ({
    url: `${BASE}/cars/${b.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.65,
  }));
  const motoBrands = brandsWithCounts("moto").map((b) => ({
    url: `${BASE}/motorcycles/${b.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.65,
  }));

  const dealers = DEALERS.map((d) => ({
    url: `${BASE}/dealer/${d.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const guides = GUIDES.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const cities = CITIES.map((c) => ({
    url: `${BASE}/cars?city=${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.55,
  }));

  return [...staticPages, ...vehicles, ...carBrands, ...motoBrands, ...dealers, ...guides, ...cities];
}
