import "server-only";
import { sql, one } from "./client";
import { DEFAULT_FILTERS, type Filters, type SortKey } from "@/lib/search";
import type { HistoryEvent, MediaItem, Seller, Vehicle } from "@/lib/types";
import { pathnameFromMediaUrl } from "@/lib/blob";
import {
  emptyFacets, FLAG_KEYS, HIST_BUCKETS, POWER_MAX, PRICE_MAX, YEAR_MAX, YEAR_MIN,
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
  drivetrain: "fwd" | "rwd" | "awd" | null;
  origin: "maghribia" | "mostawrada" | null;
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
  updated_at: string;
  seller_name: string;
  seller_avatar: string | null;
  seller_type: "particulier" | "professionnel";
  dealer_slug: string | null;
  owners: number;
  fiscal_power: number;
  consumption: string | null;
  displacement: number | null;
  doors: number | null;
  technical_control: string | null;
  service_book: boolean;
  accident_declared: boolean;
  accident_note: string | null;
  unpaid_vignette: boolean;
  unpaid_fines: boolean;
  under_lien: boolean;
  known_issues: string[];
  original_paint: boolean;
  painted_panels: number | null;
  keys_count: number | null;
  included_items: string[];
  sale_reason: string | null;
  seller_declared: boolean;
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
  l.drivetrain, l.origin,
  l.first_hand, l.papers_ok, l.vin_checked, l.inspected, l.photo_count,
  l.has_video, l.trust_score, l.fair_price_mad, l.fair_price_delta, l.promo,
  l.views, l.saves, l.published_at, l.updated_at, l.owners, l.fiscal_power, l.consumption,
  l.displacement, l.doors, l.technical_control, l.service_book, l.description,
  l.equipment, l.negotiable, l.exchange_accepted,
  l.accident_declared, l.accident_note,
  l.unpaid_vignette, l.unpaid_fines, l.under_lien,
  l.known_issues, l.original_paint, l.painted_panels, l.keys_count,
  l.included_items, l.sale_reason, l.seller_declared,
  l.seller_id::text AS seller_ref,
  u.name AS seller_name, u.avatar_url AS seller_avatar, u.type AS seller_type, d.slug AS dealer_slug,
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
  if (f.color) add("l.color = ?", f.color);
  if (f.doors) add("l.doors = ?", f.doors);
  if (f.powerMin) add("l.fiscal_power >= ?", f.powerMin);
  if (f.powerMax) add("l.fiscal_power <= ?", f.powerMax);
  if (f.drivetrain) add("l.drivetrain = ?::drivetrain_type", f.drivetrain);
  if (f.origin) add("l.origin = ?::origin_type", f.origin);
  if (f.equipment?.trim()) {
    const tags = f.equipment.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length) add("l.equipment @> ?::text[]", tags);
  }
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
    sql<PriceHistoryRow>(`SELECT price_mad, changed_at FROM price_history
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
function isOwnListingMedia(url: string, sellerRef: string) {
  const pathname = pathnameFromMediaUrl(url);
  return Boolean(pathname && pathname.startsWith(`listings/${sellerRef}/`));
}

export interface PriceHistoryRow {
  price_mad: number;
  changed_at: string;
}

export function rowToVehicle(
  r: ListingRow,
  history: HistoryEvent[] = [],
  media: MediaItem[] = [],
  prices: PriceHistoryRow[] = [],
): Vehicle {
  /* price_history عندها غير نقط التغيير (الثمن الجديد فكل مرة
     تبدّل) — بلا الثمن الأصلي وقت النشر. كنحسبو التخفيضات غير من
     نقطتين متتاليتين حقيقيتين، بلا ما نخمّنو الثمن الأصلي. */
  const priceHistory = prices.map((p) => ({ price: p.price_mad, date: p.changed_at }));
  const priceDrops = priceHistory
    .slice(1)
    .map((p, i) => priceHistory[i].price - p.price)
    .filter((d) => d > 0);

  // حتى الصور القديمة أو المدخلة يدوياً ماخاصهاش تدوز إلا كانت من مسارنا.
  const safeMedia = media
    .filter((m) => isOwnListingMedia(m.url, r.seller_ref))
    .map((m) => ({
      ...m,
      thumbUrl: m.thumbUrl && isOwnListingMedia(m.thumbUrl, r.seller_ref) ? m.thumbUrl : undefined,
    }));
  const safeCover = r.cover_url && isOwnListingMedia(r.cover_url, r.seller_ref)
    ? r.cover_url
    : undefined;

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
    drivetrain: r.drivetrain ?? undefined,
    origin: r.origin ?? undefined,
    city: r.city,
    condition: r.condition as Vehicle["condition"],
    firstHand: r.first_hand,
    papersOk: r.papers_ok,
    technicalControl: r.technical_control ?? "",
    inspected: r.inspected,
    photos: r.photo_count,
    hasVideo: r.has_video,
    media: safeMedia.length ? safeMedia : undefined,
    cover: safeMedia[0]?.thumbUrl ?? safeMedia[0]?.url ?? safeCover,
    serviceBook: r.service_book,
    vinChecked: r.vin_checked,
    accidentDeclared: r.accident_declared,
    accidentNote: r.accident_note,
    unpaidVignette: r.unpaid_vignette,
    unpaidFines: r.unpaid_fines,
    underLien: r.under_lien,
    knownIssues: r.known_issues ?? [],
    originalPaint: r.original_paint,
    paintedPanels: r.painted_panels,
    keysCount: r.keys_count,
    includedItems: r.included_items ?? [],
    saleReason: r.sale_reason,
    sellerDeclared: r.seller_declared,
    description: r.description,
    equipment: r.equipment ?? [],
    /* البائع صرّح بحادث/إصلاح — كنزيدوه كحدث حقيقي فالسجل باش
       يبان للمشتري، بلا ما نكرّرو الكتابة فـlisting_history */
    history: r.accident_declared
      ? [
          {
            date: r.published_at,
            type: "accident" as const,
            label: "حادث أو إصلاح كبير مصرّح به",
            detail: r.accident_note ?? undefined,
          },
          ...history,
        ]
      : history,
    sellerId: r.seller_ref,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
    views: r.views,
    saves: r.saves,
    priceDrops,
    priceHistory,
    negotiable: r.negotiable,
    exchangeAccepted: r.exchange_accepted,
    promo: r.promo ?? undefined,
    fairPriceMad: r.fair_price_mad ?? undefined,
    fairPriceDelta: r.fair_price_delta != null ? Number(r.fair_price_delta) : undefined,
    trustScoreStored: r.trust_score ?? undefined,
    seller: {
      id: r.seller_ref,
      name: r.seller_name,
      avatarUrl: r.seller_avatar,
      type: r.seller_type,
      city: r.seller_city ?? "casablanca",
      since: new Date(r.seller_since).getFullYear(),
      idVerified: r.seller_id_ver,
      phoneVerified: r.seller_phone_ver,
      rating: r.seller_rating != null ? Number(r.seller_rating) : null,
      salesCount: r.seller_sales,
      responseMinutes: r.seller_resp,
      phone: r.seller_phone,
    },
  };
}

/** البائع كما كتنتظرو الواجهة */
export interface SellerRow {
  ref: string;
  name: string;
  avatar_url: string | null;
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
    avatarUrl: r.avatar_url,
    type: r.type,
    city: r.city ?? "casablanca",
    since: new Date(r.member_since).getFullYear(),
    idVerified: r.id_verified,
    phoneVerified: r.phone_verified,
    rating: r.rating != null ? Number(r.rating) : null,
    salesCount: r.sales_count,
    responseMinutes: r.response_minutes,
    phone: r.phone,
  };
}

/* ============================================================
   مركبات مشابهة — قسم "مركبات مشابهة" فصفحة الإعلان.

   منطق مختلف عن comparablesFor() (المستعملة لحساب الثمن المرجعي —
   ماشي فمكانها). هنا كل معيار كيزيد نقط: نفس الماركة، نفس نوع
   الهيكل، نفس المدينة، قرب الثمن، وقرب السنة — بلا ما نفرضو أي
   واحد منهم إجباري (SUV غالي فطنجة يقدر يبان قريب من SUV آخر فأي
   مدينة إلا الباقي متطابق).
   ============================================================ */
const SIMILARITY_SQL = `
  (CASE WHEN l.make = $2 THEN 40 ELSE 0 END)
  + (CASE WHEN l.body = $3::body_type THEN 25 ELSE 0 END)
  + (CASE WHEN l.city = $4 THEN 20 ELSE 0 END)
  + 40 * GREATEST(0, 1 - LEAST(1, ABS(l.price_mad - $5::int)::numeric / NULLIF($5::numeric, 0) / 0.35))
  + 15 * GREATEST(0, 1 - LEAST(1, ABS(l.year - $6::int)::numeric / 6))
`;

export interface SimilarInput {
  ref: string;
  kind: "car" | "moto";
  make: string;
  body: string;
  city: string;
  price: number;
  year: number;
}

export async function findSimilarListings(v: SimilarInput, limit = 8): Promise<ListingRow[]> {
  return sql<ListingRow>(
    `SELECT ${SELECT_COLS}, (${SIMILARITY_SQL}) AS similarity
     ${FROM}
     WHERE l.status = 'active' AND l.kind = $1::vehicle_kind AND l.ref <> $7
     ORDER BY similarity DESC, l.trust_score DESC NULLS LAST, l.ref ASC
     LIMIT $8`,
    [v.kind, v.make, v.body, v.city, v.price, v.year, v.ref, limit],
  );
}

/** بائع إعلان معيّن */
export async function getSellerOf(listingRef: string): Promise<Seller | null> {
  const r = await one<SellerRow>(
    `SELECT u.id::text AS ref, u.name, u.avatar_url, u.type, u.city, u.member_since,
            u.id_verified, u.phone_verified, u.rating, u.sales_count,
            u.response_minutes, u.phone
     FROM listings l JOIN users u ON u.id = l.seller_id
     WHERE l.ref = $1 OR l.slug = $1`,
    [listingRef],
  );
  return r ? rowToSeller(r) : null;
}

export interface SellerStats {
  activeListings: number;
  avgTrust: number | null;
  negativeReports: number;
  soldListings: number;
}

/** مدخلات مؤشر الثقة ديال الحساب — نشاط، جودة الإعلانات، بلاغات محسومة */
export async function sellerStats(userId: string): Promise<SellerStats> {
  const [listingRow, reportRow, soldRow] = await Promise.all([
    one<{ n: string; avg: string | null }>(
      `SELECT count(*)::text AS n, round(avg(trust_score))::text AS avg
       FROM listings WHERE seller_id = $1::uuid AND status = 'active'`,
      [userId],
    ),
    one<{ n: string }>(
      `SELECT count(*)::text AS n FROM reports r
       JOIN listings l ON l.id = r.listing_id
       WHERE l.seller_id = $1::uuid AND r.status = 'actioned'`,
      [userId],
    ),
    one<{ n: string }>(
      `SELECT count(*)::text AS n FROM listings
       WHERE seller_id = $1::uuid AND status = 'sold'`,
      [userId],
    ),
  ]);
  return {
    activeListings: Number(listingRow?.n ?? 0),
    avgTrust: listingRow?.avg ? Number(listingRow.avg) : null,
    negativeReports: Number(reportRow?.n ?? 0),
    soldListings: Number(soldRow?.n ?? 0),
  };
}

/** بائع واحد بمعرّفو مباشرة — لصفحة الملف العام */
export async function sellerById(userId: string): Promise<SellerRow | null> {
  return one<SellerRow>(
    `SELECT u.id::text AS ref, u.name, u.avatar_url, u.type, u.city, u.member_since,
            u.id_verified, u.phone_verified, u.rating, u.sales_count,
            u.response_minutes, u.phone
     FROM users u WHERE u.id = $1::uuid`,
    [userId],
  );
}

/** إعلانات بائع معيّن — لصفحة الملف العام (النشيطة فقط، ماشي كيفما لوحة التحكّم) */
export async function activeListingsOfSeller(userId: string) {
  return sql<ListingRow>(
    `SELECT ${SELECT_COLS} ${FROM}
     WHERE l.status = 'active' AND l.seller_id = $1::uuid
     ORDER BY l.published_at DESC`,
    [userId],
  );
}

/** تسجيل مشاهدة بالمرجع القصير (c001) بدل الـuuid */
export async function recordViewByRef(ref: string, visitorKey: string) {
  const l = await one<{ id: string }>("SELECT id FROM listings WHERE ref = $1 OR slug = $1", [ref]);
  if (l) await recordView(l.id, visitorKey);
}

/** حدود شرائح الثمن فقسم «حسب السعر» بالصفحة الرئيسية */
const PRICE_BRACKETS = [
  { key: "u50", sql: "price_mad < 50000" },
  { key: "50-100", sql: "price_mad >= 50000 AND price_mad < 100000" },
  { key: "100-200", sql: "price_mad >= 100000 AND price_mad < 200000" },
  { key: "o200", sql: "price_mad >= 200000" },
] as const;

/** إحصائيات مجمّعة فاستعلام واحد — للصفحة الرئيسية */
export async function aggregates() {
  const [kinds, bodies, cities, makes, trust, priceRows, kindCondition] = await Promise.all([
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
    sql<Record<string, string>>(
      `SELECT ${PRICE_BRACKETS.map((b) => `count(*) FILTER (WHERE ${b.sql})::text AS "${b.key}"`).join(", ")}
       FROM listings WHERE status='active'`,
    ),
    sql<{ kind: string; condition: string; n: string }>(
      "SELECT kind, condition, count(*)::text n FROM listings WHERE status='active' GROUP BY kind, condition"),
  ]);
  const toMap = (rows: { n: string }[], key: string) =>
    Object.fromEntries(rows.map((r) => [(r as never)[key], Number(r.n)])) as Record<string, number>;

  const priceRow = priceRows[0];
  const byPrice = Object.fromEntries(
    PRICE_BRACKETS.map((b) => [b.key, Number(priceRow?.[b.key] ?? 0)]),
  ) as Record<string, number>;

  const byKindCondition: Record<string, number> = {};
  for (const r of kindCondition) byKindCondition[`${r.kind}:${r.condition}`] = Number(r.n);

  return {
    cars: Number(kinds.find((k) => k.kind === "car")?.n ?? 0),
    motos: Number(kinds.find((k) => k.kind === "moto")?.n ?? 0),
    byBody: toMap(bodies, "body"),
    byCity: toMap(cities, "city"),
    makes: makes.map((m) => m.make),
    avgTrust: Number(trust?.avg ?? 0),
    byPrice,
    byKindCondition,
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

/** عدد الإعلانات فكل تجهيز — كل صف عندو لائحة، فخاصنا unnest */
async function equipmentCounts(f: Filters): Promise<Record<string, number>> {
  const { clause, params } = buildWhere(f);
  const rows = await sql<{ k: string; n: string }>(
    `SELECT unnest(l.equipment) AS k, count(*)::text AS n ${FROM} WHERE ${clause} GROUP BY 1`,
    params,
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.k] = Number(r.n);
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
    color, doors, drivetrain, origin, powerHist, equipment,
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
    groupCount({ ...f, color: "" }, "l.color"),
    groupCount({ ...f, doors: undefined }, "l.doors"),
    groupCount({ ...f, drivetrain: "" }, "l.drivetrain"),
    groupCount({ ...f, origin: "" }, "l.origin"),
    histCount({ ...f, powerMin: undefined, powerMax: undefined }, "l.fiscal_power", 0, POWER_MAX),
    equipmentCounts({ ...f, equipment: "" }),
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
  out.color = color;
  out.doors = doors;
  out.drivetrain = drivetrain;
  out.origin = origin;
  out.powerHist = powerHist;
  out.equipment = equipment;
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
