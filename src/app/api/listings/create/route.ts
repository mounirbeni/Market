import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, fail, ok, unauthorized, writeFail } from "@/lib/api";
import { fairPrice, trustScore } from "@/lib/market";
import type { Body, Condition, Fuel, Gearbox, Vehicle } from "@/lib/types";
import type { NewListing } from "@/lib/db/writes";

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

/** كيقصّ ويحدّ رقم داخل مجال معقول */
const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

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

  const fuel = pick(FUELS, b.fuel, "essence");
  const gearbox = pick(GEARBOXES, b.gearbox, "manuelle");
  const bodyType = pick(BODIES, b.body, kind === "moto" ? "scooter" : "berline");
  const condition = pick(CONDITIONS, b.condition, "bon");

  const year = clampInt(b.year, 1950, 2100, 2018);
  const km = clampInt(b.km, 0, 2000000, 0);
  const price = clampInt(b.price, 0, 20000000, 0);
  if (price < 1000) return fail("الثمن ماشي معقول.");

  const owners = clampInt(b.owners, 1, 20, 1);
  const photos = clampInt(b.photos, 0, 40, 0);

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
    city: text(b.city, 60) || "casablanca",
    condition,
    firstHand: owners === 1,
    papersOk: b.papersOk !== false,
    technicalControl: b.technicalControlValid ? "2027-01-01" : "2026-01-01",
    inspected: Boolean(b.inspected),
    photos,
    hasVideo: Boolean(b.hasVideo),
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

  const trust = trustScore(draft);
  const fp = fairPrice(draft);

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
