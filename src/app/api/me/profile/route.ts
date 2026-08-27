import { getCurrentUser, normalizePhone } from "@/lib/auth";
import { body, dbMissing, fail, ok, unauthorized } from "@/lib/api";
import { CITIES } from "@/lib/cities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   الملف الشخصي

   الرقم كان ماكاينش كيفاش يتحط: التسجيل بالإيميل وحدو، وحقل
   الهاتف فالإعدادات كان للقراءة فقط. النتيجة: كل الإعلانات بلا
   رقم، والمشتري ماعندو غير الدردشة.

   الرقم ماكيتوثقش برسالة SMS (ماكاينش مزوّد) — كيتخزّن كما
   دخّلو صاحبو، وphone_verified كيبقى false. الشارة فالموقع
   كتقول الحقيقة.
   ============================================================ */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<{ name?: string; phone?: string; city?: string }>(req);
  const name = String(b?.name ?? "").trim().slice(0, 80);
  const rawPhone = String(b?.phone ?? "").trim();
  const city = String(b?.city ?? "").trim();

  if (name.length < 2) return fail("الاسم قصير بزاف.", 400);
  if (city && !CITIES.some((c) => c.slug === city)) return fail("المدينة ماشي معروفة.", 400);

  let phone: string | null = null;
  if (rawPhone) {
    phone = normalizePhone(rawPhone);
    if (!phone) return fail("الرقم ماشي صحيح. مثال: 0612345678", 400);
  }

  const { sql, one } = await import("@/lib/db/client");

  if (phone) {
    const taken = await one<{ id: string }>(
      "SELECT id FROM users WHERE phone = $1 AND id <> $2::uuid",
      [phone, user.id],
    );
    if (taken) return fail("هاد الرقم مستعمل فحساب آخر.", 409);
  }

  await sql(
    `UPDATE users SET name = $2, phone = $3, city = coalesce(nullif($4,''), city),
                      updated_at = now()
      WHERE id = $1::uuid`,
    [user.id, name, phone, city],
  );

  return ok({ name, phone, city: city || user.city });
}
