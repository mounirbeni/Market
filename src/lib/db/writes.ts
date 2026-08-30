import "server-only";
import { sql, one } from "./client";
import { slugify } from "@/lib/slug";
import type { Vehicle } from "@/lib/types";

/* ============================================================
   الكتابة فقاعدة البيانات

   كل دالة هنا كتفترض أنّ المستخدم تحقّق منّو فوق (فالمسار).
   الأخطاء المتوقّعة كتّرمى كـError بكود قصير، والمسار كيترجمو
   لرسالة بالدارجة.
   ============================================================ */

export class WriteError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

/* ---------- نشر إعلان ---------- */

export interface NewListing {
  kind: "car" | "moto";
  make: string;
  model: string;
  version: string;
  year: number;
  km: number;
  price: number;
  owners: number;
  fuel: string;
  gearbox: string;
  body: string;
  fiscalPower: number;
  consumption?: number | null;
  displacement?: number | null;
  doors?: number | null;
  color?: string | null;
  drivetrain?: string | null;
  origin?: string | null;
  city: string;
  condition: string;
  firstHand: boolean;
  papersOk: boolean;
  technicalControl?: string | null;
  inspected: boolean;
  serviceBook: boolean;
  vinChecked: boolean;
  accidentDeclared: boolean;
  accidentNote?: string | null;
  description: string;
  equipment: string[];
  negotiable: boolean;
  exchangeAccepted: boolean;
  photoCount: number;
  hasVideo: boolean;
  /** الصور المرفوعة — كتّسجل مع الإعلان فنفس العملية */
  media?: {
    url: string;
    kind: "photo" | "video";
    thumbUrl?: string;
    width?: number;
    height?: number;
  }[];
  /* القيم المحسوبة — كتّحسب فالمسار بنفس دوال العرض */
  trustScore: number;
  fairPriceMad: number;
  fairPriceDelta: number;
}

/**
 * كينشر إعلان جديد ويرجع المرجع والـslug.
 *
 * المرجع كيجي من تسلسل Postgres باش ماكاينش تصادم بين طلبين
 * فنفس اللحظة، والـslug كيتبنى منّو بنفس صيغة باقي الموقع.
 */
/* حدود النشر — بلاهم شي واحد يقدر يعمّر الموقع بإعلانات فدقيقة.
   بائع عادي كينشر مركبة ولا جوج فالشهر؛ حتى معرض كبير ماكيوصلش
   لهاد الأرقام فيوم. */
const MAX_PER_HOUR = 10;
const MAX_PER_DAY = 30;

/** كيرمي RATE_LIMIT إلا فات المستخدم الحد */
async function assertPublishAllowed(sellerId: string) {
  const r = await one<{ h: string; d: string }>(
    `SELECT
       count(*) FILTER (WHERE created_at > now() - interval '1 hour')::text AS h,
       count(*) FILTER (WHERE created_at > now() - interval '1 day')::text  AS d
     FROM listings WHERE seller_id = $1`,
    [sellerId],
  );
  if (Number(r?.h ?? 0) >= MAX_PER_HOUR || Number(r?.d ?? 0) >= MAX_PER_DAY) {
    throw new Error("RATE_LIMIT");
  }
}

