import "server-only";
import { sql, one } from "./client";
import { DEFAULT_FILTERS, type Filters, type SortKey } from "@/lib/search";
import type { HistoryEvent, MediaItem, Seller, Vehicle } from "@/lib/types";
import {
  emptyFacets, FLAG_KEYS, HIST_BUCKETS, PRICE_MAX, YEAR_MAX, YEAR_MIN,
  type Facets,
} from "@/lib/facets";

/* ============================================================
   استعلامات الإعلانات

   كيعكس نفس منطق applyFilters() اللي فـlib/search.ts، ولكن فـSQL.
   القيم المحسوبة (trust_score, fair_price_delta) مخزّنة كأعمدة
   حيت كتُستعمل فـWHERE و ORDER BY.
   ============================================================ */

export interface ListingRow {
  id: string;
  ref: string;
  slug: string;
  seller_ref: string;
  kind: "car" | "moto";
  make: string;
  model: string;
  version: string;
  year: number;
  km: number;
  price_mad: number;
  fuel: string;
  gearbox: string;
  body: string;
  city: string;
  condition: string;
  color: string | null;
  first_hand: boolean;
  papers_ok: boolean;
  vin_checked: boolean;
  inspected: boolean;
  photo_count: number;
  has_video: boolean;
  trust_score: number | null;
  fair_price_mad: number | null;
  cover_url: string | null;
  fair_price_delta: string | null;
  promo: "featured" | "urgent" | "top" | null;
  views: number;
  saves: number;
  published_at: string;
  seller_name: string;
  seller_type: "particulier" | "professionnel";
  dealer_slug: string | null;
  owners: number;
  fiscal_power: number;
  consumption: string | null;
  displacement: number | null;
  doors: number | null;
  technical_control: string | null;
  service_book: boolean;
  description: string;
  equipment: string[];
  negotiable: boolean;
  exchange_accepted: boolean;
  seller_city: string | null;
  seller_since: string;
  seller_id_ver: boolean;
  seller_phone_ver: boolean;
  seller_rating: string | null;
  seller_sales: number;
  seller_resp: number | null;
  seller_phone: string | null;
}

/** رفعة الترتيب لكل درجة ترويج — خاصها تبقى متطابقة مع lib/promo.ts */
const PROMO_RANK_SQL = `CASE l.promo
  WHEN 'top' THEN 60 WHEN 'urgent' THEN 28 WHEN 'featured' THEN 12 ELSE 0 END`;

const ORDER_BY: Record<SortKey, string> = {
  pertinence: `(coalesce(l.trust_score,0) * 0.6
                + ${PROMO_RANK_SQL}
                + greatest(-20, least(20, -coalesce(l.fair_price_delta,0) * 120))
                + extract(epoch from (l.published_at - timestamptz '2026-07-01')) / 345600
               ) DESC`,
  deal: "l.fair_price_delta ASC NULLS LAST",
  recent: "l.published_at DESC",
  "price-asc": "l.price_mad ASC",
  "price-desc": "l.price_mad DESC",
  "km-asc": "l.km ASC",
  "year-desc": "l.year DESC",
  "trust-desc": "l.trust_score DESC NULLS LAST",
};

const SELECT_COLS = `
  l.id, l.ref, l.slug, l.kind, l.make, l.model, l.version, l.year, l.km,
  l.price_mad, l.fuel, l.gearbox, l.body, l.city, l.condition, l.color,
  l.first_hand, l.papers_ok, l.vin_checked, l.inspected, l.photo_count,
  l.has_video, l.trust_score, l.fair_price_mad, l.fair_price_delta, l.promo,
  l.views, l.saves, l.published_at, l.owners, l.fiscal_power, l.consumption,
  l.displacement, l.doors, l.technical_control, l.service_book, l.description,
  l.equipment, l.negotiable, l.exchange_accepted,
  l.seller_id::text AS seller_ref,
  u.name AS seller_name, u.type AS seller_type, d.slug AS dealer_slug,
  u.city AS seller_city, u.member_since AS seller_since,
  u.id_verified AS seller_id_ver, u.phone_verified AS seller_phone_ver,
  u.rating AS seller_rating, u.sales_count AS seller_sales,
  u.response_minutes AS seller_resp, u.phone AS seller_phone,
  -- أول صورة باش البطاقات مايطلبوش الصور وحدة بوحدة.
  -- المصغّرة إلا كانت: البطاقة ماكتحتاجش صورة 1920px
  (SELECT coalesce(m.thumb_url, m.url) FROM listing_media m
    WHERE m.listing_id = l.id AND m.kind = 'photo'
    ORDER BY m.position LIMIT 1) AS cover_url`;

