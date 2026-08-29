import "server-only";
import { sql, one } from "./client";

/* ============================================================
   الدردشة

   كل دالة كتاخذ userId وكتتحقق أن المستخدم طرف فالمحادثة.
   ماكاينش استعلام كيثق فمعرّف جاي من المتصفح بلا تحقق.
   ============================================================ */

export interface ThreadSummary {
  id: string;
  listing_id: string;
  listing_slug: string;
  listing_ref: string;
  make: string;
  model: string;
  year: number;
  price_mad: number;
  color: string | null;
  kind: "car" | "moto";
  body: string;
  /** الطرف الآخر */
  other_id: string;
  other_name: string;
  /** دور المستخدم الحالي فهاد المحادثة */
  my_role: "buyer" | "seller";
  last_body: string | null;
  last_at: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  mine: boolean;
}

/** محادثات المستخدم مرتّبة بالأحدث */
export async function listThreads(userId: string): Promise<ThreadSummary[]> {
  const rows = await sql<Omit<ThreadSummary, "unread" | "mine"> & { unread: string }>(
    `SELECT t.id, t.listing_id, l.slug AS listing_slug, l.ref AS listing_ref,
            l.make, l.model, l.year, l.price_mad, l.color, l.kind, l.body,
            CASE WHEN t.buyer_id = $1 THEN t.seller_id ELSE t.buyer_id END AS other_id,
            CASE WHEN t.buyer_id = $1 THEN su.name ELSE bu.name END AS other_name,
            CASE WHEN t.buyer_id = $1 THEN 'buyer' ELSE 'seller' END AS my_role,
            t.last_at,
            (SELECT m.body FROM messages m WHERE m.thread_id = t.id
               ORDER BY m.created_at DESC LIMIT 1) AS last_body,
            (SELECT count(*)::text FROM messages m WHERE m.thread_id = t.id
               AND m.sender_id <> $1 AND m.read_at IS NULL) AS unread
     FROM threads t
     JOIN listings l ON l.id = t.listing_id
     JOIN users bu ON bu.id = t.buyer_id
     JOIN users su ON su.id = t.seller_id
     WHERE t.buyer_id = $1 OR t.seller_id = $1
     ORDER BY t.last_at DESC`,
    [userId],
  );
  return rows.map((r) => ({ ...r, unread: Number(r.unread) })) as ThreadSummary[];
}

/** تأكيد أن المستخدم طرف فالمحادثة */
async function assertMember(threadId: string, userId: string) {
  const t = await one<{ id: string }>(
    "SELECT id FROM threads WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)",
    [threadId, userId],
  );
  if (!t) throw new Error("FORBIDDEN");
}

/**
 * رسائل محادثة.
 *
 * المؤشر هو الـid (bigserial) ماشي الطابع الزمني: JSON كيعطي الميلي ثانية
 * وPostgres كيخزن الميكرو، فمقارنة الوقت كتعاود تجيب آخر رسالة فكل استقصاء.
 */
export async function listMessages(
  threadId: string,
  userId: string,
  afterId?: string,
): Promise<ChatMessage[]> {
  await assertMember(threadId, userId);
  const cursor = afterId && /^\d+$/.test(afterId) ? afterId : null;
  const rows = await sql<Omit<ChatMessage, "mine"> & { sender_id: string }>(
    `SELECT id::text, thread_id, sender_id, body, created_at, read_at
     FROM messages
     WHERE thread_id = $1 ${cursor ? "AND id > $2::bigint" : ""}
     ORDER BY id ASC LIMIT 500`,
    cursor ? [threadId, cursor] : [threadId],
  );
  return rows.map((m) => ({ ...m, mine: m.sender_id === userId }));
}

const MAX_LEN = 2000;
/** أقصى عدد رسائل فالدقيقة لكل مستخدم */
const RATE_PER_MIN = 20;