export async function createListing(sellerId: string, v: NewListing) {
  await assertPublishAllowed(sellerId);

  const prefix = v.kind === "moto" ? "m" : "c";
  const row = await one<{ id: string; ref: string; slug: string }>(
    `WITH r AS (
       -- التسلسل كيبدا من 1000، فالرقم ديما 4 أرقام ولا أكثر.
       -- (lpad كيقصّ ملي يكون النص أطول من الطول المطلوب — علاش بلا lpad)
       SELECT $1 || nextval('listing_ref_seq')::text AS ref
     )
     INSERT INTO listings (
       ref, slug, seller_id, status, kind, make, model, version, year, km,
       price_mad, owners, fuel, gearbox, body, fiscal_power, consumption,
       displacement, doors, color, city, condition, first_hand, papers_ok,
       technical_control, inspected, service_book, vin_checked, description,
       equipment, negotiable, exchange_accepted, trust_score, fair_price_mad,
       fair_price_delta, photo_count, has_video, drivetrain, origin,
       accident_declared, accident_note, published_at)
     SELECT
       r.ref,
       $2 || '-' || $3 || '-' || $4::text || '-' || r.ref,
       $5::uuid, 'active', $6::vehicle_kind, $7, $8, $9, $4::smallint,
       $10::int, $11::int, $12::smallint, $13::fuel_type, $14::gearbox_type,
       $15::body_type, $16::smallint, $17::numeric, $18::int, $19::smallint,
       $20, $21, $22::condition_type, $23::bool, $24::bool, $25::date,
       $26::bool, $27::bool, $28::bool, $29, $30::text[], $31::bool,
       $32::bool, $33::smallint, $34::int, $35::numeric, $36::smallint,
       $37::bool, $38::drivetrain_type, $39::origin_type,
       $40::bool, $41, now()
     FROM r
     RETURNING id, ref, slug`,
    [
      prefix, slugify(v.make), slugify(v.model), v.year,
      sellerId, v.kind, v.make, v.model, v.version, v.km,
      v.price, v.owners, v.fuel, v.gearbox, v.body, v.fiscalPower,
      v.consumption ?? null, v.displacement ?? null, v.doors ?? null,
      v.color ?? null, v.city, v.condition, v.firstHand, v.papersOk,
      v.technicalControl ?? null, v.inspected, v.serviceBook, v.vinChecked,
      v.description, v.equipment, v.negotiable, v.exchangeAccepted,
      v.trustScore, v.fairPriceMad, v.fairPriceDelta.toFixed(4),
      v.photoCount, v.hasVideo, v.drivetrain ?? null, v.origin ?? null,
      v.accidentDeclared, v.accidentNote ?? null,
    ],
  );
  if (!row) throw new WriteError("INSERT_FAILED");

  // الصور تّرفعو قبل ما يتنشر الإعلان — دابا كنربطوهم بيه
  const media = v.media ?? [];
  for (const [i, m] of media.entries()) {
    await sql(
      `INSERT INTO listing_media (listing_id, url, thumb_url, kind, width, height, position)
       VALUES ($1, $2, $3, $4::media_kind, $5, $6, $7)`,
      [row.id, m.url, m.thumbUrl ?? null, m.kind, m.width ?? null, m.height ?? null, i],
    );
  }
  if (media.length > 0) {
    await sql(
      `UPDATE listings SET
         photo_count = (SELECT count(*) FROM listing_media
                         WHERE listing_id = $1 AND kind = 'photo'),
         has_video   = EXISTS (SELECT 1 FROM listing_media
                                WHERE listing_id = $1 AND kind = 'video')
       WHERE id = $1`,
      [row.id],
    );
  }

  return row;
}

/** تعديل ثمن إعلان — كيسجّل التغيير فتاريخ الأثمنة */
export async function updateListingPrice(sellerId: string, ref: string, price: number) {
  const l = await one<{ id: string; price_mad: number }>(
    "SELECT id, price_mad FROM listings WHERE ref = $1 AND seller_id = $2",
    [ref, sellerId],
  );
  if (!l) throw new WriteError("NOT_FOUND");
  if (l.price_mad === price) return { changed: false };

  await sql("INSERT INTO price_history (listing_id, price_mad) VALUES ($1, $2)", [l.id, price]);
  await sql("UPDATE listings SET price_mad = $2, updated_at = now() WHERE id = $1", [l.id, price]);

  // تنبيه اللي كيراقبو الثمن
  if (price < l.price_mad) {
    await sql(
      `INSERT INTO notifications (user_id, type, title, body, href)
       SELECT f.user_id, 'price-drop', 'الثمن هبط',
              'إعلان كتراقب هبط ثمنو.', '/vehicle/' || l.slug
       FROM favorites f JOIN listings l ON l.id = f.listing_id
       WHERE f.listing_id = $1 AND f.price_watch`,
      [l.id],
    );

    /* هبوط الثمن حدث نادر (البائع هو اللي كيبدّلو) — فكل واحد
       كيراقب كيستاهل إيميل، بلا خوف من الإزعاج. */
    const watchers = await sql<{ email: string; slug: string; title: string }>(
      `SELECT u.email, l.slug,
              l.make || ' ' || l.model || ' ' || l.year::text AS title
       FROM favorites f
       JOIN listings l ON l.id = f.listing_id
       JOIN users u ON u.id = f.user_id
       WHERE f.listing_id = $1 AND f.price_watch AND u.email IS NOT NULL`,
      [l.id],
    );
    if (watchers.length) {
      const { priceDropMail, sendQuiet } = await import("@/lib/mail");
      await Promise.all(
        watchers.map((w) =>
          sendQuiet(
            priceDropMail({
              to: w.email,
              listingTitle: w.title,
              oldPrice: l.price_mad,
              newPrice: price,
              slug: w.slug,
            }),
          ),
        ),
      );
    }
  }
  return { changed: true };
}