const FROM = `
  FROM listings l
  JOIN users u   ON u.id = l.seller_id
  LEFT JOIN dealers d ON d.id = l.dealer_id`;

/** كيبني WHERE من الفلاتر — كل قيمة كتمرّ كـparameter، صفر تسلسل نصي */
function buildWhere(f: Filters) {
  const where: string[] = ["l.status = 'active'"];
  const params: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    params.push(value);
    where.push(clause.replace("?", `$${params.length}`));
  };

  if (f.kind !== "all") add("l.kind = ?", f.kind);
  if (f.make) add("l.make = ?", f.make);
  if (f.model) add("l.model = ?", f.model);
  if (f.city) add("l.city = ?", f.city);
  if (f.fuel) add("l.fuel = ?", f.fuel);
  if (f.gearbox) add("l.gearbox = ?", f.gearbox);
  if (f.body) add("l.body = ?", f.body);
  if (f.condition) add("l.condition = ?", f.condition);
  if (f.sellerType) add("u.type = ?", f.sellerType);
  if (f.priceMin) add("l.price_mad >= ?", f.priceMin);
  if (f.priceMax) add("l.price_mad <= ?", f.priceMax);
  if (f.yearMin) add("l.year >= ?", f.yearMin);
  if (f.yearMax) add("l.year <= ?", f.yearMax);
  if (f.kmMax) add("l.km <= ?", f.kmMax);
  if (f.trustMin) add("l.trust_score >= ?", f.trustMin);
  if (f.inspectedOnly) where.push("l.inspected");
  if (f.firstHandOnly) where.push("l.first_hand");
  if (f.verifiedOnly) where.push("l.papers_ok AND l.vin_checked");
  if (f.goodDealsOnly) where.push("l.fair_price_delta <= -0.045");
  if (f.urgentOnly) where.push("l.promo = 'urgent'");
  if (f.q?.trim()) {
    add(
      "latin_fold(l.make || ' ' || l.model || ' ' || l.version || ' ' || l.description) LIKE '%' || latin_fold(?) || '%'",
      f.q.trim(),
    );
  }

  return { clause: where.join(" AND "), params };
}

export interface SearchResult {
  rows: ListingRow[];
  total: number;
}

