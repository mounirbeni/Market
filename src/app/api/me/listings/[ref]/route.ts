import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, fail, ok, unauthorized, writeFail } from "@/lib/api";
import { fairPrice, trustScore } from "@/lib/market";
import { comparablesFor } from "@/lib/source";
import { CITIES } from "@/lib/cities";
import { pathnameFromMediaUrl } from "@/lib/blob";
import type { Body, Condition, Fuel, Gearbox, Vehicle } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   التحكّم فإعلان ديالك

   الأزرار ديال «إعلاناتي» (تعديل، إيقاف مؤقت، علّم كمباع، حذف)
   كانو مرسومين وبلا حتى onClick — كيبانو خدّامين وماكيديرو والو.
   هادا هو الطريق اللي كيخلّيهم يخدمو بجدّ.

   كل عملية كتفحص أنّ الإعلان ديال اللي طالب — الفحص فالاستعلام
   راسو (ref + seller_id)، ماشي فالواجهة.
   ============================================================ */

const FUELS: Fuel[] = ["diesel", "essence", "hybride", "electrique"];
const GEARBOXES: Gearbox[] = ["manuelle", "automatique"];
const BODIES: Body[] = [
  "citadine", "berline", "suv", "break", "utilitaire", "cabriolet",
  "scooter", "roadster", "trail", "sportive", "custom",
];
const CONDITIONS: Condition[] = ["excellent", "tres-bon", "bon", "moyen"];
const DRIVETRAINS = ["fwd", "rwd", "awd"] as const;
const ORIGINS = ["maghribia", "mostawrada"] as const;

const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const pick = <T extends string>(list: T[], v: unknown, fallback: T): T =>
  list.includes(v as T) ? (v as T) : fallback;
const pickOptional = <T extends string>(list: readonly T[], v: unknown): T | undefined =>
  list.includes(v as T) ? (v as T) : undefined;

interface PatchBody {
  /** تبديل الحالة وحدها: active | draft | sold */
  status?: string;
  /** ولا تعديل كامل للمحتوى */
  edit?: Record<string, unknown>;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const missing = dbMissing();
  if (missing) return missing;

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { ref } = await params;
  const b = await body<PatchBody>(req);
  if (!b) return fail("الطلب ماشي صحيح.");

  const writes = await import("@/lib/db/writes");

  /* ---------- تبديل الحالة ---------- */
  if (b.status) {
    /* «إيقاف مؤقت» هو draft: الإعلان كيخرج من البحث وكيبقى عند
       صاحبو باش يرجّعو ملي يبغي. */
    if (!["active", "draft", "sold"].includes(b.status))
      return fail("الحالة ماشي معروفة.", 400);
    try {
      await writes.setListingStatus(user.id, ref, b.status);
      return ok({ status: b.status });
    } catch (e) {
      return writeFail(e);
    }
  }

  /* ---------- تعديل المحتوى ---------- */
  const e = b.edit;
  if (!e) return fail("ماكاين شنو نبدّلو.", 400);

  /* الماركة والموديل والسنة ماكيتبدّلوش — كنقراوهم من الصف باش
     نحسبو الثمن المرجعي على المركبة الحقيقية ماشي على اللي بعث. */
  const { one } = await import("@/lib/db/client");
  const row = await one<{
    kind: string; make: string; model: string; year: number; status: string;
    photo_count: number; has_video: boolean;
  }>(
    `SELECT kind::text, make, model, year, status::text, photo_count, has_video
       FROM listings WHERE ref = $1 AND seller_id = $2::uuid`,
    [ref, user.id],
  );
  if (!row) return fail("الإعلان ماكاينش.", 404);

  const kind = row.kind === "moto" ? "moto" : "car";
  const price = clampInt(e.price, 0, 20000000, 0);
  if (price < 1000) return fail("الثمن ماشي معقول.", 400);

  const city = text(e.city, 60);
  if (city && !CITIES.some((c) => c.slug === city))
    return fail("المدينة ماشي معروفة.", 400);

  const km = clampInt(e.km, 0, 2000000, 0);
  const owners = clampInt(e.owners, 1, 20, 1);
  const condition = pick(CONDITIONS, e.condition, "bon");
  const technicalControl = e.technicalControlValid ? "2027-01-01" : "2026-01-01";

