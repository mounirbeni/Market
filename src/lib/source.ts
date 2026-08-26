import "server-only";
import type { Seller, Vehicle } from "./types";
import { applyFilters, type Filters } from "./search";
import { facetsFromSeed, type Facets } from "./facets";
import type { CatalogEntry } from "./source-types";
import { VEHICLES } from "./data/vehicles";
import { sellerById } from "./data/sellers";
import { brandsWithCounts } from "./slug";
import { trustOf } from "./market";

/* ============================================================
   مصدر البيانات الموحّد

   · إلا كانت قاعدة البيانات موصولة → كنقراو منها.
   · إلا ماكانتش → كنرجعو للبيانات المرفقة (نفس اللي كان).

   بهاد الطريقة الموقع كيخدم قبل وبعد ربط قاعدة البيانات، بلا أي
   تراجع، والانتقال كيوقع بمجرد ضبط DATABASE_URL.
   ============================================================ */

export const usingDb = () => Boolean(process.env.DATABASE_URL);

/** كنحمّلو وحدة قاعدة البيانات كسولاً — الاستيراد الثابت كيجرّ pg للبناء */
async function db() {
  return import("./db/listings");
}

export interface VehiclePage {
  items: Vehicle[];
  total: number;
}

/** البحث الرئيسي مع الترقيم */
export async function findVehicles(
  filters: Partial<Filters>,
  opts: { limit?: number; offset?: number } = {},
): Promise<VehiclePage> {
  const { limit = 24, offset = 0 } = opts;

  if (!usingDb()) {
    const all = applyFilters(filters);
    return { items: all.slice(offset, offset + limit), total: all.length };
  }

  try {
    const { searchListings, rowToVehicle } = await db();
    const { rows, total } = await searchListings(filters, { limit, offset });
    return { items: rows.map((r) => rowToVehicle(r)), total };
  } catch (e) {
    console.error("[source] فشل استعلام قاعدة البيانات، كنرجعو للبيانات المرفقة:", e);
    const all = applyFilters(filters);
    return { items: all.slice(offset, offset + limit), total: all.length };
  }
}

/** كل النتائج بلا ترقيم — للأقسام الصغيرة (مميزة، مشابهة…) */
export async function findAll(filters: Partial<Filters>, limit = 24): Promise<Vehicle[]> {
  return (await findVehicles(filters, { limit })).items;
}

/** مركبة وحدة بالـslug ولا بالمرجع، مع البائع */
export async function getVehicle(
  key: string,
): Promise<{ vehicle: Vehicle; seller: Seller } | null> {
  if (!usingDb()) {
    const { vehicleFromSlug } = await import("./slug");
    const v = vehicleFromSlug(key) ?? VEHICLES.find((x) => x.id === key);
    return v ? { vehicle: v, seller: sellerById(v.sellerId) } : null;
  }

  try {
    const { getListingBySlug, rowToVehicle, getSellerOf } = await db();
    const found = await getListingBySlug(key);
    if (!found) return null;
    const history = (found.history as unknown as {
      event_date: string; type: string; label: string; km: number | null; detail: string | null;
    }[]).map((h) => ({
      date: h.event_date,
      type: h.type as Vehicle["history"][number]["type"],
      label: h.label,
      km: h.km ?? undefined,
      detail: h.detail ?? undefined,
    }));
    const media = (found.media as unknown as {
      kind: "photo" | "video"; url: string; thumb_url: string | null;
      width: number | null; height: number | null;
    }[]).map((m) => ({
      kind: m.kind,
      url: m.url,
      thumbUrl: m.thumb_url ?? undefined,
      width: m.width ?? undefined,
      height: m.height ?? undefined,
    }));
    const seller = await getSellerOf(key);
    if (!seller) return null;
    return { vehicle: rowToVehicle(found.listing, history, media), seller };
  } catch (e) {
    console.error("[source] فشل جلب المركبة، كنرجعو للبيانات المرفقة:", e);
    const { vehicleFromSlug } = await import("./slug");
    const v = vehicleFromSlug(key) ?? VEHICLES.find((x) => x.id === key);
    return v ? { vehicle: v, seller: sellerById(v.sellerId) } : null;
  }
}

/** الماركات مع العدد */
export async function getBrands(kind?: "car" | "moto") {
  if (!usingDb()) return brandsWithCounts(kind ?? "all");

  try {
    const { brandCounts } = await db();
    const rows = await brandCounts(kind);
    const { brandSlug } = await import("./slug");
    return rows.map((r) => ({
      make: r.make,
      slug: brandSlug(r.make),
      count: Number(r.n),
    }));
  } catch (e) {
    console.error("[source] فشل جلب الماركات:", e);
    return brandsWithCounts(kind ?? "all");
  }
}

/** كل الـslugs — للتوليد المسبق */
export async function getAllSlugs(): Promise<string[]> {
  if (!usingDb()) {
    const { vehicleSlug } = await import("./slug");
    return VEHICLES.map(vehicleSlug);
  }
  try {
    const { allListingSlugs } = await db();
    return await allListingSlugs();
  } catch {
    const { vehicleSlug } = await import("./slug");
    return VEHICLES.map(vehicleSlug);
  }
}

