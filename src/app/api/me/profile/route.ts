import { getCurrentUser, normalizePhone } from "@/lib/auth";
import { body, dbMissing, fail, ok, unauthorized } from "@/lib/api";
import { CITIES } from "@/lib/cities";
import { isMediaUrl } from "@/lib/blob";

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

   استكمال الملف الشخصي (name/phone/city/type) إلزامي قبل النشر —
   users.onboarded كيتحط true هنا وحدو، مرة وحدة توصّل الأربعة
   لحالة صحيحة. الصورة اختيارية وماكتأثّرش على onboarded.
   ============================================================ */
const TYPES = ["particulier", "professionnel"] as const;

export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<{
    name?: string; phone?: string; city?: string; type?: string; avatarUrl?: string | null;
  }>(req);
  const name = String(b?.name ?? "").trim().slice(0, 80);
  const rawPhone = String(b?.phone ?? "").trim();
  const city = String(b?.city ?? "").trim();
  const type = b?.type && (TYPES as readonly string[]).includes(b.type) ? b.type : undefined;

  if (name.length < 2) return fail("الاسم قصير بزاف.", 400);
  if (city && !CITIES.some((c) => c.slug === city)) return fail("المدينة ماشي معروفة.", 400);

  let phone: string | null = null;
  if (rawPhone) {
    phone = normalizePhone(rawPhone);
    if (!phone) return fail("الرقم ماشي صحيح. مثال: 0612345678", 400);
  }

  /* الصورة: رابط ديال /api/media فقط — ماشي أي رابط خارجي، وماشي
     مسار خاص (وثائق الهوية عمرها ما كتبان فحقل عام). */
  let avatarUrl: string | undefined;
  if (b?.avatarUrl === null) avatarUrl = "";
  else if (typeof b?.avatarUrl === "string" && b.avatarUrl) {
    if (!isMediaUrl(b.avatarUrl) || !b.avatarUrl.includes(`avatars/${user.id}/`))
      return fail("رابط الصورة ماشي صحيح.", 400);
    avatarUrl = b.avatarUrl;
  }

  const { sql, one } = await import("@/lib/db/client");

  if (phone) {
    const taken = await one<{ id: string }>(
      "SELECT id FROM users WHERE phone = $1 AND id <> $2::uuid",
      [phone, user.id],
    );
    if (taken) return fail("هاد الرقم مستعمل فحساب آخر.", 409);
  }

  const finalCity = city || user.city;
  const finalPhone = phone ?? user.phone;
  /* استكمال الملف الشخصي: الاسم حقيقي (ماشي الافتراضي) والمدينة
     كافيين. الهاتف ماشي إلزامي هنا — ماكاينش مزوّد SMS يتحقق منو
     أصلاً، فما كاينش داعي نجبرو المستخدم يدخلو باش ينشر إعلان. */
  const complete = name.length >= 2 && name !== "مستعمل طريق" && Boolean(finalCity);

  await sql(
    `UPDATE users SET
       name = $2, phone = $3, city = coalesce(nullif($4,''), city),
       type = coalesce($5::seller_type, type),
       avatar_url = CASE WHEN $6::text IS NULL THEN avatar_url
                          WHEN $6::text = '' THEN NULL ELSE $6::text END,
       onboarded = onboarded OR $7::bool,
       updated_at = now()
      WHERE id = $1::uuid`,
    [user.id, name, phone, city, type ?? null, avatarUrl ?? null, complete],
  );

  return ok({ name, phone: finalPhone, city: finalCity, type: type ?? user.type, onboarded: user.onboarded || complete });
}
