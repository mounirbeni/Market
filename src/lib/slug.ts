import { VEHICLES } from "./data/vehicles";
import type { Vehicle } from "./types";

/** تحويل نص لاتيني إلى صيغة رابط */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ë/g, "e")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** رابط المركبة: bmw-serie-3-2016-c041 */
export function vehicleSlug(v: Vehicle): string {
  return `${slugify(v.make)}-${slugify(v.model)}-${v.year}-${v.id}`;
}

export function vehicleHref(v: Vehicle): string {
  return `/vehicle/${vehicleSlug(v)}`;
}

/** استخراج المركبة من الرابط عبر المعرّف في آخره */
export function vehicleFromSlug(slug: string): Vehicle | undefined {
  const id = slug.split("-").pop() ?? "";
  return VEHICLES.find((v) => v.id === id);
}

export const brandSlug = (make: string) => slugify(make);

export function brandFromSlug(slug: string, kind?: "car" | "moto"): string | undefined {
  const pool = kind ? VEHICLES.filter((v) => v.kind === kind) : VEHICLES;
  return pool.find((v) => brandSlug(v.make) === slug)?.make;
}

/** الماركات مع عدد الإعلانات */
export function brandsWithCounts(kind: "car" | "moto" | "all" = "all") {
  const pool = kind === "all" ? VEHICLES : VEHICLES.filter((v) => v.kind === kind);
  const map = new Map<string, number>();
  for (const v of pool) map.set(v.make, (map.get(v.make) ?? 0) + 1);
  return [...map.entries()]
    .map(([make, count]) => ({ make, slug: brandSlug(make), count }))
    .sort((a, b) => b.count - a.count || a.make.localeCompare(b.make));
}
