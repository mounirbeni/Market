import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, fail, ok, unauthorized, writeFail } from "@/lib/api";
import { fairPrice, trustScore } from "@/lib/market";
import { comparablesFor } from "@/lib/source";
import type { Body, Condition, Fuel, Gearbox, Vehicle } from "@/lib/types";
import type { NewListing } from "@/lib/db/writes";
import { MAX_PHOTOS, pathnameFromMediaUrl } from "@/lib/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* القيم المسموحة — نفس enums ديال قاعدة البيانات */
const FUELS: Fuel[] = ["diesel", "essence", "hybride", "electrique"];
const GEARBOXES: Gearbox[] = ["manuelle", "automatique"];
const BODIES: Body[] = [
  "citadine", "berline", "suv", "break", "utilitaire", "cabriolet",
  "scooter", "roadster", "trail", "sportive", "custom",
];
const CONDITIONS: Condition[] = ["excellent", "tres-bon", "bon", "moyen"];
const DRIVETRAINS = ["fwd", "rwd", "awd"] as const;
const ORIGINS = ["maghribia", "mostawrada"] as const;

/** كيقصّ ويحدّ رقم داخل مجال معقول */
const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/**
 * واش هاد الرابط خارج من الخزّان ديالنا؟
 *
 * بلا هاد الفحص شي حد يقدر يبعث رابط صورة من أي موقع ويخلّي
 * الإعلانات ديالنا كيشدّو صور من برّا (ولا يبعث رابط تتبّع).
 */
function isOwnBlobUrl(url: string, userId: string) {
  // غير الرابط الوسيط ديالنا مقبول؛ الرابط المباشر لـBlob أو أي موقع آخر
  // يقدر يجيب صورة بلا علامة مائية، لذلك كنرفضوه حتى لو كان HTTPS.
  const pathname = pathnameFromMediaUrl(url);
  return Boolean(pathname && pathname.startsWith(`listings/${userId}/`));
}

export interface CreateBody {
  kind?: string;
  make?: string;
  model?: string;
  version?: string;
  year?: number;
  km?: number;
  price?: number;
  owners?: number;
  fuel?: string;
  gearbox?: string;
  body?: string;
  fiscalPower?: number;
  consumption?: number;
  displacement?: number;
  doors?: number;
  color?: string;
  drivetrain?: string;
  origin?: string;
  city?: string;
  condition?: string;
  papersOk?: boolean;
  technicalControlValid?: boolean;
  inspected?: boolean;
  serviceBook?: boolean;
  vinChecked?: boolean;
  description?: string;
  equipment?: string[];
  negotiable?: boolean;
  exchangeAccepted?: boolean;
  photos?: number;
  hasVideo?: boolean;
  /** الصور اللي تّرفعو لVercel Blob قبل النشر */
  media?: { url: string; kind?: string; thumbUrl?: string; width?: number; height?: number }[];
}