/* ============================================================
   تعديل إعلان

   ماكيتبدّلش: النوع، الماركة، الموديل، والسنة. هادو هوما هوية
   الإعلان — فيهم الرابط (slug)، والمشاهدات والمفضّلة والدردشات
   كلها مربوطة بيهم. اللي بغا يبدّل السيارة خاصو إعلان جديد،
   ماشي يقلب إعلان قديم لسلعة أخرى وياخد معاه المشاهدات.

   الثمن كيدوز من updateListingPrice باش يتسجّل فتاريخ الأثمنة
   وينبّه اللي كيراقبو.
   ============================================================ */
export interface ListingEdit {
  version: string;
  km: number;
  price: number;
  owners: number;
  fuel: string;
  gearbox: string;
  body: string;
  fiscalPower: number;
  consumption: number;
  displacement: number | null;
  doors: number | null;
  color: string;
  drivetrain: string | null;
  origin: string | null;
  city: string;
  condition: string;
  papersOk: boolean;
  technicalControl: string | null;
  inspected: boolean;
  serviceBook: boolean;
  vinChecked: boolean;
  accidentDeclared: boolean;
  accidentNote: string | null;
  description: string;
  equipment: string[];
  negotiable: boolean;
  exchangeAccepted: boolean;
  trustScore: number;
  fairPriceMad: number;
  fairPriceDelta: number;
}

export async function updateListing(sellerId: string, ref: string, p: ListingEdit) {
  const l = await one<{ id: string; slug: string }>(
    "SELECT id, slug FROM listings WHERE ref = $1 AND seller_id = $2",
    [ref, sellerId],
  );
  if (!l) throw new WriteError("NOT_FOUND");

  // الثمن أولاً: عندو تاريخ وتنبيهات ديالو
  await updateListingPrice(sellerId, ref, p.price);

  await sql(
    `UPDATE listings SET
       version = $2, km = $3::int, owners = $4::smallint,
       fuel = $5::fuel_type, gearbox = $6::gearbox_type, body = $7::body_type,
       fiscal_power = $8::smallint, consumption = $9::numeric,
       displacement = $10::int, doors = $11::smallint, color = $12,
       city = $13, condition = $14::condition_type,
       first_hand = ($4::smallint = 1), papers_ok = $15::bool,
       technical_control = $16::date, inspected = $17::bool,
       service_book = $18::bool, vin_checked = $19::bool,
       description = $20, equipment = $21::text[],
       negotiable = $22::bool, exchange_accepted = $23::bool,
       trust_score = $24::smallint, fair_price_mad = $25::int,
       fair_price_delta = $26::numeric,
       drivetrain = $27::drivetrain_type, origin = $28::origin_type,
       accident_declared = $29::bool, accident_note = $30,
       updated_at = now()
     WHERE id = $1`,
    [
      l.id, p.version, p.km, p.owners, p.fuel, p.gearbox, p.body,
      p.fiscalPower, p.consumption, p.displacement, p.doors, p.color,
      p.city, p.condition, p.papersOk, p.technicalControl, p.inspected,
      p.serviceBook, p.vinChecked, p.description, p.equipment,
      p.negotiable, p.exchangeAccepted, p.trustScore, p.fairPriceMad,
      p.fairPriceDelta.toFixed(4), p.drivetrain, p.origin,
      p.accidentDeclared, p.accidentNote,
    ],
  );
  return { slug: l.slug };
}

/**
 * حذف إعلان ديال صاحبو.
 *
 * كنرجّعو مسارات الصور قبل الحذف: الصفوف كيمشيو بـCASCADE ولكن
 * الملفات فالخزّان كيبقاو كيتخلّصو عليهم. الطريق هو اللي كيمسحهم.
 */
export async function deleteListing(sellerId: string, ref: string) {
  const l = await one<{ id: string }>(
    "SELECT id FROM listings WHERE ref = $1 AND seller_id = $2",
    [ref, sellerId],
  );
  if (!l) throw new WriteError("NOT_FOUND");

  const media = await sql<{ url: string; thumb_url: string | null }>(
    "SELECT url, thumb_url FROM listing_media WHERE listing_id = $1",
    [l.id],
  );
  await sql("DELETE FROM listings WHERE id = $1", [l.id]);
  return media.flatMap((m) => [m.url, m.thumb_url].filter((u): u is string => Boolean(u)));
}

