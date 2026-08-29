import "server-only";
import type { Seller, Vehicle } from "./types";
import type { Filters } from "./search";
import type { Facets } from "./facets";
import type { CatalogEntry } from "./source-types";
import { CATALOG } from "./data/catalog";
import { estimateValue, trustOf, type Estimate, type EstimateInput } from "./market";

/* ============================================================
   مصدر البيانات

   قاعدة البيانات هي المصدر الوحيد. كان كاين رجوع لبيانات مرفقة
   مع الموقع ملي تطيح القاعدة — تحيّد: داكشي كان إعلانات مخترعة،
   وموقع حقيقي خاصو يبيّن «ماكاين حتى إعلان» بدل ما يخترع سلعة
   ماكايناش.

   ملي تطيح القاعدة كنسجّلو الخطأ وكنرجعو نتيجة خاوية — الصفحة
   كتبقى كتخدم وكتبيّن حالة فارغة.
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

  if (!usingDb()) return { items: [], total: 0 };

  try {
    const { searchListings, rowToVehicle } = await db();
    const { rows, total } = await searchListings(filters, { limit, offset });
    return { items: rows.map((r) => rowToVehicle(r)), total };
  } catch (e) {
    console.error("[source] فشل استعلام قاعدة البيانات:", e);
    return { items: [], total: 0 };
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
  if (!usingDb()) return null;

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
    console.error("[source] فشل جلب المركبة:", e);
    return null;
  }
}

/** الماركات مع العدد */
export async function getBrands(kind?: "car" | "moto") {
  if (!usingDb()) return [];

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
    return [];
  }
}

/** كل الـslugs — للتوليد المسبق */
export async function getAllSlugs(): Promise<string[]> {
  if (!usingDb()) return [];
  try {
    const { allListingSlugs } = await db();
    return await allListingSlugs();
  } catch {
    return [];
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

/**
 * الثمن المرجعي لمركبة — كيتحسب من إعلانات حقيقية فقاعدة البيانات.
 *
 * بلا قاعدة بيانات ولا بلا إعلانات كافية، كيرجع تقدير خاوي
 * (sampleSize صفر) والواجهة كتقول «مراجع محدودة». عمرنا ما
 * نخترعو ثمن من بيانات مرفقة.
 */
export async function estimateFor(
  target: EstimateInput,
  opts: { excludeId?: string } = {},
): Promise<Estimate> {
  const empty: Estimate = {
    low: 0, mid: 0, high: 0, confidence: 0, sampleSize: 0, comparables: [],
  };
  if (!usingDb()) return empty;

  try {
    const { comparableListings, rowToVehicle } = await db();
    const rows = await comparableListings(target.kind, target.make);
    if (!rows.length) return empty;
    return estimateValue(target, rows.map((r) => rowToVehicle(r)), opts);
  } catch (e) {
    console.error("[source] فشل حساب الثمن المرجعي:", e);
    return empty;
  }
}

export interface SiteStats {
  cars: number;
  motos: number;
  byBody: Record<string, number>;
  byCity: Record<string, number>;
  makes: string[];
  avgTrust: number;
  /** عدد الإعلانات فكل شريحة ثمن — u50, 50-100, 100-200, o200 */
  byPrice: Record<string, number>;
  /** عدد الإعلانات حسب النوع والحالة — مفتاح "car:excellent" مثلاً */
  byKindCondition: Record<string, number>;
}

/** إحصائيات الصفحة الرئيسية */
export async function getStats(): Promise<SiteStats> {
  const empty: SiteStats = {
    cars: 0, motos: 0, byBody: {}, byCity: {}, makes: [], avgTrust: 0,
    byPrice: {}, byKindCondition: {},
  };
  if (!usingDb()) return empty;
  try {
    const { aggregates } = await db();
    return await aggregates();
  } catch (e) {
    console.error("[source] فشل جلب الإحصائيات:", e);
    return empty;
  }
}

/** عدد إعلانات كل وكيل */
export async function getDealerCounts(): Promise<Record<string, number>> {
  if (!usingDb()) return {};
  try {
    const { dealerListingCounts } = await db();
    return await dealerListingCounts();
  } catch {
    return {};
  }
}

/** إعلانات وكيل */
export async function getDealerListings(slug: string): Promise<Vehicle[]> {
  if (!usingDb()) return [];
  try {
    const { listingsOfDealer, rowToVehicle } = await db();
    const rows = await listingsOfDealer(slug);
    return rows.map((r) => rowToVehicle(r));
  } catch {
    return [];
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

  if (!usingDb()) return [];

  try {
    const { listingsByRefs, rowToVehicle } = await db();
    const rows = await listingsByRefs(wanted);
    return order(rows.map((r) => rowToVehicle(r)));
  } catch (e) {
    console.error("[source] فشل جلب المركبات بالمعرّفات:", e);
    return [];
  }
}

export interface SitemapEntry {
  slug: string;
  lastModified: Date;
}

/** مدخلات خريطة الموقع — slug وآخر تحديث لكل إعلان نشيط */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  if (!usingDb()) return [];

  try {
    const { listingSitemapRows } = await db();
    const rows = await listingSitemapRows();
    return rows.map((r) => ({ slug: r.slug, lastModified: new Date(r.published_at) }));
  } catch (e) {
    console.error("[source] فشل جلب خريطة الموقع:", e);
    return [];
  }
}

/** عدّادات اللوحة الجانبية */
export async function getFacets(filters: Partial<Filters>): Promise<Facets> {
  const empty: Facets = {
    total: 0,
    kind: { all: 0, car: 0, moto: 0 },
    body: {}, fuel: {}, gearbox: {}, condition: {}, city: {},
    flags: {
      goodDealsOnly: 0, inspectedOnly: 0, verifiedOnly: 0,
      firstHandOnly: 0, urgentOnly: 0,
    },
    makes: {}, models: {},
    priceHist: [], yearHist: [],
  };
  if (!usingDb()) return empty;
  try {
    const { facetCounts } = await db();
    return await facetCounts(filters);
  } catch (e) {
    console.error("[source] فشل جلب عدّادات الفلاتر:", e);
    return empty;
  }
}

export type { CatalogEntry };

/**
 * الماركات والموديلات لقوائم البيع والتقييم.
 *
 * هنا كنرجعو الكتالوج المرجعي كامل، ماشي غير اللي مسوّق دابا:
 * البائع خاصو يقدر ينشر موديل حتى إلا كان أول واحد كيبيعو.
 * الإعلانات الموجودة كتزيد فوقو (موديل ماشي فالكتالوج).
 */
export async function getCatalog(): Promise<CatalogEntry[]> {
  /* النسخة المرفقة هي الأساس: كتضمن أنّ القوائم كتعمّر حتى ملي
     تكون القاعدة بعيدة ولا طايحة. جدول catalog_models كيزيد
     فوقها، والإعلانات النشيطة كتزيد أي موديل ماشي فبجوجهم. */
  const base: CatalogEntry[] = CATALOG.map((c) => ({
    kind: c.kind,
    make: c.make,
    model: c.model,
  }));
  const seen = new Set(base.map((c) => `${c.kind}|${c.make}|${c.model}`));
  const add = (r: CatalogEntry) => {
    const key = `${r.kind}|${r.make}|${r.model}`;
    if (seen.has(key)) return;
    seen.add(key);
    base.push({ kind: r.kind, make: r.make, model: r.model });
  };

  if (!usingDb()) return sortCatalog(base);

  try {
    const { catalogModels, catalogRows } = await db();
    const [models, listed] = await Promise.all([catalogModels(), catalogRows()]);
    for (const r of models) add(r);
    for (const r of listed) add(r);
    return sortCatalog(base);
  } catch (e) {
    console.error("[source] فشل جلب الكتالوج:", e);
    return sortCatalog(base);
  }
}

const sortCatalog = (list: CatalogEntry[]) =>
  list.sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model));

