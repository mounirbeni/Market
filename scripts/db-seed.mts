#!/usr/bin/env tsx
/**
 * تعمير قاعدة البيانات من البيانات التجريبية الموجودة.
 *
 *   npm run db:seed            # كيزيد اللي ناقص فقط
 *   npm run db:seed -- --reset # كيمسح كلشي وكيعاود من الصفر
 *
 * البيانات كتجي من src/lib/data/* — نفس اللي كيستعملها الموقع دابا،
 * فالتعمير كيثبت أن المخطط كيوسّع النموذج الحقيقي.
 */
import pg from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { VEHICLES } from "../src/lib/data/vehicles";
import { SELLERS } from "../src/lib/data/sellers";
import { DEALERS } from "../src/lib/data/dealers";
import { trustOf, fairPriceOf } from "../src/lib/market";
import { vehicleSlug } from "../src/lib/slug";
import { PROMOS } from "../src/lib/promo";
import { hashCode } from "../src/lib/data/seed";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const f = resolve(ROOT, ".env.local");
  if (existsSync(f)) {
    const m = readFileSync(f, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
    if (m) return m[1];
  }
  console.error("✗ ماكاينش DATABASE_URL");
  process.exit(1);
}

const url = databaseUrl();
const db = new pg.Client({
  connectionString: url,
  ssl: /sslmode=require/.test(url) ? { rejectUnauthorized: false } : undefined,
});
await db.connect();

const reset = process.argv.includes("--reset");
if (reset) {
  await db.query(`TRUNCATE users, dealers, listings, listing_media, listing_history,
    price_history, favorites, saved_searches, threads, messages, appointments,
    reports, notifications, promotions, otp_codes, sessions, listing_views
    RESTART IDENTITY CASCADE`);
  console.log("· تمسحات البيانات القديمة");
}

/** رقم هاتف ثابت من نفس البذرة اللي كتستعمل الواجهة */
function phoneFor(id: string) {
  const h = hashCode(id);
  return "+2126" + String(h % 100000000).padStart(8, "0");
}

/* ---------- المستخدمون (من البائعين) ---------- */
const userIds = new Map<string, string>();
for (const s of SELLERS) {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO users (phone, phone_verified, name, type, city, id_verified,
                        rating, sales_count, response_minutes, member_since)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, make_date($10,1,1))
     ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [phoneFor(s.id), s.phoneVerified, s.name, s.type, s.city, s.idVerified,
     s.rating, s.salesCount, s.responseMinutes, s.since],
  );
  userIds.set(s.id, rows[0].id);
}
console.log(`· ${userIds.size} مستخدم`);

/* ---------- المعارض ---------- */
const dealerIds = new Map<string, string>();
for (const d of DEALERS) {
  const owner = userIds.get(d.id);
  if (!owner) continue;
  const { rows } = await db.query<{ id: string }>(
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
console.log(`· ${dealerIds.size} معرض`);

/* ---------- الإعلانات ---------- */
let n = 0;
for (const v of VEHICLES) {
  const sellerUuid = userIds.get(v.sellerId);
  if (!sellerUuid) continue;
  const trust = trustOf(v).score;
  const fp = fairPriceOf(v);
  const promoDays = v.promo ? PROMOS[v.promo].days : null;

  const { rows } = await db.query<{ id: string }>(
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
     ON CONFLICT (ref) DO UPDATE SET price_mad = EXCLUDED.price_mad
     RETURNING id`,
    [v.id, vehicleSlug(v), sellerUuid, dealerIds.get(v.sellerId) ?? null,
     v.kind, v.make, v.model, v.version, v.year, v.km, v.price, v.owners,
     v.fuel, v.gearbox, v.body, v.fiscalPower, v.consumption,
     v.displacement ?? null, v.doors ?? null, v.color, v.city, v.condition,
     v.firstHand, v.papersOk, v.technicalControl, v.inspected, v.serviceBook,
     v.vinChecked, v.description, v.equipment, v.negotiable, v.exchangeAccepted,
     trust, fp.fair, fp.delta.toFixed(4), v.photos, v.hasVideo,
     v.promo ?? null, promoDays, v.views, v.saves, v.publishedAt],
  );
  const listingId = rows[0].id;

  await db.query("DELETE FROM listing_history WHERE listing_id = $1", [listingId]);
  for (const h of v.history) {
    await db.query(
      `INSERT INTO listing_history (listing_id, event_date, type, label, km, detail)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [listingId, h.date, h.type, h.label, h.km ?? null, h.detail ?? null],
    );
  }

  // تاريخ الأثمنة من التخفيضات السابقة
  await db.query("DELETE FROM price_history WHERE listing_id = $1", [listingId]);
  let p = v.price + v.priceDrops.reduce((a, b) => a + b, 0);
  await db.query(
    `INSERT INTO price_history (listing_id, price_mad, changed_at) VALUES ($1,$2,$3)`,
    [listingId, p, v.publishedAt],
  );
  for (const drop of v.priceDrops) {
    p -= drop;
    await db.query(
      `INSERT INTO price_history (listing_id, price_mad) VALUES ($1,$2)`,
      [listingId, p],
    );
  }
  n++;
}
console.log(`· ${n} إعلان (+ سجل المركبة + تاريخ الأثمنة)`);

const counts = await db.query<{ t: string; c: string }>(`
  SELECT 'users' t, count(*)::text c FROM users
  UNION ALL SELECT 'dealers', count(*)::text FROM dealers
  UNION ALL SELECT 'listings', count(*)::text FROM listings
  UNION ALL SELECT 'listing_history', count(*)::text FROM listing_history
  UNION ALL SELECT 'price_history', count(*)::text FROM price_history
  ORDER BY 1`);
console.log("\nالمجموع:");
for (const r of counts.rows) console.log(`  ${r.t.padEnd(18)} ${r.c}`);

await db.end();
