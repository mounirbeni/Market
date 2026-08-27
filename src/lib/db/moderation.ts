import "server-only";
import { sql, one } from "./client";

/* ============================================================
   استعلامات الإشراف

   التبليغات كانت كتتسجّل وحتى واحد ماكيقراهم. هنا كنقراوهم،
   وكنعطيو المشرف يحيّد إعلان ولا يحضر حساب.
   ============================================================ */

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

/** التبليغات، الجديدة أولاً */
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

/** عدد التبليغات فكل حالة — للشارات */
export async function reportCounts() {
  const rows = await sql<{ status: string; n: string }>(
    "SELECT status::text, count(*)::text n FROM reports GROUP BY status",
  );
  return Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
}

/** كيبدّل حالة إعلان — 'rejected' كيخرّجو من الموقع */
export async function setListingStatus(ref: string, status: "active" | "rejected") {
  const r = await one<{ id: string }>(
    "UPDATE listings SET status = $2::listing_status, updated_at = now() WHERE ref = $1 RETURNING id::text",
    [ref, status],
  );
  return Boolean(r);
}

/**
 * حضر ولا رفع الحضر على حساب.
 * ملي كيتحضر، الإعلانات ديالو كيخرجو من الموقع حتى هوما —
 * ماكاين علاش نخلّيو سلعة ديال حساب محضور.
 */
export async function setUserBanned(userId: string, banned: boolean) {
  await sql("UPDATE users SET banned_at = $2, updated_at = now() WHERE id = $1", [
    userId,
    banned ? new Date().toISOString() : null,
  ]);
  if (banned) {
    await sql(
      "UPDATE listings SET status = 'rejected', updated_at = now() WHERE seller_id = $1 AND status = 'active'",
      [userId],
    );
  }
}

/** كيسجّل أنّ التبليغ تعالج */
export async function resolveReport(
  id: string,
  adminId: string,
  status: "actioned" | "dismissed",
) {
  await sql(
    `UPDATE reports SET status = $3::report_status, handled_by = $2, handled_at = now()
      WHERE id = $1::uuid`,
    [id, adminId, status],
  );
}