  /* نفس منطق النشر: الثقة والثمن المرجعي كيتحسبو فالخادم من
     إعلانات حقيقية — بلا هادشي المستخدم كيقدر يبعث نقطة مزوّرة. */
  const draft: Vehicle = {
    id: ref,
    kind,
    make: row.make,
    model: row.model,
    version: text(e.version, 80),
    year: row.year,
    km,
    price,
    owners,
    fuel: pick(FUELS, e.fuel, "essence"),
    gearbox: pick(GEARBOXES, e.gearbox, "manuelle"),
    body: pick(BODIES, e.body, kind === "moto" ? "scooter" : "berline"),
    fiscalPower: clampInt(e.fiscalPower, 1, 60, kind === "moto" ? 3 : 7),
    consumption: Number(e.consumption) || 6,
    displacement: e.displacement ? clampInt(e.displacement, 49, 3000, 125) : undefined,
    doors: e.doors ? clampInt(e.doors, 2, 7, 5) : undefined,
    color: text(e.color, 40) || "أبيض",
    drivetrain: pickOptional(DRIVETRAINS, e.drivetrain),
    origin: pickOptional(ORIGINS, e.origin),
    city: city || "casablanca",
    condition,
    firstHand: owners === 1,
    papersOk: e.papersOk !== false,
    technicalControl,
    inspected: Boolean(e.inspected),
    photos: row.photo_count,
    hasVideo: row.has_video,
    serviceBook: Boolean(e.serviceBook),
    vinChecked: Boolean(e.vinChecked),
    description: text(e.description, 4000),
    equipment: (Array.isArray(e.equipment) ? e.equipment : [])
      .slice(0, 40).map((x) => text(x, 60)).filter(Boolean),
    history: [],
    sellerId: user.id,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    saves: 0,
    priceDrops: [],
    priceHistory: [],
    negotiable: e.negotiable !== false,
    exchangeAccepted: Boolean(e.exchangeAccepted),
  };

  /* excludeId باش الإعلان مايقارنش براسو */
  const pool = (await comparablesFor(kind, row.make)).filter((c) => c.id !== ref);
  const fp = fairPrice(draft, pool);
  const trust = trustScore(draft, undefined, fp);

  try {
    const res = await writes.updateListing(user.id, ref, {
      version: draft.version,
      km,
      price,
      owners,
      fuel: draft.fuel,
      gearbox: draft.gearbox,
      body: draft.body,
      fiscalPower: draft.fiscalPower,
      consumption: draft.consumption,
      displacement: draft.displacement ?? null,
      doors: draft.doors ?? null,
      color: draft.color,
      drivetrain: draft.drivetrain ?? null,
      origin: draft.origin ?? null,
      city: draft.city,
      condition,
      papersOk: draft.papersOk,
      technicalControl,
      inspected: draft.inspected,
      serviceBook: draft.serviceBook,
      vinChecked: draft.vinChecked,
      description: draft.description,
      equipment: draft.equipment,
      negotiable: draft.negotiable,
      exchangeAccepted: draft.exchangeAccepted,
      trustScore: trust.score,
      fairPriceMad: fp.estimate.mid,
      fairPriceDelta: fp.delta,
    });
    return ok({ slug: res.slug, trust: trust.score });
  } catch (err) {
    return writeFail(err);
  }
}

/**
 * حذف نهائي.
 *
 * الصفوف المربوطة كيمشيو بـCASCADE، والصور فالخزّان كنمسحوهم
 * هنا — بلا هادشي كيبقاو ملفات ديال إعلان ماكاينش وكنخلّصو عليهم.
 * فشل مسح صورة ماكيوقفش الحذف: الإعلان مشا، وهادي بقية.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const missing = dbMissing();
  if (missing) return missing;

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { ref } = await params;

  try {
    const { deleteListing } = await import("@/lib/db/writes");
    const urls = await deleteListing(user.id, ref);

    const paths = urls
      .map((u) => pathnameFromMediaUrl(u))
      .filter((p): p is string => Boolean(p) && p!.startsWith(`listings/${user.id}/`));

    if (paths.length) {
      try {
        const { del } = await import("@vercel/blob");
        await del(paths);
      } catch (err) {
        console.error("[listing] تّحذف الإعلان ولكن الصور بقات:", ref, err);
      }
    }
    return ok({ deleted: true, media: paths.length });
  } catch (err) {
    return writeFail(err);
  }
}