/** تسجيل مشاهدة — كيتجاهل الفشل، ماشي حرج */
export async function trackView(listingRef: string, visitorKey: string) {
  if (!usingDb()) return;
  try {
    const { recordViewByRef } = await db();
    await recordViewByRef(listingRef, visitorKey);
  } catch {
    /* عدّاد المشاهدات ماشي حرج */
  }
}

export interface SiteStats {
  cars: number;
  motos: number;
  byBody: Record<string, number>;
  byCity: Record<string, number>;
  makes: string[];
  avgTrust: number;
}

/** إحصائيات الصفحة الرئيسية */
export async function getStats(): Promise<SiteStats> {
  if (!usingDb()) return statsFromSeed();
  try {
    const { aggregates } = await db();
    return await aggregates();
  } catch (e) {
    console.error("[source] فشل جلب الإحصائيات:", e);
    return statsFromSeed();
  }
}

function statsFromSeed(): SiteStats {
  const byBody: Record<string, number> = {};
  const byCity: Record<string, number> = {};
  for (const v of VEHICLES) {
    byBody[v.body] = (byBody[v.body] ?? 0) + 1;
    byCity[v.city] = (byCity[v.city] ?? 0) + 1;
  }
  return {
    cars: VEHICLES.filter((v) => v.kind === "car").length,
    motos: VEHICLES.filter((v) => v.kind === "moto").length,
    byBody,
    byCity,
    makes: Array.from(new Set(VEHICLES.map((v) => v.make))).sort(),
    avgTrust: Math.round(
      VEHICLES.reduce((s, v) => s + trustOf(v).score, 0) / VEHICLES.length,
    ),
  };
}

/** عدد إعلانات كل وكيل */
export async function getDealerCounts(): Promise<Record<string, number>> {
  if (!usingDb()) {
    const out: Record<string, number> = {};
    for (const v of VEHICLES) out[v.sellerId] = (out[v.sellerId] ?? 0) + 1;
    return out;
  }
  try {
    const { dealerListingCounts } = await db();
    return await dealerListingCounts();
  } catch {
    const out: Record<string, number> = {};
    for (const v of VEHICLES) out[v.sellerId] = (out[v.sellerId] ?? 0) + 1;
    return out;
  }
}

/** إعلانات وكيل */
export async function getDealerListings(slug: string, sellerId: string): Promise<Vehicle[]> {
  if (!usingDb()) return VEHICLES.filter((v) => v.sellerId === sellerId);
  try {
    const { listingsOfDealer, rowToVehicle } = await db();
    const rows = await listingsOfDealer(slug);
    return rows.map((r) => rowToVehicle(r));
  } catch {
    return VEHICLES.filter((v) => v.sellerId === sellerId);
  }
}

/** مركبات بمجموعة معرّفات — كترجع بنفس ترتيب المعرّفات اللي دخلو */
export async function findByIds(ids: string[]): Promise<Vehicle[]> {
  const wanted = [...new Set(ids.filter(Boolean))].slice(0, 60);
  if (wanted.length === 0) return [];

  const order = (list: Vehicle[]) => {
    const byId = new Map(list.map((v) => [v.id, v]));
    return wanted.map((id) => byId.get(id)).filter((v): v is Vehicle => Boolean(v));
  };

  if (!usingDb()) return order(VEHICLES.filter((v) => wanted.includes(v.id)));

  try {
    const { listingsByRefs, rowToVehicle } = await db();
    const rows = await listingsByRefs(wanted);
    return order(rows.map((r) => rowToVehicle(r)));
  } catch (e) {
    console.error("[source] فشل جلب المركبات بالمعرّفات، كنرجعو للبيانات المرفقة:", e);
    return order(VEHICLES.filter((v) => wanted.includes(v.id)));
  }
}

export interface SitemapEntry {
  slug: string;
  lastModified: Date;
}

/** مدخلات خريطة الموقع — slug وآخر تحديث لكل إعلان نشيط */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const fromSeed = async () => {
    const { vehicleSlug } = await import("./slug");
    return VEHICLES.map((v) => ({
      slug: vehicleSlug(v),
      lastModified: new Date(v.publishedAt),
    }));
  };

  if (!usingDb()) return fromSeed();

  try {
    const { listingSitemapRows } = await db();
    const rows = await listingSitemapRows();
    return rows.map((r) => ({ slug: r.slug, lastModified: new Date(r.published_at) }));
  } catch (e) {
    console.error("[source] فشل جلب خريطة الموقع:", e);
    return fromSeed();
  }
}

/** عدّادات اللوحة الجانبية */
export async function getFacets(filters: Partial<Filters>): Promise<Facets> {
  if (!usingDb()) return facetsFromSeed(filters);
  try {
    const { facetCounts } = await db();
    return await facetCounts(filters);
  } catch (e) {
    console.error("[source] فشل جلب عدّادات الفلاتر:", e);
    return facetsFromSeed(filters);
  }
}

export type { CatalogEntry };

/** الماركات والموديلات الموجودة فعلاً فالموقع */
export async function getCatalog(): Promise<CatalogEntry[]> {
  const fromSeed = () =>
    VEHICLES.map((v) => ({ kind: v.kind, make: v.make, model: v.model })).sort(
      (a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model),
    );

  if (!usingDb()) return fromSeed();
  try {
    const { catalogRows } = await db();
    return await catalogRows();
  } catch (e) {
    console.error("[source] فشل جلب الكتالوج:", e);
    return fromSeed();
  }
}