/** إعلانات مشابهة كـVehicle — كيستعملها الخادم ملي كينشر إعلان جديد */
export async function comparablesFor(
  kind: "car" | "moto",
  make: string,
): Promise<Vehicle[]> {
  if (!usingDb()) return [];
  try {
    const { comparableListings, rowToVehicle } = await db();
    const rows = await comparableListings(kind, make);
    return rows.map((r) => rowToVehicle(r));
  } catch (e) {
    console.error("[source] فشل جلب المشابهات:", e);
    return [];
  }
}

/* ---------------- المعارض ---------------- */

import type { Dealer } from "./dealers";
import { DEFAULT_COVER } from "./dealers";

function toDealer(r: {
  slug: string; name: string; tagline: string | null; about: string | null;
  address: string | null; hours: string | null; city: string; verified: boolean;
  brands: string[]; cover_from: string | null; cover_to: string | null;
  owner_ref: string; rating: string | null; sales_count: number;
  response_minutes: number | null; member_since: string;
  id_verified: boolean; phone_verified: boolean;
  owner_type: "particulier" | "professionnel"; phone: string | null;
}): Dealer {
  return {
    id: r.owner_ref,
    name: r.name,
    type: r.owner_type,
    city: r.city,
    since: new Date(r.member_since).getFullYear(),
    idVerified: r.id_verified,
    phoneVerified: r.phone_verified,
    rating: Number(r.rating ?? 0),
    salesCount: r.sales_count,
    responseMinutes: r.response_minutes ?? 60,
    slug: r.slug,
    tagline: r.tagline ?? "",
    about: r.about ?? "",
    address: r.address ?? "",
    hours: r.hours ?? "",
    verified: r.verified,
    brands: r.brands ?? [],
    cover: [r.cover_from ?? DEFAULT_COVER[0], r.cover_to ?? DEFAULT_COVER[1]],
    phone: r.phone,
  };
}

/** كل المعارض المسجّلة */
export async function getDealers(): Promise<Dealer[]> {
  if (!usingDb()) return [];
  try {
    const { allDealers } = await db();
    return (await allDealers()).map(toDealer);
  } catch (e) {
    console.error("[source] فشل جلب المعارض:", e);
    return [];
  }
}

/** معرض واحد بالـslug */
export async function getDealer(slug: string): Promise<Dealer | null> {
  if (!usingDb()) return null;
  try {
    const { dealerBySlugRow } = await db();
    const row = await dealerBySlugRow(slug);
    return row ? toDealer(row) : null;
  } catch (e) {
    console.error("[source] فشل جلب المعرض:", e);
    return null;
  }
}

/** المعرض ديال بائع — كيبان فصفحة الإعلان */
export async function getDealerOfSeller(sellerRef: string): Promise<Dealer | null> {
  if (!usingDb()) return null;
  try {
    const { dealerOfSeller } = await db();
    const row = await dealerOfSeller(sellerRef);
    return row ? toDealer(row) : null;
  } catch {
    return null;
  }
}

/** عدد إعلانات نفس البائع بنفس الموديل والسنة — إشارة تكرار */
export async function getDuplicateCount(v: Vehicle): Promise<number> {
  if (!usingDb()) return 0;
  try {
    const { duplicateListingCount } = await db();
    return await duplicateListingCount(v.sellerId, v.make, v.model, v.year);
  } catch {
    return 0;
  }
}