/** تغيير حالة إعلان (مباع، منتهي…) */
export async function setListingStatus(sellerId: string, ref: string, status: string) {
  const allowed = ["active", "sold", "expired", "draft"];
  if (!allowed.includes(status)) throw new WriteError("BAD_STATUS");
  const r = await one<{ id: string }>(
    `UPDATE listings
     SET status = $3::listing_status,
         sold_at = CASE WHEN $3 = 'sold' THEN now() ELSE sold_at END,
         updated_at = now()
     WHERE ref = $1 AND seller_id = $2
     RETURNING id`,
    [ref, sellerId, status],
  );
  if (!r) throw new WriteError("NOT_FOUND");
}

/* ---------- المفضّلة ومراقبة الثمن ---------- */

async function listingIdOf(ref: string) {
  const l = await one<{ id: string }>(
    "SELECT id FROM listings WHERE ref = $1 OR slug = $1",
    [ref],
  );
  if (!l) throw new WriteError("NOT_FOUND");
  return l.id;
}

export async function listFavorites(userId: string) {
  return sql<{ ref: string; price_watch: boolean }>(
    `SELECT l.ref, f.price_watch FROM favorites f
     JOIN listings l ON l.id = f.listing_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId],
  );
}

export async function addFavorite(userId: string, ref: string) {
  const id = await listingIdOf(ref);
  const inserted = await sql(
    `INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)
     ON CONFLICT (user_id, listing_id) DO NOTHING
     RETURNING user_id`,
    [userId, id],
  );
  // العدّاد المعروض فالإعلان — كيزيد غير ملي يكون الحفظ جديد
  if (inserted.length > 0) await sql("UPDATE listings SET saves = saves + 1 WHERE id = $1", [id]);
}

export async function removeFavorite(userId: string, ref: string) {
  const id = await listingIdOf(ref);
  const gone = await sql(
    "DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2 RETURNING user_id",
    [userId, id],
  );
  if (gone.length > 0)
    await sql("UPDATE listings SET saves = greatest(0, saves - 1) WHERE id = $1", [id]);
}

export async function setPriceWatch(userId: string, ref: string, on: boolean) {
  const id = await listingIdOf(ref);
  await sql(
    `INSERT INTO favorites (user_id, listing_id, price_watch) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, listing_id) DO UPDATE SET price_watch = EXCLUDED.price_watch`,
    [userId, id, on],
  );
}

/* ---------- البحوث المحفوظة ---------- */

export async function listSearches(userId: string) {
  return sql<{ id: string; label: string; query: string; alert: boolean; created_at: Date }>(
    `SELECT id, label, query, alert, created_at FROM saved_searches
     WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
}

