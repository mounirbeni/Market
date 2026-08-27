import "server-only";
import { sql, one } from "./client";

/* ============================================================
   استعلامات الإشراف

   كل حاجة كيحتاجها اللي كيسيّر السوق: نظرة عامة، الإعلانات
   بكل حالاتها، الحسابات، المعارض، التبليغات، والكتالوج.
   ============================================================ */

/* ---------------- نظرة عامة ---------------- */

export interface Overview {
  users: number;
  usersToday: number;
  pros: number;
  banned: number;
  dealers: number;
  dealersUnverified: number;
  listings: number;
  active: number;
  hidden: number;
  listingsToday: number;
  reportsOpen: number;
  messages7d: number;
  appointments: number;
  models: number;
}

export async function overview(): Promise<Overview> {
  const r = await one<Record<string, string>>(`
    SELECT
      (SELECT count(*) FROM users)::text                                        AS users,
      (SELECT count(*) FROM users WHERE created_at > now() - interval '1 day')::text AS "usersToday",
      (SELECT count(*) FROM users WHERE type = 'professionnel')::text           AS pros,
      (SELECT count(*) FROM users WHERE banned_at IS NOT NULL)::text            AS banned,
      (SELECT count(*) FROM dealers)::text                                      AS dealers,
      (SELECT count(*) FROM dealers WHERE NOT verified)::text                   AS "dealersUnverified",
      (SELECT count(*) FROM listings)::text                                     AS listings,
      (SELECT count(*) FROM listings WHERE status = 'active')::text             AS active,
      (SELECT count(*) FROM listings WHERE status = 'rejected')::text           AS hidden,
      (SELECT count(*) FROM listings WHERE created_at > now() - interval '1 day')::text AS "listingsToday",
      (SELECT count(*) FROM reports WHERE status = 'open')::text                AS "reportsOpen",
      (SELECT count(*) FROM messages WHERE created_at > now() - interval '7 days')::text AS "messages7d",
      (SELECT count(*) FROM appointments WHERE status = 'pending')::text        AS appointments,
      (SELECT count(*) FROM catalog_models)::text                               AS models
  `);
  const n = (k: string) => Number(r?.[k] ?? 0);
  return {
    users: n("users"), usersToday: n("usersToday"), pros: n("pros"), banned: n("banned"),
    dealers: n("dealers"), dealersUnverified: n("dealersUnverified"),
    listings: n("listings"), active: n("active"), hidden: n("hidden"),
    listingsToday: n("listingsToday"), reportsOpen: n("reportsOpen"),
    messages7d: n("messages7d"), appointments: n("appointments"), models: n("models"),
  };
}

/** آخر إجراءات الإشراف */
export async function recentLog(limit = 20) {
  return sql<{ email: string; action: string; target: string | null; detail: string | null; created_at: string }>(
    "SELECT email, action, target, detail, created_at FROM admin_log ORDER BY created_at DESC LIMIT $1",
    [limit],
  );
}

/* ---------------- التبليغات ---------------- */

export interface ReportRow {
  id: string;
  reason: string;
  note: string | null;
  status: string;
  created_at: string;
  listing_ref: string;
  listing_slug: string;
  listing_title: string;
  listing_status: string;
  seller_id: string;
  seller_name: string;
  seller_email: string | null;
  seller_banned: string | null;
}

export async function listReports(status = "open", limit = 60) {
  return sql<ReportRow>(
    `SELECT r.id::text, r.reason::text, r.note, r.status::text, r.created_at,
            l.ref AS listing_ref, l.slug AS listing_slug,
            l.make || ' ' || l.model || ' ' || l.year AS listing_title,
            l.status::text AS listing_status,
            u.id::text AS seller_id, u.name AS seller_name, u.email AS seller_email,
            u.banned_at AS seller_banned
       FROM reports r
       JOIN listings l ON l.id = r.listing_id
       JOIN users u    ON u.id = l.seller_id
      WHERE ($1 = 'all' OR r.status::text = $1)
      ORDER BY r.created_at DESC
      LIMIT $2`,
    [status, limit],
  );
}

export async function reportCounts() {
  const rows = await sql<{ status: string; n: string }>(
    "SELECT status::text, count(*)::text n FROM reports GROUP BY status",
  );
  return Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
}

export async function resolveReport(id: string, status: "actioned" | "dismissed") {
  await sql(
    "UPDATE reports SET status = $2::report_status, handled_at = now() WHERE id = $1::uuid",
    [id, status],
  );
}

/* ---------------- الإعلانات ---------------- */

export interface AdminListing {
  ref: string;
  slug: string;
  title: string;
  status: string;
  price_mad: number;
  city: string;
  photo_count: number;
  trust_score: number | null;
  views: number;
  promo: string | null;
  created_at: string;
  seller_id: string;
  seller_name: string;
  seller_email: string | null;
  seller_banned: string | null;
  reports: string;
}

export async function listListings(q = "", status = "all", limit = 60) {
  return sql<AdminListing>(
    `SELECT l.ref, l.slug, l.make || ' ' || l.model || ' ' || l.year AS title,
            l.status::text, l.price_mad, l.city, l.photo_count, l.trust_score,
            l.views, l.promo::text, l.created_at,
            u.id::text AS seller_id, u.name AS seller_name, u.email AS seller_email,
            u.banned_at AS seller_banned,
            (SELECT count(*)::text FROM reports r WHERE r.listing_id = l.id AND r.status='open') AS reports
       FROM listings l JOIN users u ON u.id = l.seller_id
      WHERE ($2 = 'all' OR l.status::text = $2)
        AND ($1 = '' OR l.ref ILIKE '%'||$1||'%' OR l.make ILIKE '%'||$1||'%'
             OR l.model ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%')
      ORDER BY l.created_at DESC
      LIMIT $3`,
    [q, status, limit],
  );
}

