import { CATALOG, makesOf } from "./data/catalog";
import type { Vehicle, VehicleKind } from "./types";

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

export const brandSlug = (make: string) => slugify(make);

/**
 * الماركة من الرابط.
 *
 * كنقلّبو فالكتالوج المرجعي ماشي فالإعلانات: صفحة الماركة خاصها
 * تخدم حتى إلا ماكانش فيها حتى إعلان دابا — كتبيّن حالة فارغة
 * بدل 404، والزائر كيفهم أنّ الماركة معروفة والسلعة هي الناقصة.
 */
export function brandFromSlug(slug: string, kind?: VehicleKind): string | undefined {
  return CATALOG.find((c) => (!kind || c.kind === kind) && brandSlug(c.make) === slug)?.make;
}

/** الماركات ديال نوع معيّن — من الكتالوج المرجعي */
export function brandsOf(kind: VehicleKind | "all" = "all") {
  const makes = kind === "all" ? makesOf() : makesOf(kind);
  return makes.map((make) => ({ make, slug: brandSlug(make) }));
}