/** البحث الرئيسي — مع العدد الكلي للترقيم */
export async function searchListings(
  filters: Partial<Filters>,
  { limit = 24, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<SearchResult> {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const { clause, params } = buildWhere(f);
  // كسر التعادل بالمرجع باش الترقيم يكون مستقراً وماتكررش الصفوف
  const order = `${ORDER_BY[f.sort] ?? ORDER_BY.pertinence}, l.ref ASC`;

  const rows = await sql<ListingRow & { total: string }>(
    `SELECT ${SELECT_COLS}, count(*) OVER () AS total
     ${FROM}
     WHERE ${clause}
     ORDER BY ${order}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return {
    rows: rows as unknown as ListingRow[],
    total: rows.length ? Number(rows[0].total) : 0,
  };
}

/** العدد فقط — للفلاتر الجانبية */
export async function countListings(filters: Partial<Filters>): Promise<number> {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const { clause, params } = buildWhere(f);
  const r = await one<{ n: string }>(
    `SELECT count(*)::text AS n ${FROM} WHERE ${clause}`,
    params,
  );
  return Number(r?.n ?? 0);
}

/** إعلان واحد بالـslug، مع سجل المركبة والصور */
export async function getListingBySlug(slug: string) {
  const listing = await one<ListingRow & {
    description: string; equipment: string[]; owners: number;
    fiscal_power: number; consumption: string | null; displacement: number | null;
    doors: number | null; technical_control: string | null; service_book: boolean;
    negotiable: boolean; exchange_accepted: boolean;
    seller_id: string; seller_city: string; seller_rating: string | null;
    seller_sales: number; seller_response: number | null;
    seller_id_verified: boolean; seller_phone_verified: boolean;
  }>(
    `SELECT ${SELECT_COLS}, l.description, l.equipment, l.owners, l.fiscal_power,
            l.consumption, l.displacement, l.doors, l.technical_control,
            l.service_book, l.negotiable, l.exchange_accepted,
            u.id AS seller_id, u.city AS seller_city, u.rating AS seller_rating,
            u.sales_count AS seller_sales, u.response_minutes AS seller_response,
            u.id_verified AS seller_id_verified, u.phone_verified AS seller_phone_verified
     ${FROM} WHERE l.slug = $1 AND l.status = 'active'`,
    [slug],
  );
  if (!listing) return null;

  const [history, media, prices] = await Promise.all([
    sql(`SELECT event_date, type, label, km, detail FROM listing_history
         WHERE listing_id = $1 ORDER BY event_date`, [listing.id]),
    sql(`SELECT kind, url, thumb_url, width, height FROM listing_media
         WHERE listing_id = $1 ORDER BY position`, [listing.id]),
    sql(`SELECT price_mad, changed_at FROM price_history
         WHERE listing_id = $1 ORDER BY changed_at`, [listing.id]),
  ]);

  return { listing, history, media, prices };
}

/** المسارات الثابتة — للتوليد المسبق */
export async function allListingSlugs(): Promise<string[]> {
  const rows = await sql<{ slug: string }>(
    "SELECT slug FROM listings WHERE status = 'active'",
  );
  return rows.map((r) => r.slug);
}

/** الماركات مع العدد — للصفحة الرئيسية وللفلاتر */
export async function brandCounts(kind?: "car" | "moto") {
  return sql<{ make: string; n: string }>(
    `SELECT make, count(*)::text AS n FROM listings
     WHERE status = 'active' ${kind ? "AND kind = $1" : ""}
     GROUP BY make ORDER BY count(*) DESC, make`,
    kind ? [kind] : [],
  );
}

/** تسجيل مشاهدة مرة وحدة لكل زائر فاليوم */
export async function recordView(listingId: string, visitorKey: string) {
  const r = await sql(
    `INSERT INTO listing_views (listing_id, day, visitor_key)
     VALUES ($1, CURRENT_DATE, $2)
     ON CONFLICT DO NOTHING
     RETURNING listing_id`,
    [listingId, visitorKey],
  );
  if (r.length) {
    await sql("UPDATE listings SET views = views + 1 WHERE id = $1", [listingId]);
  }
}

/* ============================================================
   المحوّل: صف قاعدة البيانات → شكل Vehicle

   الواجهة كلها (البطاقات، الفلاتر، المقارنة، الرسومات) مبنية على
   نوع Vehicle. بدل ما نعاودو كتابتها، كنحوّلو الصف لنفس الشكل.
   ============================================================ */

/** الأحداث كتّجمع على حدة — الصف وحدو ماكيحملهاش */
export function rowToVehicle(
  r: ListingRow,
  history: HistoryEvent[] = [],
  media: MediaItem[] = [],
): Vehicle {
  return {
    id: r.ref,
    kind: r.kind,
    make: r.make,
    model: r.model,
    version: r.version,
    year: r.year,
    km: r.km,
    price: r.price_mad,
    owners: r.owners,
    fuel: r.fuel as Vehicle["fuel"],
    gearbox: r.gearbox as Vehicle["gearbox"],
    body: r.body as Vehicle["body"],
    fiscalPower: r.fiscal_power,
    consumption: Number(r.consumption ?? 0),
    displacement: r.displacement ?? undefined,
    doors: r.doors ?? undefined,
    color: r.color ?? "أبيض",
    city: r.city,
    condition: r.condition as Vehicle["condition"],
    firstHand: r.first_hand,
    papersOk: r.papers_ok,
    technicalControl: r.technical_control ?? "",
    inspected: r.inspected,
    photos: r.photo_count,
    hasVideo: r.has_video,
    media: media.length ? media : undefined,
    cover: media[0]?.thumbUrl ?? media[0]?.url ?? r.cover_url ?? undefined,
    serviceBook: r.service_book,
    vinChecked: r.vin_checked,
    description: r.description,
    equipment: r.equipment ?? [],
    history,
    sellerId: r.seller_ref,
    publishedAt: r.published_at,
    views: r.views,
    saves: r.saves,
    priceDrops: [],
    negotiable: r.negotiable,
    exchangeAccepted: r.exchange_accepted,
    promo: r.promo ?? undefined,
    fairPriceMad: r.fair_price_mad ?? undefined,
    fairPriceDelta: r.fair_price_delta != null ? Number(r.fair_price_delta) : undefined,
    trustScoreStored: r.trust_score ?? undefined,
    seller: {
      id: r.seller_ref,
      name: r.seller_name,
      type: r.seller_type,
      city: r.seller_city ?? "casablanca",
      since: new Date(r.seller_since).getFullYear(),
      idVerified: r.seller_id_ver,
      phoneVerified: r.seller_phone_ver,
      rating: Number(r.seller_rating ?? 4.5),
      salesCount: r.seller_sales,
      responseMinutes: r.seller_resp ?? 60,
      phone: r.seller_phone,
    },
  };
}

/** البائع كما كتنتظرو الواجهة */
export interface SellerRow {
  ref: string;
  name: string;
  type: "particulier" | "professionnel";
  city: string | null;
  member_since: string;
  id_verified: boolean;
  phone_verified: boolean;
  rating: string | null;
  sales_count: number;
  response_minutes: number | null;
  phone: string | null;
}

export function rowToSeller(r: SellerRow): Seller {
  return {
    id: r.ref,
    name: r.name,
    type: r.type,
    city: r.city ?? "casablanca",
    since: new Date(r.member_since).getFullYear(),
    idVerified: r.id_verified,
    phoneVerified: r.phone_verified,
    rating: Number(r.rating ?? 4.5),
    salesCount: r.sales_count,
    responseMinutes: r.response_minutes ?? 60,
    phone: r.phone,
  };
}

/** بائع إعلان معيّن */
export async function getSellerOf(listingRef: string): Promise<Seller | null> {
  const r = await one<SellerRow>(
    `SELECT u.id::text AS ref, u.name, u.type, u.city, u.member_since,
            u.id_verified, u.phone_verified, u.rating, u.sales_count,
            u.response_minutes, u.phone
     FROM listings l JOIN users u ON u.id = l.seller_id
     WHERE l.ref = $1 OR l.slug = $1`,
    [listingRef],
  );
  return r ? rowToSeller(r) : null;
}

/** تسجيل مشاهدة بالمرجع القصير (c001) بدل الـuuid */
export async function recordViewByRef(ref: string, visitorKey: string) {
  const l = await one<{ id: string }>("SELECT id FROM listings WHERE ref = $1 OR slug = $1", [ref]);
  if (l) await recordView(l.id, visitorKey);
}

/** إحصائيات مجمّعة فاستعلام واحد — للصفحة الرئيسية */
export async function aggregates() {
  const [kinds, bodies, cities, makes, trust] = await Promise.all([
    sql<{ kind: string; n: string }>(
      "SELECT kind, count(*)::text n FROM listings WHERE status='active' GROUP BY kind"),
    sql<{ body: string; n: string }>(
      "SELECT body, count(*)::text n FROM listings WHERE status='active' GROUP BY body"),
    sql<{ city: string; n: string }>(
      "SELECT city, count(*)::text n FROM listings WHERE status='active' GROUP BY city"),
    sql<{ make: string }>(
      "SELECT DISTINCT make FROM listings WHERE status='active' ORDER BY make"),
    one<{ avg: string | null }>(
      "SELECT round(avg(trust_score))::text avg FROM listings WHERE status='active'"),
  ]);
  const toMap = (rows: { n: string }[], key: string) =>
    Object.fromEntries(rows.map((r) => [(r as never)[key], Number(r.n)])) as Record<string, number>;

  return {
    cars: Number(kinds.find((k) => k.kind === "car")?.n ?? 0),
    motos: Number(kinds.find((k) => k.kind === "moto")?.n ?? 0),
    byBody: toMap(bodies, "body"),
    byCity: toMap(cities, "city"),
    makes: makes.map((m) => m.make),
    avgTrust: Number(trust?.avg ?? 0),
  };
}

/** المعارض كما كتنتظرهم الواجهة */
export interface DealerRow {
  slug: string;
  name: string;
  tagline: string | null;
  about: string | null;
  address: string | null;
  hours: string | null;
  city: string;
  verified: boolean;
  brands: string[];
  logo_url: string | null;
  cover_from: string | null;
  cover_to: string | null;
  owner_ref: string;
  rating: string | null;
  sales_count: number;
  response_minutes: number | null;
  member_since: string;
  id_verified: boolean;
  phone_verified: boolean;
  owner_type: "particulier" | "professionnel";
  phone: string | null;
}

const DEALER_COLS = `
  d.slug, d.name, d.tagline, d.about, d.address, d.hours, d.city,
  d.verified, d.brands, d.logo_url, d.cover_from, d.cover_to,
  u.id::text AS owner_ref, u.rating, u.sales_count, u.response_minutes,
  u.member_since, u.id_verified, u.phone_verified, u.type AS owner_type,
  u.phone
  FROM dealers d JOIN users u ON u.id = d.owner_id`;

/** كل المعارض */
export async function allDealers(): Promise<DealerRow[]> {
  return sql<DealerRow>(`SELECT ${DEALER_COLS} ORDER BY d.name`);
}

/** معرض واحد بالـslug */
export async function dealerBySlugRow(slug: string): Promise<DealerRow | null> {
  return one<DealerRow>(`SELECT ${DEALER_COLS} WHERE d.slug = $1`, [slug]);
}

/** المعرض ديال بائع معيّن — كيبان فصفحة الإعلان */
export async function dealerOfSeller(sellerRef: string): Promise<DealerRow | null> {
  return one<DealerRow>(`SELECT ${DEALER_COLS} WHERE u.id::text = $1`, [sellerRef]);
}

/** كم من إعلان عند نفس البائع بنفس الموديل والسنة — إشارة تكرار */
export async function duplicateListingCount(
  sellerRef: string,
  make: string,
  model: string,
  year: number,
): Promise<number> {
  const r = await one<{ n: string }>(
    `SELECT count(*)::text n FROM listings l
      WHERE l.status='active' AND l.seller_id::text = $1
        AND l.make = $2 AND l.model = $3 AND l.year = $4`,
    [sellerRef, make, model, year],
  );
  return Number(r?.n ?? 0);
}

/** عدد الإعلانات لكل وكيل، مفهرس بـslug ديال الوكيل */
export async function dealerListingCounts(): Promise<Record<string, number>> {
  const rows = await sql<{ slug: string; n: string }>(
    `SELECT d.slug, count(*)::text n FROM listings l
     JOIN dealers d ON d.id = l.dealer_id
     WHERE l.status='active' GROUP BY d.slug`,
  );
  return Object.fromEntries(rows.map((r) => [r.slug, Number(r.n)]));
}

/** إعلانات وكيل معيّن بالـslug */
export async function listingsOfDealer(slug: string) {
  return sql<ListingRow>(
    `SELECT ${SELECT_COLS} ${FROM}
     WHERE l.status='active' AND d.slug = $1
     ORDER BY l.published_at DESC`,
    [slug],
  );
}

/** إعلانات بمجموعة معرّفات (ref ولا slug) — للمفضّلة والمقارنة وآخر ما شفتي */
export async function listingsByRefs(refs: string[]) {
  if (refs.length === 0) return [];
  return sql<ListingRow>(
    `SELECT ${SELECT_COLS} ${FROM}
     WHERE l.status='active' AND (l.ref = ANY($1::text[]) OR l.slug = ANY($1::text[]))`,
    [refs],
  );
}

/** slug + آخر تحديث — لخريطة الموقع */
export async function listingSitemapRows() {
  return sql<{ slug: string; published_at: Date }>(
    "SELECT slug, published_at FROM listings WHERE status = 'active'",
  );
}

/* ---------- عدّادات الفلاتر ---------- */

/** عدّ مجمّع على عمود واحد، مع نفس الفلاتر ناقص هاد العمود */
async function groupCount(f: Filters, col: string): Promise<Record<string, number>> {
  const { clause, params } = buildWhere(f);
  const rows = await sql<{ k: string | null; n: string }>(
    `SELECT ${col} AS k, count(*)::text AS n ${FROM} WHERE ${clause} GROUP BY 1`,
    params,
  );
  const out: Record<string, number> = {};
  for (const r of rows) if (r.k != null) out[String(r.k)] = Number(r.n);
  return out;
}

/** عدد الصفوف فقط */
async function plainCount(f: Filters): Promise<number> {
  const { clause, params } = buildWhere(f);
  const r = await one<{ n: string }>(
    `SELECT count(*)::text AS n ${FROM} WHERE ${clause}`,
    params,
  );
  return Number(r?.n ?? 0);
}

/** مدرّج تكراري بنفس تقسيم المتصفح — width عبر floor() */
async function histCount(
  f: Filters,
  col: string,
  min: number,
  max: number,
): Promise<number[]> {
  const { clause, params } = buildWhere(f);
  const span = (max - min) || 1;
  // نفس ترتيب العمليات ديال bucketOf() — ضرب قبل قسمة
  const bucket =
    `least(${HIST_BUCKETS - 1}, greatest(0,` +
    ` floor(((${col} - ${min})::numeric * ${HIST_BUCKETS}) / ${span})))::int`;
  const rows = await sql<{ b: number; n: string }>(
    `SELECT ${bucket} AS b, count(*)::text AS n ${FROM} WHERE ${clause} GROUP BY 1`,
    params,
  );
  const out = new Array<number>(HIST_BUCKETS).fill(0);
  for (const r of rows) out[Number(r.b)] = Number(r.n);
  return out;
}

/** كل عدّادات اللوحة الجانبية فضربة وحدة */
export async function facetCounts(filters: Partial<Filters>): Promise<Facets> {
  const f: Filters = { ...DEFAULT_FILTERS, ...filters };
  const kindBase = { ...f, make: "", model: "", body: "" };

  const [
    total, kAll, kCar, kMoto,
    body, fuel, gearbox, condition, city,
    makeRows, modelRows,
    priceHist, yearHist,
    ...flagCounts
  ] = await Promise.all([
    plainCount(f),
    plainCount({ ...kindBase, kind: "all" }),
    plainCount({ ...kindBase, kind: "car" }),
    plainCount({ ...kindBase, kind: "moto" }),
    groupCount({ ...f, body: "" }, "l.body"),
    groupCount({ ...f, fuel: "" }, "l.fuel"),
    groupCount({ ...f, gearbox: "" }, "l.gearbox"),
    groupCount({ ...f, condition: "" }, "l.condition"),
    groupCount({ ...f, city: "" }, "l.city"),
    groupCount({ ...f, make: "", model: "" }, "l.make"),
    f.make ? groupCount({ ...f, model: "" }, "l.model") : Promise.resolve({}),
    histCount({ ...f, priceMin: undefined, priceMax: undefined }, "l.price_mad", 0, PRICE_MAX),
    histCount({ ...f, yearMin: undefined, yearMax: undefined }, "l.year", YEAR_MIN, YEAR_MAX),
    ...FLAG_KEYS.map((flag) => plainCount({ ...f, [flag]: true })),
  ]);

  const out = emptyFacets();
  out.total = total;
  out.kind = { all: kAll, car: kCar, moto: kMoto };
  out.body = body;
  out.fuel = fuel;
  out.gearbox = gearbox;
  out.condition = condition;
  out.city = city;
  out.makes = makeRows;
  out.models = modelRows;
  out.priceHist = priceHist;
  out.yearHist = yearHist;
  FLAG_KEYS.forEach((flag, i) => { out.flags[flag] = flagCounts[i] as number; });
  return out;
}

/** كتالوج الماركات والموديلات — للقوائم المنسدلة */
/**
 * إعلانات مشابهة لحساب الثمن المرجعي.
 *
 * كناخدو إعلانات نشيطة من نفس النوع فقط — الباقي (الماركة،
 * السنة، الكيلومتراج) كيتوزن فـmarket.ts. كنقدّمو نفس الماركة
 * حيت هي اللي كتعطي أقوى مشابهة، وكنحدّو العدد باش الاستعلام
 * يبقى خفيف حتى ملي يكبر الموقع.
 */
export async function comparableListings(
  kind: "car" | "moto",
  make: string,
  limit = 300,
): Promise<ListingRow[]> {
  return sql<ListingRow>(
    `SELECT ${SELECT_COLS} ${FROM}
      WHERE l.status = 'active' AND l.kind = $1
      ORDER BY (l.make = $2) DESC, l.published_at DESC
      LIMIT $3`,
    [kind, make, limit],
  );
}

/** الموديلات اللي عندها إعلانات نشيطة — كتزيد فوق الكتالوج */
export async function catalogRows() {
  return sql<{ kind: "car" | "moto"; make: string; model: string }>(
    `SELECT DISTINCT kind, make, model FROM listings
     WHERE status = 'active' ORDER BY make, model`,
  );
}

/** كتالوج الماركات والموديلات — المرجع اللي كيعمّر قوائم البيع */
export async function catalogModels() {
  return sql<{ kind: "car" | "moto"; make: string; model: string; body: string | null }>(
    `SELECT kind, make, model, body FROM catalog_models ORDER BY make, model`,
  );
}

/** إعلانات بائع معيّن — للوحة التحكّم (بما فيها اللي ماشي نشيطة) */
export async function listingsOfSeller(userId: string) {
  return sql<ListingRow & { status: string }>(
    `SELECT ${SELECT_COLS}, l.status ${FROM}
     WHERE l.seller_id = $1
     ORDER BY l.published_at DESC`,
    [userId],
  );
}