/** إرسال رسالة */
export async function sendMessage(threadId: string, userId: string, body: string) {
  await assertMember(threadId, userId);
  const text = body.trim();
  if (!text) throw new Error("EMPTY");
  if (text.length > MAX_LEN) throw new Error("TOO_LONG");

  const recent = await one<{ n: string }>(
    `SELECT count(*)::text AS n FROM messages
     WHERE sender_id = $1 AND created_at > now() - interval '1 minute'`,
    [userId],
  );
  if (Number(recent?.n ?? 0) >= RATE_PER_MIN) throw new Error("RATE_LIMIT");

  const msg = await one<{ id: string; created_at: string }>(
    `INSERT INTO messages (thread_id, sender_id, body) VALUES ($1,$2,$3)
     RETURNING id::text, created_at`,
    [threadId, userId, text],
  );
  await sql("UPDATE threads SET last_at = now() WHERE id = $1", [threadId]);

  // إشعار للطرف الآخر
  const t = await one<{
    other: string; slug: string; name: string;
    other_email: string; title: string;
  }>(
    `SELECT CASE WHEN t.buyer_id = $2 THEN t.seller_id ELSE t.buyer_id END AS other,
            l.slug, u.name,
            o.email AS other_email,
            l.make || ' ' || l.model || ' ' || l.year::text AS title
     FROM threads t JOIN listings l ON l.id = t.listing_id
     JOIN users u ON u.id = $2
     JOIN users o ON o.id = CASE WHEN t.buyer_id = $2 THEN t.seller_id ELSE t.buyer_id END
     WHERE t.id = $1`,
    [threadId, userId],
  );
  if (t) {
    /* الإيميل كيتصيفط غير ملي ماعندوش رسائل ماقراهاش من قبل.
       بلا هاد الشرط، محادثة ديال 20 رسالة كتصيفط 20 إيميل —
       وهادشي كيخلّي المستخدم يعلّمنا كـspam. ملي يقرا، العدّاد
       كيتصفّى وكيرجع يتنبّه للرسالة الجاية. */
    const unread = await one<{ n: string }>(
      `SELECT count(*)::text AS n FROM notifications
       WHERE user_id = $1 AND type = 'message' AND read_at IS NULL`,
      [t.other],
    );

    await sql(
      `INSERT INTO notifications (user_id, type, title, body, href)
       VALUES ($1,'message',$2,$3,$4)`,
      [t.other, `رسالة جديدة من ${t.name}`, text.slice(0, 120), "/messages"],
    );

    if (Number(unread?.n ?? 0) === 0 && t.other_email) {
      const { newMessageMail, sendQuiet } = await import("@/lib/mail");
      await sendQuiet(
        newMessageMail({
          to: t.other_email,
          fromName: t.name,
          listingTitle: t.title,
          preview: text.slice(0, 300),
        }),
      );
    }
  }
  return msg!;
}

/** فتح محادثة على إعلان (ولا إرجاع الموجودة) */
export async function openThread(listingRefOrSlug: string, buyerId: string) {
  const listing = await one<{ id: string; seller_id: string }>(
    "SELECT id, seller_id FROM listings WHERE (slug = $1 OR ref = $1) AND status = 'active'",
    [listingRefOrSlug],
  );
  if (!listing) throw new Error("NOT_FOUND");
  if (listing.seller_id === buyerId) throw new Error("OWN_LISTING");

  const t = await one<{ id: string }>(
    `INSERT INTO threads (listing_id, buyer_id, seller_id) VALUES ($1,$2,$3)
     ON CONFLICT (listing_id, buyer_id) DO UPDATE SET last_at = threads.last_at
     RETURNING id`,
    [listing.id, buyerId, listing.seller_id],
  );
  return t!.id;
}

/** تعليم رسائل الطرف الآخر كمقروءة */
export async function markThreadRead(threadId: string, userId: string) {
  await assertMember(threadId, userId);
  await sql(
    `UPDATE messages SET read_at = now()
     WHERE thread_id = $1 AND sender_id <> $2 AND read_at IS NULL`,
    [threadId, userId],
  );
}

/** مجموع غير المقروء — للشارة فالهيدر */
export async function unreadCount(userId: string): Promise<number> {
  const r = await one<{ n: string }>(
    `SELECT count(*)::text AS n FROM messages m
     JOIN threads t ON t.id = m.thread_id
     WHERE (t.buyer_id = $1 OR t.seller_id = $1)
       AND m.sender_id <> $1 AND m.read_at IS NULL`,
    [userId],
  );
  return Number(r?.n ?? 0);
}
