/* بلا "server-only": مشتركة مع سطر الأوامر — شوف migrate.ts. */
import { VEHICLES } from "@/lib/data/vehicles";
import { SELLERS } from "@/lib/data/sellers";
import { DEALERS } from "@/lib/data/dealers";
import { trustOf, fairPriceOf } from "@/lib/market";
import { vehicleSlug } from "@/lib/slug";
import { PROMOS } from "@/lib/promo";
import { hashCode } from "@/lib/data/seed";
import type { Query } from "./migrate";

/* ============================================================
   تعمير قاعدة البيانات من البيانات المرفقة

   نفس الدالة كتستعمل من سطر الأوامر (npm run db:seed) ومن مسار
   الإعداد فالموقع. كتعاود مرة أخرى بلا ضرر: كل إدراج عندو
   ON CONFLICT، والسجل والأثمنة كيتمسحو ويتعاودو لكل إعلان.
   ============================================================ */

/** رقم هاتف ثابت من نفس البذرة اللي كتستعمل الواجهة (اختياري فالملف) */
function phoneFor(id: string) {
  const h = hashCode(id);
  return "+2126" + String(h % 100000000).padStart(8, "0");
}

/**
 * إيميل ثابت للبائع التجريبي — المعرّف ديال الدخول.
 * لاتيني فقط: أسماء النطاقات بحروف عربية كتسبب مشاكل مع مزوّدي البريد.
 */
const emailFor = (seller: { id: string }) => `seller-${seller.id}@triq.ma`;

export const TABLES = [
  "users", "dealers", "listings", "listing_media", "listing_history",
  "price_history", "favorites", "saved_searches", "threads", "messages",
  "appointments", "reports", "notifications", "promotions", "otp_codes",
  "sessions", "listing_views",
] as const;

export interface SeedCounts {
  users: number;
  dealers: number;
  listings: number;
  history: number;
  prices: number;
}

export interface SeedProgress extends SeedCounts {
  /** أول إعلان فالدفعة الجاية، ولا null ملي نسالي */
  next: number | null;
  total: number;
}

/** عدد الإعلانات فكل دفعة — Neon كيبعد، فكل استعلام فيه ذهاب وإياب */
export const SEED_BATCH = 25;

/** مسح كامل — كيتستعمل غير مع --reset من سطر الأوامر */
export async function resetTables(q: Query) {
  await q(`TRUNCATE ${TABLES.join(", ")} RESTART IDENTITY CASCADE`);
}

/**
 * كيعمّر دفعة ديال الإعلانات.
 *
 * المستخدمون والمعارض كيتعاودو فكل دفعة — 25 صف، رخاص، وكيضمنو
 * أنّ الإعلانات كتلقى البائع ديالها حتى إلا بدات الدفعة من الوسط.
 */
