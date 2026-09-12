import { technicalControlDate } from "@/lib/dates";
import { CITIES } from "@/lib/cities";
import { rowToSeller, sellerById } from "@/lib/db/listings";
import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, fail, ok, unauthorized, writeFail } from "@/lib/api";
import { isFounder } from "@/lib/founder";
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
const CITY_SET = new Set(CITIES.map((city) => city.slug));
const CURRENT_YEAR = new Date().getUTCFullYear() + 1;

/** كيقصّ ويحدّ رقم داخل مجال معقول */
const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** القيم الإلزامية ماخاصهاش تتبدّل بصمت لقيمة افتراضية.
 * أي طلب مزوّر أو ناقص خاصو يترفض، باش مايدخلش إعلان مضلل للمنصة. */
const requiredInt = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
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
  // يقدر يجيب صورة خارجة على النطاق ديالنا أو رابط تتبّع، لذلك كنرفضوه حتى لو كان HTTPS.
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
  technicalControl?: string | null;
  inspected?: boolean;
  serviceBook?: boolean;
  vinChecked?: boolean;
  accidentDeclared?: boolean;
  accidentNote?: string;
  unpaidVignette?: boolean;
  unpaidFines?: boolean;
  underLien?: boolean;
  knownIssues?: string[];
  originalPaint?: boolean;
  paintedPanels?: number;
  keysCount?: number;
  includedItems?: string[];
  saleReason?: string;
  sellerDeclared?: boolean;
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
  /* دفاع مضاعف: /sell كترجّع المستخدم الناقص قبل ما يوصل هنا،
     ولكن الفحص الحقيقي خاصو يكون فالمسار — ماشي فالواجهة فقط. */
  if (!user.onboarded) return fail("كمّل معلومات حسابك أولًا قبل نشر إعلان.", 403);

  const b = await body<CreateBody>(req);
  if (!b) return fail("الطلب ماشي صحيح.");

  if (b.kind !== "car" && b.kind !== "moto") return fail("نوع المركبة ماشي صحيح.");
  const kind = b.kind;
  const rawMake = text(b.make, 60);
  const rawModel = text(b.model, 60);
  if (!rawMake || !rawModel) return fail("خاصك تحدّد الماركة والموديل.");
  /* خانة الموديل مفتوحة — البائع كيكتب اللي بغى. كنوحّدو الكتابة
     مع الكتالوج إلا كانت تطابق، باش الثمن المرجعي يلقى مقارنات
     (كيطابق الموديل حرفياً). شوف lib/db/catalog.ts */
  const { canonicalMake, canonicalModel } = await import("@/lib/db/catalog");
  const make = await canonicalMake(kind, rawMake);
  const model = await canonicalModel(kind, make, rawModel);

  /* خيار اختياري — ماكاينش افتراضي، البقاء بلا قيمة أحسن من تخمين */
  const pickOptional = <T extends string>(list: readonly T[], v: unknown): T | undefined =>
    list.includes(v as T) ? (v as T) : undefined;

  if (!FUELS.includes(b.fuel as Fuel)) return fail("نوع الوقود ماشي صحيح.");
  if (!GEARBOXES.includes(b.gearbox as Gearbox)) return fail("ناقل الحركة ماشي صحيح.");
  if (!BODIES.includes(b.body as Body)) return fail("نوع الهيكل ماشي صحيح.");
  if (!CONDITIONS.includes(b.condition as Condition)) return fail("حالة المركبة ماشي صحيحة.");
  const fuel = b.fuel as Fuel;
  const gearbox = b.gearbox as Gearbox;
  const bodyType = b.body as Body;
  const condition = b.condition as Condition;
  const drivetrain = pickOptional(DRIVETRAINS, b.drivetrain);
  const origin = pickOptional(ORIGINS, b.origin);

  const year = requiredInt(b.year, 1950, CURRENT_YEAR);
  const km = requiredInt(b.km, 0, 2000000);
  const price = requiredInt(b.price, 1000, 20000000);
  const owners = requiredInt(b.owners, 1, 20);
  if (year === null) return fail("سنة الصنع ماشي صحيحة.");
  if (km === null) return fail("الكيلومتراج ماشي صحيح.");
  if (price === null) return fail("الثمن ماشي معقول.");
  if (owners === null) return fail("عدد الملاك ماشي صحيح.");
  if (!CITY_SET.has(text(b.city, 60))) return fail("اختار مدينة مغربية صحيحة.");
  if (!text(b.version, 80) || !text(b.color, 40)) return fail("خاصك تعمّر النسخة ولون المركبة.");
  if (!origin || (kind === "car" && !drivetrain)) return fail("خاصك تعمّر معلومات المركبة المطلوبة.");
  if (text(b.description, 4000).length < 20) return fail("الوصف خاصو يكون فيه على الأقل 20 حرف.");
  if (!Array.isArray(b.equipment) || b.equipment.filter(Boolean).length === 0)
    return fail("خاصك تختار تجهيز واحد على الأقل.");

  const displacement = kind === "moto" ? requiredInt(b.displacement, 49, 3000) : undefined;
  if (kind === "moto" && displacement === null) return fail("سعة محرك الدراجة بالسم³ مطلوبة.");
  let technicalControl: string | null;
  try { technicalControl = technicalControlDate(b.technicalControl); }
  catch { return fail("تاريخ انتهاء الفحص التقني ماشي صحيح.", 400); }

  /* التصريح بحادث/إصلاح كبير — النص الحر ماعندوش معنى بلا التبويب */
  const accidentDeclared = Boolean(b.accidentDeclared);
  const accidentNote = accidentDeclared ? text(b.accidentNote, 500) : "";

  /* إقرار البائع النهائي بصحة المعلومات — إجباري، ماشي واجهة فقط */
  if (!b.sellerDeclared) return fail("خاصك تقر بصحة المعلومات قبل النشر.", 400);

  const knownIssues = (b.knownIssues ?? []).slice(0, 20).map((e) => text(e, 60)).filter(Boolean);
  const includedItems = (b.includedItems ?? []).slice(0, 20).map((e) => text(e, 60)).filter(Boolean);
  const originalPaint = b.originalPaint !== false;
  const paintedPanels = originalPaint ? null : clampInt(b.paintedPanels, 0, 20, 0);
  const keysCount = Number.isFinite(Number(b.keysCount)) ? clampInt(b.keysCount, 0, 10, 2) : null;
  const saleReason = text(b.saleReason, 300) || null;

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
  const minimumPhotos = kind === "car" ? 6 : 4;
  if (photoRows < minimumPhotos)
    return fail(`خاصك ترفع على الأقل ${minimumPhotos} صور باش تنشر الإعلان.`, 400);
  const photos = photoRows;
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
    displacement: displacement ?? undefined,
    doors: b.doors ? clampInt(b.doors, 2, 7, 5) : undefined,
    color: text(b.color, 40) || "أبيض",
    drivetrain,
    origin,
    city: text(b.city, 60) || "casablanca",
    condition,
    firstHand: owners === 1,
    papersOk: b.papersOk !== false,
    technicalControl: technicalControl ?? "",
    inspected: false,
    photos,
    hasVideo,
    serviceBook: Boolean(b.serviceBook),
    vinChecked: Boolean(b.vinChecked),
    accidentDeclared,
    accidentNote: accidentNote || null,
    unpaidVignette: Boolean(b.unpaidVignette),
    unpaidFines: Boolean(b.unpaidFines),
    underLien: Boolean(b.underLien),
    knownIssues,
    originalPaint,
    paintedPanels,
    keysCount,
    includedItems,
    saleReason,
    sellerDeclared: true,
    description: text(b.description, 4000),
    equipment: (b.equipment ?? []).slice(0, 40).map((e) => text(e, 60)).filter(Boolean),
    history: accidentDeclared
      ? [{
          date: new Date().toISOString(),
          type: "accident",
          label: "حادث أو إصلاح كبير مصرّح به",
          detail: accidentNote || undefined,
        }]
      : [],
    sellerId: user.id,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    saves: 0,
    priceDrops: [],
    priceHistory: [],
    negotiable: b.negotiable !== false,
    exchangeAccepted: Boolean(b.exchangeAccepted),
  };

  /* الثمن المرجعي كيتحسب هنا مرة وحدة، من إعلانات حقيقية منشورة،
     وكيتخزّن مع الإعلان — البطاقات كيقراوه بلا ما يعاودو الحساب. */
  const pool = await comparablesFor(kind, make);
  const fp = fairPrice(draft, pool);
  const sellerRow = await sellerById(user.id);
  const trust = trustScore(draft, sellerRow ? rowToSeller(sellerRow) : undefined, fp);
  const priceLooksAbnormal = fp.estimate.sampleSize >= 3 && Math.abs(fp.delta) >= 0.35;
  const requiresReview = !isFounder(user.email) && (
    !sellerRow?.id_verified || trust.score < 70 || priceLooksAbnormal
  );

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
    technicalControl,
    inspected: draft.inspected,
    serviceBook: draft.serviceBook,
    vinChecked: draft.vinChecked,
    accidentDeclared: draft.accidentDeclared,
    accidentNote: draft.accidentNote ?? null,
    unpaidVignette: draft.unpaidVignette,
    unpaidFines: draft.unpaidFines,
    underLien: draft.underLien,
    knownIssues: draft.knownIssues,
    originalPaint: draft.originalPaint,
    paintedPanels: draft.paintedPanels,
    keysCount: draft.keysCount,
    includedItems: draft.includedItems,
    saleReason: draft.saleReason,
    sellerDeclared: draft.sellerDeclared,
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
    fairPriceMeta: { low: fp.estimate.low, high: fp.estimate.high, confidence: fp.estimate.confidence, sampleSize: fp.estimate.sampleSize },
  };

  try {
    const { createListing } = await import("@/lib/db/writes");
    /* الامتياز كيتقرّر من إيميل الجلسة فالخادم — ماشي من جسم
       الطلب ولا من عمود يقدر يتبدّل بـUPDATE */
    const row = await createListing(user.id, payload, {
      founder: isFounder(user.email),
      status: requiresReview ? "pending" : "active",
    });
    return ok({ ref: row.ref, slug: row.slug, trust: trust.score, status: row.status });
  } catch (e) {
    return writeFail(e);
  }
}