/**
 * نشر إعلان جديد.
 *
 * مؤشر الثقة والثمن المرجعي كيتّحسبو هنا فالخادم بنفس الدوال ديال
 * العرض — باش حتى واحد مايقدرش يبعث نقطة ثقة مزوّرة.
 */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<CreateBody>(req);
  if (!b) return fail("الطلب ماشي صحيح.");

  const kind = b.kind === "moto" ? "moto" : "car";
  const make = text(b.make, 60);
  const model = text(b.model, 60);
  if (!make || !model) return fail("خاصك تحدّد الماركة والموديل.");

  /* أي قيمة ماشي من اللائحة كترجع للافتراضي — القيم كتمشي لـenum فقاعدة البيانات */
  const pick = <T extends string>(list: T[], v: unknown, fallback: T): T =>
    list.includes(v as T) ? (v as T) : fallback;
  /* خيار اختياري — ماكاينش افتراضي، البقاء بلا قيمة أحسن من تخمين */
  const pickOptional = <T extends string>(list: readonly T[], v: unknown): T | undefined =>
    list.includes(v as T) ? (v as T) : undefined;

  const fuel = pick(FUELS, b.fuel, "essence");
  const gearbox = pick(GEARBOXES, b.gearbox, "manuelle");
  const bodyType = pick(BODIES, b.body, kind === "moto" ? "scooter" : "berline");
  const condition = pick(CONDITIONS, b.condition, "bon");
  const drivetrain = pickOptional(DRIVETRAINS, b.drivetrain);
  const origin = pickOptional(ORIGINS, b.origin);

  const year = clampInt(b.year, 1950, 2100, 2018);
  const km = clampInt(b.km, 0, 2000000, 0);
  const price = clampInt(b.price, 0, 20000000, 0);
  if (price < 1000) return fail("الثمن ماشي معقول.");

  const owners = clampInt(b.owners, 1, 20, 1);

  /* الصور: كنقبلو غير الروابط اللي خرجات من الخزّان ديالنا.
     الرفض صريح، ماشي غير إسقاط الرابط، باش المستخدم يعرف علاش ما تنشرش. */
  const incomingMedia = Array.isArray(b.media) ? b.media.slice(0, MAX_PHOTOS + 4) : [];
  for (const m of incomingMedia) {
    if (!m || typeof m.url !== "string" || !isOwnBlobUrl(m.url, user.id))
      return fail("صور الإعلانات خاصها تترفع من داخل المنصة، ماشي من موقع خارجي.", 400);
    if (m.thumbUrl != null && (typeof m.thumbUrl !== "string" || !isOwnBlobUrl(m.thumbUrl, user.id)))
      return fail("المصغّرة ديال الصورة ماشي من تخزين المنصة.", 400);
  }
  const media = incomingMedia.map((m) => ({
    url: m.url,
    kind: m.kind === "video" ? ("video" as const) : ("photo" as const),
    thumbUrl: typeof m.thumbUrl === "string" ? m.thumbUrl : undefined,
    width: Number.isFinite(Number(m.width)) ? Number(m.width) : undefined,
    height: Number.isFinite(Number(m.height)) ? Number(m.height) : undefined,
  }));

  const photoRows = media.filter((m) => m.kind === "photo").length;
  // إلا كانو صور حقيقية هوما اللي كيحسبو، وإلا كناخدو العدد اللي دخل
  const photos = photoRows > 0 ? photoRows : clampInt(b.photos, 0, 40, 0);
  const hasVideo = media.some((m) => m.kind === "video") || Boolean(b.hasVideo);

  /* كنبنيو مركبة مؤقتة باش نحسبو الثقة والثمن المرجعي بنفس منطق العرض */
  const draft: Vehicle = {
    id: "new",
    kind,
    make,
    model,
    version: text(b.version, 80),
    year,
    km,
    price,
    owners,
    fuel,
    gearbox,
    body: bodyType,
    fiscalPower: clampInt(b.fiscalPower, 1, 60, kind === "moto" ? 3 : 7),
    consumption: Number(b.consumption) || 6,
    displacement: b.displacement ? clampInt(b.displacement, 49, 3000, 125) : undefined,
    doors: b.doors ? clampInt(b.doors, 2, 7, 5) : undefined,
    color: text(b.color, 40) || "أبيض",
    drivetrain,
    origin,
    city: text(b.city, 60) || "casablanca",
    condition,
    firstHand: owners === 1,
    papersOk: b.papersOk !== false,
    technicalControl: b.technicalControlValid ? "2027-01-01" : "2026-01-01",
    inspected: Boolean(b.inspected),
    photos,
    hasVideo,
    serviceBook: Boolean(b.serviceBook),
    vinChecked: Boolean(b.vinChecked),
    description: text(b.description, 4000),
    equipment: (b.equipment ?? []).slice(0, 40).map((e) => text(e, 60)).filter(Boolean),
    history: [],
    sellerId: user.id,
    publishedAt: new Date().toISOString(),
    views: 0,
    saves: 0,
    priceDrops: [],
    negotiable: b.negotiable !== false,
    exchangeAccepted: Boolean(b.exchangeAccepted),
  };

  /* الثمن المرجعي كيتحسب هنا مرة وحدة، من إعلانات حقيقية منشورة،
     وكيتخزّن مع الإعلان — البطاقات كيقراوه بلا ما يعاودو الحساب. */
  const pool = await comparablesFor(kind, make);
  const fp = fairPrice(draft, pool);
  const trust = trustScore(draft, undefined, fp);

  const payload: NewListing = {
    kind,
    make,
    model,
    version: draft.version,
    year,
    km,
    price,
    owners,
    fuel,
    gearbox,
    body: bodyType,
    fiscalPower: draft.fiscalPower,
    consumption: draft.consumption,
    displacement: draft.displacement ?? null,
    doors: draft.doors ?? null,
    color: draft.color,
    drivetrain: draft.drivetrain ?? null,
    origin: draft.origin ?? null,
    city: draft.city,
    condition,
    firstHand: draft.firstHand,
    papersOk: draft.papersOk,
    technicalControl: draft.technicalControl,
    inspected: draft.inspected,
    serviceBook: draft.serviceBook,
    vinChecked: draft.vinChecked,
    description: draft.description,
    equipment: draft.equipment,
    negotiable: draft.negotiable,
    exchangeAccepted: draft.exchangeAccepted,
    photoCount: photos,
    hasVideo: draft.hasVideo,
    media,
    trustScore: trust.score,
    fairPriceMad: fp.estimate.mid,
    fairPriceDelta: fp.delta,
  };

  try {
    const { createListing } = await import("@/lib/db/writes");
    const row = await createListing(user.id, payload);
    return ok({ ref: row.ref, slug: row.slug, trust: trust.score });
  } catch (e) {
    return writeFail(e);
  }
}