export async function addSearch(userId: string, label: string, query: string) {
  const clean = label.trim().slice(0, 120) || "بحث محفوظ";
  const r = await one<{ id: string }>(
    `INSERT INTO saved_searches (user_id, label, query) VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, clean, query.slice(0, 2000)],
  );
  return r!.id;
}

export async function removeSearch(userId: string, id: string) {
  await sql("DELETE FROM saved_searches WHERE id = $1 AND user_id = $2", [id, userId]);
}

export async function setSearchAlert(userId: string, id: string, on: boolean) {
  await sql("UPDATE saved_searches SET alert = $3 WHERE id = $1 AND user_id = $2", [id, userId, on]);
}

/* ---------- التبليغ عن إعلان ---------- */

/** نفس قيم report_reason فقاعدة البيانات وفنافذة التبليغ */
const REPORT_REASONS = [
  "fake", "sold", "price", "photos", "papers", "deposit", "duplicate", "other",
];

export async function reportListing(
  reporterId: string | null,
  ref: string,
  reason: string,
  note: string,
) {
  if (!REPORT_REASONS.includes(reason)) throw new WriteError("BAD_REASON");
  const id = await listingIdOf(ref);
  await sql(
    `INSERT INTO reports (listing_id, reporter_id, reason, note)
     VALUES ($1, $2, $3::report_reason, $4)`,
    [id, reporterId, reason, note.trim().slice(0, 1000) || null],
  );
}

/* ---------- المواعيد ---------- */

export async function requestAppointment(
  buyerId: string,
  ref: string,
  scheduledAt: Date,
  place: string,
) {
  const l = await one<{ id: string; seller_id: string }>(
    "SELECT id, seller_id FROM listings WHERE ref = $1 OR slug = $1",
    [ref],
  );
  if (!l) throw new WriteError("NOT_FOUND");
  if (l.seller_id === buyerId) throw new WriteError("OWN_LISTING");
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now())
    throw new WriteError("BAD_DATE");

  const r = await one<{ id: string }>(
    `INSERT INTO appointments (listing_id, buyer_id, seller_id, scheduled_at, place)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [l.id, buyerId, l.seller_id, scheduledAt, place.trim().slice(0, 200) || null],
  );

  await sql(
    `INSERT INTO notifications (user_id, type, title, body, href)
     VALUES ($1, 'appointment', 'طلب موعد جديد', 'شي حد بغى يشوف مركبتك.', '/dashboard/appointments')`,
    [l.seller_id],
  );

  /* الموعد كيضيع إلا البائع مادخلش للموقع — علاش الإيميل هنا
     مهم أكثر من باقي الإشعارات. */
  const seller = await one<{ email: string; title: string }>(
    `SELECT u.email, l.make || ' ' || l.model || ' ' || l.year::text AS title
     FROM users u, listings l
     WHERE u.id = $1::uuid AND l.id = $2`,
    [l.seller_id, l.id],
  );
  if (seller?.email) {
    const { appointmentRequestMail, sendQuiet } = await import("@/lib/mail");
    await sendQuiet(
      appointmentRequestMail({
        to: seller.email,
        listingTitle: seller.title,
        when: scheduledAt.toLocaleString("ar-MA", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Africa/Casablanca",
        }),
        place: place.trim().slice(0, 200) || null,
      }),
    );
  }
  return r!.id;
}

export async function listAppointments(userId: string) {
  return sql<{
    id: string; ref: string; person: string; scheduled_at: Date;
    place: string | null; status: string; role: string;
  }>(
    `SELECT a.id, l.ref, a.scheduled_at, a.place, a.status::text AS status,
            CASE WHEN a.seller_id = $1 THEN 'seller' ELSE 'buyer' END AS role,
            CASE WHEN a.seller_id = $1 THEN b.name ELSE s.name END AS person
     FROM appointments a
     JOIN listings l ON l.id = a.listing_id
     JOIN users b ON b.id = a.buyer_id
     JOIN users s ON s.id = a.seller_id
     WHERE a.buyer_id = $1 OR a.seller_id = $1
     ORDER BY a.scheduled_at DESC`,
    [userId],
  );
}

export async function setAppointmentStatus(userId: string, id: string, status: string) {
  const allowed = ["pending", "confirmed", "done", "cancelled"];
  if (!allowed.includes(status)) throw new WriteError("BAD_STATUS");
  const r = await one<{ id: string }>(
    `UPDATE appointments SET status = $3::appt_status
     WHERE id = $1 AND (seller_id = $2 OR buyer_id = $2)
     RETURNING id`,
    [id, userId, status],
  );
  if (!r) throw new WriteError("NOT_FOUND");
}

/* ---------- الترويج ---------- */

/**
 * كيسجّل طلب ترويج.
 *
 * الأداء ماشي مربوط دابا — كنسجّلو الطلب بلا paid_at، والترويج
 * كيتفعّل ملي يتأكّد الأداء. هكا الجدول جاهز لأي مزوّد (CMI…)
 * بلا ما نبدّلو المخطّط.
 */
export async function requestPromotion(
  userId: string,
  ref: string,
  tier: string,
  amountMad: number,
  days: number,
) {
  if (!["top", "urgent", "featured"].includes(tier)) throw new WriteError("BAD_TIER");
  const l = await one<{ id: string; seller_id: string }>(
    "SELECT id, seller_id FROM listings WHERE ref = $1 OR slug = $1",
    [ref],
  );
  if (!l) throw new WriteError("NOT_FOUND");
  if (l.seller_id !== userId) throw new WriteError("FORBIDDEN");

  const r = await one<{ id: string }>(
    `INSERT INTO promotions (listing_id, user_id, tier, amount_mad, days, provider)
     VALUES ($1, $2, $3::promo_tier, $4, $5, 'manual') RETURNING id`,
    [l.id, userId, tier, amountMad, days],
  );
  return r!.id;
}

/* ---------- الصور ---------- */