export async function setListingStatus(
  ref: string,
  status: "active" | "rejected" | "sold",
) {
  const r = await one<{ id: string }>(
    "UPDATE listings SET status = $2::listing_status, updated_at = now() WHERE ref = $1 RETURNING id::text",
    [ref, status],
  );
  return Boolean(r);
}

/** ترويج مجاني من الإشراف — ولا رفعو */
export async function setListingPromo(ref: string, promo: string | null) {
  const r = await one<{ id: string }>(
    "UPDATE listings SET promo = $2::promo_tier, updated_at = now() WHERE ref = $1 RETURNING id::text",
    [ref, promo],
  );
  return Boolean(r);
}

/** حذف نهائي — الصور والسجل كيمشيو معاه (ON DELETE CASCADE) */
export async function deleteListing(ref: string) {
  const r = await one<{ id: string }>(
    "DELETE FROM listings WHERE ref = $1 RETURNING id::text",
    [ref],
  );
  return Boolean(r);
}

/* ---------------- الحسابات ---------------- */

export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  city: string | null;
  id_verified: boolean;
  banned_at: string | null;
  created_at: string;
  listings: string;
}

export async function listUsers(q = "", filter = "all", limit = 60) {
  return sql<AdminUser>(
    `SELECT u.id::text, u.name, u.email, u.phone, u.type::text, u.city,
            u.id_verified, u.banned_at, u.created_at,
            (SELECT count(*)::text FROM listings l WHERE l.seller_id = u.id) AS listings
       FROM users u
      WHERE ($1 = '' OR u.email ILIKE '%'||$1||'%' OR u.name ILIKE '%'||$1||'%'
             OR u.phone ILIKE '%'||$1||'%')
        AND ($2 = 'all'
             OR ($2 = 'banned' AND u.banned_at IS NOT NULL)
             OR ($2 = 'pro'    AND u.type = 'professionnel')
             OR ($2 = 'verified' AND u.id_verified))
      ORDER BY u.created_at DESC
      LIMIT $3`,
    [q, filter, limit],
  );
}

export async function setUserBanned(userId: string, banned: boolean) {
  await sql("UPDATE users SET banned_at = $2, updated_at = now() WHERE id = $1::uuid", [
    userId,
    banned ? new Date().toISOString() : null,
  ]);
  if (banned) {
    // الجلسات ديالو كيتمسحو — الحضر كيبدا دابا ماشي ملي تسالي الجلسة
    await sql("DELETE FROM sessions WHERE user_id = $1::uuid", [userId]);
    await sql(
      "UPDATE listings SET status = 'rejected', updated_at = now() WHERE seller_id = $1::uuid AND status = 'active'",
      [userId],
    );
  }
}

export async function setUserVerified(userId: string, verified: boolean) {
  await sql("UPDATE users SET id_verified = $2, updated_at = now() WHERE id = $1::uuid", [
    userId,
    verified,
  ]);
}

export async function setUserType(userId: string, pro: boolean) {
  await sql(
    "UPDATE users SET type = $2::seller_type, updated_at = now() WHERE id = $1::uuid",
    [userId, pro ? "professionnel" : "particulier"],
  );
}

/* ---------------- المعارض ---------------- */

export interface AdminDealer {
  slug: string;
  name: string;
  city: string;
  verified: boolean;
  created_at: string;
  owner_id: string;
  owner_name: string;
  owner_email: string | null;
  listings: string;
}

export async function listDealers() {
  return sql<AdminDealer>(
    `SELECT d.slug, d.name, d.city, d.verified, d.created_at,
            u.id::text AS owner_id, u.name AS owner_name, u.email AS owner_email,
            (SELECT count(*)::text FROM listings l WHERE l.dealer_id = d.id) AS listings
       FROM dealers d JOIN users u ON u.id = d.owner_id
      ORDER BY d.verified, d.created_at DESC`,
  );
}

export async function setDealerVerified(slug: string, verified: boolean) {
  const r = await one<{ id: string }>(
    "UPDATE dealers SET verified = $2, updated_at = now() WHERE slug = $1 RETURNING id::text",
    [slug, verified],
  );
  return Boolean(r);
}

/* ---------------- الكتالوج ---------------- */

export async function listCatalog(q = "", limit = 200) {
  return sql<{ kind: string; make: string; model: string; body: string | null; listings: string }>(
    `SELECT c.kind::text, c.make, c.model, c.body::text,
            (SELECT count(*)::text FROM listings l
              WHERE l.make = c.make AND l.model = c.model) AS listings
       FROM catalog_models c
      WHERE ($1 = '' OR c.make ILIKE '%'||$1||'%' OR c.model ILIKE '%'||$1||'%')
      ORDER BY c.make, c.model
      LIMIT $2`,
    [q, limit],
  );
}

export async function addCatalogModel(kind: string, make: string, model: string) {
  await sql(
    `INSERT INTO catalog_models (kind, make, model) VALUES ($1::vehicle_kind, $2, $3)
     ON CONFLICT DO NOTHING`,
    [kind, make.trim(), model.trim()],
  );
  await sql(
    `INSERT INTO catalog_brands (make, kind) VALUES ($1, $2::vehicle_kind)
     ON CONFLICT DO NOTHING`,
    [make.trim(), kind],
  );
}

export async function removeCatalogModel(kind: string, make: string, model: string) {
  await sql(
    "DELETE FROM catalog_models WHERE kind = $1::vehicle_kind AND make = $2 AND model = $3",
    [kind, make, model],
  );
}