export async function seedDatabase(
  q: Query,
  { from = 0, count = Number.POSITIVE_INFINITY } = {},
): Promise<SeedProgress> {
  /* ---------- المستخدمون (من البائعين) ---------- */
  const userIds = new Map<string, string>();
  for (const s of SELLERS) {
    const rows = await q<{ id: string }>(
      `INSERT INTO users (email, email_verified, phone, phone_verified, name, type,
                          city, id_verified, rating, sales_count, response_minutes,
                          member_since)
       VALUES ($1,true,$2,$3,$4,$5,$6,$7,$8,$9,$10, make_date($11,1,1))
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [emailFor(s), phoneFor(s.id), s.phoneVerified, s.name, s.type, s.city,
       s.idVerified, s.rating, s.salesCount, s.responseMinutes, s.since],
    );
    userIds.set(s.id, rows[0].id);
  }

  /* ---------- المعارض ---------- */
  const dealerIds = new Map<string, string>();
  for (const d of DEALERS) {
    const owner = userIds.get(d.id);
    if (!owner) continue;
    const rows = await q<{ id: string }>(
      `INSERT INTO dealers (owner_id, slug, name, tagline, about, address, hours,
                            city, verified, brands, cover_from, cover_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [owner, d.slug, d.name, d.tagline, d.about, d.address, d.hours,
       d.city, d.verified, d.brands, d.cover[0], d.cover[1]],
    );
    dealerIds.set(d.id, rows[0].id);
  }

  /* ---------- الإعلانات ---------- */
  let listings = 0;
  let history = 0;
  let prices = 0;

  const slice = VEHICLES.slice(from, from === 0 && count === Number.POSITIVE_INFINITY
    ? undefined
    : from + count);

  for (const v of slice) {
    const sellerUuid = userIds.get(v.sellerId);
    if (!sellerUuid) continue;
    const trust = trustOf(v).score;
    const fp = fairPriceOf(v);
    const promoDays = v.promo ? PROMOS[v.promo].days : null;

    const rows = await q<{ id: string }>(
      `INSERT INTO listings (
         ref, slug, seller_id, dealer_id, status, kind, make, model, version,
         year, km, price_mad, owners, fuel, gearbox, body, fiscal_power,
         consumption, displacement, doors, color, city, condition, first_hand,
         papers_ok, technical_control, inspected, service_book, vin_checked,
         description, equipment, negotiable, exchange_accepted,
         trust_score, fair_price_mad, fair_price_delta, photo_count, has_video,
         promo, promo_expires_at, views, saves, published_at)
       VALUES ($1,$2,$3,$4,'active',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
               $17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,
               $33,$34,$35,$36,$37,$38,
               CASE WHEN $38::promo_tier IS NULL THEN NULL
                    ELSE now() + ($39::int || ' days')::interval END,
               $40,$41,$42)
       ON CONFLICT (ref) DO UPDATE SET
         price_mad        = EXCLUDED.price_mad,
         trust_score      = EXCLUDED.trust_score,
         fair_price_mad   = EXCLUDED.fair_price_mad,
         fair_price_delta = EXCLUDED.fair_price_delta,
         updated_at       = now()
       RETURNING id`,
      [v.id, vehicleSlug(v), sellerUuid, dealerIds.get(v.sellerId) ?? null,
       v.kind, v.make, v.model, v.version, v.year, v.km, v.price, v.owners,
       v.fuel, v.gearbox, v.body, v.fiscalPower, v.consumption,
       v.displacement ?? null, v.doors ?? null, v.color, v.city, v.condition,
       v.firstHand, v.papersOk, v.technicalControl, v.inspected, v.serviceBook,
       v.vinChecked, v.description, v.equipment, v.negotiable, v.exchangeAccepted,
       trust, fp.estimate.mid, fp.delta.toFixed(4), v.photos, v.hasVideo,
       v.promo ?? null, promoDays, v.views, v.saves, v.publishedAt],
    );
    const listingId = rows[0].id;

    // سجل المركبة — إدراج واحد بلائحات موازية بدل صف بصف
    await q("DELETE FROM listing_history WHERE listing_id = $1", [listingId]);
    if (v.history.length) {
      await q(
        `INSERT INTO listing_history (listing_id, event_date, type, label, km, detail)
         SELECT $1, * FROM unnest(
           $2::date[], $3::history_type[], $4::text[], $5::int[], $6::text[])`,
        [
          listingId,
          v.history.map((h) => h.date),
          v.history.map((h) => h.type),
          v.history.map((h) => h.label),
          v.history.map((h) => h.km ?? null),
          v.history.map((h) => h.detail ?? null),
        ],
      );
      history += v.history.length;
    }

    // تاريخ الأثمنة من التخفيضات السابقة — كيفكيف، إدراج واحد
    await q("DELETE FROM price_history WHERE listing_id = $1", [listingId]);
    let p = v.price + v.priceDrops.reduce((a, b) => a + b, 0);
    const points: [number, string | null][] = [[p, v.publishedAt]];
    for (const drop of v.priceDrops) {
      p -= drop;
      points.push([p, null]);
    }
    await q(
      `INSERT INTO price_history (listing_id, price_mad, changed_at)
       SELECT $1, x.price, coalesce(x.at, now())
       FROM unnest($2::int[], $3::timestamptz[]) AS x(price, at)`,
      [listingId, points.map((x) => x[0]), points.map((x) => x[1])],
    );
    prices += points.length;
    listings++;
  }

  const consumed = from + slice.length;
  return {
    users: userIds.size,
    dealers: dealerIds.size,
    listings,
    history,
    prices,
    next: consumed < VEHICLES.length ? consumed : null,
    total: VEHICLES.length,
  };
}

/** عدد الصفوف فالجداول الأساسية — للعرض بعد الإعداد */
export async function tableCounts(q: Query): Promise<Record<string, number>> {
  const rows = await q<{ t: string; c: string }>(`
    SELECT 'users' t, count(*)::text c FROM users
    UNION ALL SELECT 'dealers', count(*)::text FROM dealers
    UNION ALL SELECT 'listings', count(*)::text FROM listings
    UNION ALL SELECT 'listing_history', count(*)::text FROM listing_history
    UNION ALL SELECT 'price_history', count(*)::text FROM price_history
    ORDER BY 1`);
  return Object.fromEntries(rows.map((r) => [r.t, Number(r.c)]));
}