export async function addMedia(
  sellerId: string,
  ref: string,
  items: { url: string; kind: "photo" | "video"; position: number }[],
) {
  const l = await one<{ id: string }>(
    "SELECT id FROM listings WHERE ref = $1 AND seller_id = $2",
    [ref, sellerId],
  );
  if (!l) throw new WriteError("NOT_FOUND");

  for (const m of items) {
    await sql(
      `INSERT INTO listing_media (listing_id, url, kind, position)
       VALUES ($1, $2, $3::media_kind, $4)`,
      [l.id, m.url, m.kind, m.position],
    );
  }
  await sql(
    `UPDATE listings SET
       photo_count = (SELECT count(*) FROM listing_media WHERE listing_id = $1 AND kind = 'photo'),
       has_video   = EXISTS (SELECT 1 FROM listing_media WHERE listing_id = $1 AND kind = 'video')
     WHERE id = $1`,
    [l.id],
  );
}

export type { Vehicle };

/* ---------- الإشعارات ---------- */

export async function listNotifications(userId: string) {
  return sql<{
    id: string; type: string; title: string; body: string | null;
    href: string | null; read_at: Date | null; created_at: Date;
  }>(
    `SELECT id::text, type::text, title, body, href, read_at, created_at
     FROM notifications WHERE user_id = $1
     ORDER BY created_at DESC LIMIT 60`,
    [userId],
  );
}

/** كيعلّم إشعار (ولا الكل) كمقروء */
export async function markNotificationsRead(userId: string, ids?: string[]) {
  if (ids && ids.length > 0) {
    await sql(
      `UPDATE notifications SET read_at = now()
       WHERE user_id = $1 AND read_at IS NULL AND id = ANY($2::bigint[])`,
      [userId, ids],
    );
    return;
  }
  await sql(
    "UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL",
    [userId],
  );
}

/* ============================================================
   المعارض

   أي مستخدم يقدر يصاوب ملف معرض. الملف كيولّي الحساب
   «محترف»، وكيبان فصفحة /dealers مع المخزون ديالو.

   التوثيق (`verified`) ماكيتحطش من هنا: كيتحط باليد ملي يتأكّد
   السجل التجاري. شارة موثّقة اللي كياخدها الواحد بوحدو ماعندها
   معنى.
   ============================================================ */

export interface DealerProfile {
  name: string;
  slug: string;
  tagline: string;
  about: string;
  address: string;
  hours: string;
  city: string;
  brands: string[];
}

/** كيصاوب ولا كيحيّن ملف المعرض ديال المستخدم */
export async function upsertDealer(ownerId: string, p: DealerProfile) {
  const existing = await one<{ id: string; slug: string }>(
    "SELECT id::text, slug FROM dealers WHERE owner_id = $1",
    [ownerId],
  );

  // الـslug خاصو يكون فريد — إلا كان مأخوذ عند شي واحد آخر كنزيدو رقم
  let slug = slugify(p.slug || p.name) || "dealer";
  for (let n = 0; n < 40; n++) {
    const taken = await one<{ id: string }>(
      "SELECT id::text FROM dealers WHERE slug = $1 AND owner_id <> $2",
      [slug, ownerId],
    );
    if (!taken) break;
    slug = `${slugify(p.slug || p.name) || "dealer"}-${n + 2}`;
  }

  const args = [
    ownerId, slug, p.name, p.tagline || null, p.about || null,
    p.address || null, p.hours || null, p.city, p.brands,
  ];

  const row = existing
    ? await one<{ slug: string }>(
        `UPDATE dealers SET slug=$2, name=$3, tagline=$4, about=$5,
           address=$6, hours=$7, city=$8, brands=$9, updated_at=now()
         WHERE owner_id=$1 RETURNING slug`,
        args,
      )
    : await one<{ slug: string }>(
        `INSERT INTO dealers (owner_id, slug, name, tagline, about, address, hours, city, brands)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING slug`,
        args,
      );

  if (!row) throw new WriteError("INSERT_FAILED");

  // صاحب معرض = بائع محترف
  await sql("UPDATE users SET type = 'professionnel', updated_at = now() WHERE id = $1", [ownerId]);
  return row;
}

/** ملف المعرض ديال المستخدم — للفورمير */
export async function myDealer(ownerId: string) {
  return one<{
    slug: string; name: string; tagline: string | null; about: string | null;
    address: string | null; hours: string | null; city: string;
    brands: string[]; verified: boolean;
  }>(
    `SELECT slug, name, tagline, about, address, hours, city, brands, verified
       FROM dealers WHERE owner_id = $1`,
    [ownerId],
  );
}
