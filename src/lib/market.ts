import type { Condition, Seller, Vehicle } from "./types";
import { formatNumber } from "./format";

export const CURRENT_YEAR = 2026;

const COND_MULT: Record<Condition, number> = {
  excellent: 1.07,
  "tres-bon": 1.0,
  bon: 0.94,
  moyen: 0.85,
};

/** فئة الماركة: 1 اقتصادية · 2 عامة · 3 راقية */
const BRAND_TIER: Record<string, 1 | 2 | 3> = {
  Dacia: 1, Fiat: 1, Chevrolet: 1, Suzuki: 1, Docker: 1, Bajaj: 1, Haojue: 1,
  SYM: 1, MBK: 1, Peugeot: 2, Renault: 2, "Citroën": 2, Volkswagen: 2,
  Hyundai: 2, Kia: 2, Toyota: 2, Ford: 2, Seat: 2, Skoda: 2, Nissan: 2,
  Opel: 2, Mitsubishi: 2, Jeep: 2, Isuzu: 2, Kymco: 1, Yamaha: 2, Honda: 2, Kawasaki: 2,
  Benelli: 2, Vespa: 2, "Royal Enfield": 2, Mercedes: 3, BMW: 3, Audi: 3,
  "Land Rover": 3, Tesla: 3, "Harley-Davidson": 3, KTM: 3,
};

const tier = (make: string): 1 | 2 | 3 => BRAND_TIER[make] ?? 2;

/** مجموعات الهيكل: المقارنة داخل نفس المجموعة أدقّ بكثير */
const BODY_GROUP: Record<string, string> = {
  citadine: "std", berline: "std", cabriolet: "std",
  suv: "family", break: "family",
  utilitaire: "util",
  scooter: "scoot", roadster: "road", sportive: "sport",
  trail: "trail", custom: "custom",
};
const bodyGroup = (b: string) => BODY_GROUP[b] ?? b;

/**
 * منحنى الاحتفاظ بالقيمة حسب العمر.
 * الانخفاض سريع في السنوات الأولى ثم يتباطأ — كما هو الحال في السوق المغربي.
 */
function valueCurve(age: number, kind: "car" | "moto"): number {
  const k = kind === "car" ? 0.115 : 0.085;
  return 1 / (1 + k * Math.pow(Math.max(0, age), 1.15));
}

/** فارق القيمة حسب نوع الوقود لنفس الموديل */
const FUEL_VALUE: Record<string, number> = {
  diesel: 1.06,
  essence: 1,
  hybride: 1.12,
  electrique: 1.15,
};

/** أثر الكيلومتراج: تراجع القيمة لكل شريحة */
const KM_RATE = { car: 0.1, moto: 0.09 };
const KM_STEP = { car: 50000, moto: 20000 };

export interface EstimateInput {
  kind: "car" | "moto";
  make: string;
  model?: string;
  year: number;
  km: number;
  fuel?: string;
  gearbox?: string;
  body?: string;
  condition?: Condition;
  /** القوة الجبائية للسيارات أو سعة المحرك للدراجات */
  power?: number;
}

export interface Estimate {
  low: number;
  mid: number;
  high: number;
  /** 0..1 */
  confidence: number;
  sampleSize: number;
  comparables: Vehicle[];
}

function powerOf(v: Vehicle): number {
  return v.kind === "moto" ? (v.displacement ?? 125) : v.fiscalPower;
}

function similarity(target: EstimateInput, c: Vehicle): number {
  if (c.kind !== target.kind) return 0;

  const tierGap = Math.abs(tier(c.make) - tier(target.make));
  let w: number;
  if (target.model && c.make === target.make && c.model === target.model) w = 1;
  else if (c.make === target.make) w = 0.5;
  else if (tierGap === 0 && target.body && c.body === target.body) w = 0.26;
  else if (tierGap === 0) w = 0.1;
  else if (tierGap === 1) w = 0.035;
  else return 0;

  if (target.fuel) w *= c.fuel === target.fuel ? 1.15 : 0.85;

  if (target.body) {
    if (c.body === target.body) w *= 1.1;
    else if (bodyGroup(c.body) === bodyGroup(target.body)) w *= 0.8;
    else w *= 0.3;
  }

  // القوة/سعة المحرك: أهم محدّد للثمن داخل نفس الفئة
  if (target.power) {
    const cp = powerOf(c);
    if (target.kind === "moto") {
      w *= Math.max(0.04, 1 - Math.abs(Math.log(cp / target.power)) * 0.85);
    } else {
      w *= Math.max(0.1, 1 - Math.abs(cp - target.power) * 0.11);
    }
  }

  const yearGap = Math.abs(c.year - target.year);
  w *= Math.max(0.25, 1 - yearGap * 0.11);
  return w;
}

/**
 * ثمن مرجعي مبني على إعلانات مشابهة، معدّل حسب السنة والكيلومتراج والحالة.
 *
 * المشابهات كتجي من برّا — من قاعدة البيانات، إعلانات حقيقية منشورة.
 * الدالة صافية: نفس المدخل كيعطي نفس المخرج، وماكتقراش من أي مصدر.
 * بلا مشابهات كترجع تقدير خاوي وsampleSize صفر، والواجهة كتقول
 * «مراجع محدودة» بدل ما تخترع ثمن.
 */
export function estimateValue(
  target: EstimateInput,
  pool: Vehicle[],
  { excludeId }: { excludeId?: string } = {},
): Estimate {
  const kmRate = KM_RATE[target.kind];
  const kmStep = KM_STEP[target.kind];
  const targetCond = COND_MULT[target.condition ?? "tres-bon"];
  const targetAge = CURRENT_YEAR - target.year;
  const targetCurve = valueCurve(targetAge, target.kind);
  const targetFuel = FUEL_VALUE[target.fuel ?? "essence"] ?? 1;

  const scored = pool
    .filter((v) => v.id !== excludeId)
    .map((c) => ({ c, w: similarity(target, c) }))
    .filter((x) => x.w >= 0.03)
    .sort((a, b) => b.w - a.w)
    .slice(0, 18);

  if (!scored.length) {
    return { low: 0, mid: 0, high: 0, confidence: 0, sampleSize: 0, comparables: [] };
  }

  const adjusted = scored.map(({ c, w }) => {
    let p = c.price;
    // تعديل العمر عبر منحنى الاحتفاظ بالقيمة
    p *= targetCurve / valueCurve(CURRENT_YEAR - c.year, c.kind);
    // تعديل الكيلومتراج (محدود حتى لا ينفجر على الفوارق الكبيرة)
    const kmAdj = 1 + (kmRate * (c.km - target.km)) / kmStep;
    p *= Math.max(0.6, Math.min(1.45, kmAdj));
    // تعديل الحالة
    p *= targetCond / COND_MULT[c.condition];
    // نوع الوقود
    p *= targetFuel / (FUEL_VALUE[c.fuel] ?? 1);
    // القوة / سعة المحرك
    if (target.power) {
      const ratio = target.power / powerOf(c);
      const exp = target.kind === "moto" ? 0.5 : 0.45;
      p *= Math.max(0.55, Math.min(1.9, Math.pow(ratio, exp)));
    }
    // ناقل السرعة
    if (target.gearbox && target.gearbox !== c.gearbox) {
      p *= target.gearbox === "automatique" ? 1.05 : 0.95;
    }
    // تركيز الوزن على أقرب المشابهات
    return { p: Math.max(3000, p), w: w * w };
  });

  // متوسط مرجّح مع تحييد القيم الشاذة
  adjusted.sort((a, b) => a.p - b.p);
  const trimmed = adjusted.length >= 8 ? adjusted.slice(1, -1) : adjusted;
  const totalW = trimmed.reduce((s, x) => s + x.w, 0);
  const mid = trimmed.reduce((s, x) => s + x.p * x.w, 0) / totalW;

  const variance =
    trimmed.reduce((s, x) => s + x.w * Math.pow(x.p - mid, 2), 0) / totalW;
  const sd = Math.sqrt(variance);
  const relSd = Math.min(0.32, sd / mid);

  // التغطية: هل وُجدت مشابهة قوية (نفس الموديل/الماركة) وكم عددها؟
  const topW = Math.max(...scored.map((x) => x.w));
  const support = scored.reduce((sum, x) => sum + x.w, 0);
  const coverage = Math.min(1, topW * 0.75 + Math.min(1, support / 2.5) * 0.45);
  const confidence = Math.max(
    0.2,
    Math.min(0.97, coverage * 0.62 + (1 - relSd / 0.32) * 0.38),
  );
  const spread = Math.max(0.06, Math.min(0.24, relSd * 0.95));

  return {
    low: Math.round((mid * (1 - spread)) / 500) * 500,
    mid: Math.round(mid / 500) * 500,
    high: Math.round((mid * (1 + spread)) / 500) * 500,
    confidence,
    sampleSize: trimmed.length,
    comparables: scored.slice(0, 6).map((x) => x.c),
  };
}

export type PriceVerdict =
  | "tres-bas"
  | "bas"
  | "juste"
  | "haut"
  | "tres-haut";

export interface FairPrice {
  estimate: Estimate;
  /** مراجع غير كافية: نعرض التقدير كمؤشر أولي فقط */
  weak: boolean;
  /** فرق السعر عن المرجع بالنسبة المئوية */
  delta: number;
  deltaDh: number;
  verdict: PriceVerdict;
  label: string;
  /** موقع السعر داخل المجال 0..1 لعرض المؤشر */
  position: number;
}

const VERDICTS: Record<PriceVerdict, string> = {
  "tres-bas": "أرخص بكثير من السوق",
  bas: "أقل من ثمن السوق",
  juste: "ثمن عادل",
  haut: "أعلى من ثمن السوق",
  "tres-haut": "مرتفع عن السوق",
};

/** مؤشر الثمن مبني على تقدير محسوب سلفاً */
export function fairPriceFrom(v: Vehicle, estimate: Estimate): FairPrice {
  const delta = estimate.mid ? (v.price - estimate.mid) / estimate.mid : 0;
  const weak = estimate.confidence < 0.5 || estimate.sampleSize < 3;
  const verdict = verdictOf(delta);
  const span = estimate.high - estimate.low || 1;

  return {
    estimate,
    weak,
    delta,
    deltaDh: Math.round(v.price - estimate.mid),
    verdict,
    label: weak ? "مراجع محدودة" : VERDICTS[verdict],
    position: Math.max(0, Math.min(1, (v.price - estimate.low) / span)),
  };
}

const verdictOf = (delta: number): PriceVerdict =>
  delta <= -0.14 ? "tres-bas"
    : delta <= -0.045 ? "bas"
      : delta < 0.045 ? "juste"
        : delta < 0.14 ? "haut"
          : "tres-haut";

/**
 * مؤشر الثمن من القيمة المخزّنة فقاعدة البيانات.
 *
 * الثمن المرجعي كيتحسب مرة وحدة فالخادم ملي كينشر الإعلان
 * وكيتخزّن فالصف. البطاقات كتقراه من هنا بدل ما تعاود الحساب —
 * المتصفح ماعندوش الإعلانات الأخرى باش يقارن بيهم أصلاً.
 */
export function fairPriceOf(v: Vehicle): FairPrice {
  const mid = v.fairPriceMad ?? 0;
  if (!mid) {
    return {
      estimate: { low: 0, mid: 0, high: 0, confidence: 0, sampleSize: 0, comparables: [] },
      weak: true,
      delta: 0,
      deltaDh: 0,
      verdict: "juste",
      label: "مراجع محدودة",
      position: 0.5,
    };
  }

  const delta = v.fairPriceDelta ?? (v.price - mid) / mid;
  const spread = 0.1;
  const estimate: Estimate = {
    low: Math.round((mid * (1 - spread)) / 500) * 500,
    mid,
    high: Math.round((mid * (1 + spread)) / 500) * 500,
    confidence: 0.7,
    sampleSize: 3,
    comparables: [],
  };
  const verdict = verdictOf(delta);
  const span = estimate.high - estimate.low || 1;

  return {
    estimate,
    weak: false,
    delta,
    deltaDh: Math.round(v.price - mid),
    verdict,
    label: VERDICTS[verdict],
    position: Math.max(0, Math.min(1, (v.price - estimate.low) / span)),
  };
}

/** حساب كامل — كيحتاج إعلانات مشابهة حقيقية، فكيتّنادى غير فالخادم */
export function fairPrice(v: Vehicle, pool: Vehicle[]): FairPrice {
  const estimate = estimateValue(
    {
      kind: v.kind,
      make: v.make,
      model: v.model,
      year: v.year,
      km: v.km,
      fuel: v.fuel,
      gearbox: v.gearbox,
      body: v.body,
      condition: v.condition,
      power: v.kind === "moto" ? v.displacement : v.fiscalPower,
    },
    pool,
    { excludeId: v.id },
  );
  return fairPriceFrom(v, estimate);
}

/* ============================================================
   مؤشر الثقة — 100 نقطة موزعة على ست ركائز
   ============================================================ */

/* النص كيتبنى فالعرض ماشي هنا: كنرجّعو مفاتيح وأرقام، والقاموس
   كيعطي الصياغة بلغة الزائر. التفصيل عبارة عن قطع كتّجمع بـ« · ». */
export interface TrustFragment {
  /** مفتاح تحت `trustPanel.d` فالقاموس */
  k: string;
  vars?: Record<string, string>;
}

export interface TrustPart {
  key: string;
  score: number;
  max: number;
  detail: TrustFragment[];
}

export interface TrustResult {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  parts: TrustPart[];
  /** `k` مفتاح تحت `trustPanel.flag` */
  flags: { level: "warn" | "info" | "danger"; k: string; vars?: Record<string, string> }[];
  /** مفاتيح تحت `trustPanel.strength` */
  strengths: string[];
}

function kmPerYear(v: Vehicle) {
  return v.km / Math.max(1, CURRENT_YEAR - v.year);
}

export function trustScore(
  v: Vehicle,
  sellerOverride?: Seller,
  fairPriceOverride?: FairPrice,
): TrustResult {
  /* بلا معلومات على البائع كنحسبو بأقل التقديرات — بائع جديد
     بلا توثيق. أحسن من أن نفترض سمعة ماكايناش. */
  const seller: Seller = sellerOverride ??
    v.seller ?? {
      id: v.sellerId,
      name: "بائع",
      type: "particulier",
      city: v.city,
      since: CURRENT_YEAR,
      idVerified: false,
      phoneVerified: false,
      rating: null,
      salesCount: 0,
      responseMinutes: null,
    };
  const parts: TrustPart[] = [];
  const flags: TrustResult["flags"] = [];
  const strengths: string[] = [];

  // 1) البائع — 20
  let sellerScore = 0;
  if (seller.idVerified) sellerScore += 8;
  else flags.push({ level: "warn", k: "idNotVerified" });
  if (seller.phoneVerified) sellerScore += 4;
  else flags.push({ level: "warn", k: "phoneNotVerified" });
  // بلا نظام مراجعات حقيقي، ماكاينش تقييم — بلا هادشي كنعطيو نقط
  // على رقم مختلق. seller.rating == null فكل الحسابات دابا (لا
  // كتابة حقيقية للعمود)، فهاد الجزء مؤقتاً معطّل.
  if (seller.rating != null) sellerScore += Math.round(((seller.rating - 3.5) / 1.5) * 4);
  const seniority = Math.min(4, Math.max(0, CURRENT_YEAR - seller.since));
  sellerScore += seniority;
  sellerScore = Math.max(0, Math.min(20, sellerScore));
  parts.push({
    key: "seller",
    score: sellerScore,
    max: 20,
    detail: [
      { k: seller.idVerified ? "idVerified" : "noVerify" },
      ...(seller.rating != null ? [{ k: "rating", vars: { r: seller.rating.toFixed(1) } }] : []),
      { k: "since", vars: { y: String(seller.since) } },
    ],
  });
  if (seller.idVerified && seller.rating != null && seller.rating >= 4.5) {
    strengths.push("verifiedHighRating");
  }

  // 2) الوثائق — 20
  let docs = 0;
  if (v.papersOk) docs += 8;
  else flags.push({ level: "danger", k: "papersBad" });
  if (v.vinChecked) docs += 6;
  const tcValid = new Date(v.technicalControl).getTime() > Date.parse("2026-08-24");
  if (tcValid) docs += 6;
  else flags.push({ level: "warn", k: "tcExpiring" });
  /* التزامات مالية/قانونية معلّقة كتنتقل للمشتري — خصم حقيقي من
     نقطة الثقة، ماشي غير علَم إعلامي */
  if (v.unpaidVignette) { docs -= 3; flags.push({ level: "danger", k: "unpaidVignette" }); }
  if (v.unpaidFines) { docs -= 3; flags.push({ level: "danger", k: "unpaidFines" }); }
  if (v.underLien) { docs -= 6; flags.push({ level: "danger", k: "underLien" }); }
  docs = Math.max(0, docs);
  parts.push({
    key: "docs",
    score: docs,
    max: 20,
    detail: [
      { k: v.papersOk ? "papersOk" : "papersMissing" },
      ...(v.vinChecked ? [{ k: "vinChecked" }] : []),
    ],
  });
  if (v.vinChecked) strengths.push("vinChecked");

  // 3) تاريخ المركبة — 18
  let history = 0;
  if (v.serviceBook) history += 7;
  history += v.owners === 1 ? 7 : v.owners === 2 ? 5 : v.owners === 3 ? 2 : 0;
  const accident = v.history.some((h) => h.type === "accident");
  if (!accident) history += 4;
  else flags.push({ level: "info", k: "accidentDeclared" });
  if (v.owners >= 4) flags.push({ level: "warn", k: "manyOwners", vars: { n: String(v.owners) } });
  parts.push({
    key: "history",
    score: history,
    max: 18,
    detail: [
      { k: v.owners === 1 ? "owner1" : "ownerN", vars: { n: String(v.owners) } },
      { k: v.serviceBook ? "serviceBook" : "noServiceBook" },
      ...(accident ? [{ k: "accident" }] : []),
    ],
  });
  if (v.firstHand && v.serviceBook) strengths.push("firstHandServiceBook");

  // 4) شفافية الإعلان — 18
  let transp = 0;
  transp += v.photos >= 12 ? 7 : v.photos >= 8 ? 5 : v.photos >= 5 ? 3 : 1;
  if (v.hasVideo) transp += 4;
  transp += v.description.length > 220 ? 3 : v.description.length > 120 ? 2 : 0;
  transp += v.equipment.length >= 8 ? 4 : v.equipment.length >= 4 ? 2 : 1;
  transp = Math.min(18, transp);
  if (v.photos < 5) flags.push({ level: "warn", k: "fewPhotos" });
  parts.push({
    key: "transparency",
    score: transp,
    max: 18,
    detail: [
      { k: "photos", vars: { n: String(v.photos) } },
      ...(v.hasVideo ? [{ k: "video" }] : []),
      { k: "equipment", vars: { n: String(v.equipment.length) } },
    ],
  });
  if (v.hasVideo) strengths.push("realVideo");

  // 5) اتساق المعطيات — 14
  let coherence = 0;
  const kpy = kmPerYear(v);
  const lo = v.kind === "car" ? 6000 : 2500;
  const hi = v.kind === "car" ? 30000 : 14000;
  if (kpy >= lo && kpy <= hi) coherence += 8;
  else if (kpy < lo) {
    coherence += 3;
    flags.push({ level: "warn", k: "lowKmUnusual", vars: { km: formatNumber(kpy) } });
  } else {
    coherence += 5;
    flags.push({ level: "info", k: "highKmYear" });
  }

  const fp = fairPriceOverride ?? fairPriceOf(v);
  if (fp.weak) coherence += 4;
  else if (fp.verdict === "juste" || fp.verdict === "bas" || fp.verdict === "haut") coherence += 6;
  else if (fp.verdict === "tres-bas") {
    coherence += 2;
    flags.push({ level: "danger", k: "priceFarBelow" });
  } else coherence += 3;
  parts.push({
    key: "coherence",
    score: coherence,
    max: 14,
    detail: [
      { k: "kmPerYear", vars: { km: formatNumber(kpy) } },
      { k: "fp", vars: { verdict: fp.weak ? "weak" : fp.verdict } },
    ],
  });

  // 6) الفحص المستقل — 10
  const inspection = v.inspected ? 10 : 0;
  parts.push({
    key: "inspection",
    score: inspection,
    max: 10,
    detail: [{ k: v.inspected ? "inspected" : "notInspected" }],
  });
  if (v.inspected) strengths.push("inspected120");

  const score = Math.round(parts.reduce((s, p) => s + p.score, 0));
  const grade: TrustResult["grade"] =
    score >= 86 ? "A+" : score >= 74 ? "A" : score >= 60 ? "B" : score >= 45 ? "C" : "D";

  return { score, grade, parts, flags, strengths };
}

export function trustColor(score: number): string {
  if (score >= 86) return "var(--good)";
  if (score >= 74) return "var(--brand)";
  if (score >= 60) return "var(--brand)";
  if (score >= 45) return "var(--bad)";
  return "var(--bad)";
}

/* ---------------- ذاكرة مؤقتة ----------------

   المفتاح هو الكائن نفسه ماشي v.id.

   بالـid كانت النقطة كتتجمّد: الخادم كيحسبها أول مرة وكيحتافظ بيها
   لأنّ الذاكرة مشتركة بين كل الطلبات. البائع كيزيد صور ولا يوثّق
   دفتر الصيانة — والنقطة ماكتّبدلش حتى يتعاود النشر. هادشي ماكانش
   كيبان ملي كانت البيانات ثابتة، ولكن دابا الإعلانات كيتبدّلو.

   WeakMap كيحل المشكل: صف جديد من قاعدة البيانات = كائن جديد =
   حساب جديد. ونفس الكائن (إعادة رسم React) كيرجع من الذاكرة.
   والكائنات القديمة كيمسحهم جامع القمامة بوحدو.
   ------------------------------------------------ */
const tsCache = new WeakMap<Vehicle, TrustResult>();

export function trustOf(v: Vehicle): TrustResult {
  let x = tsCache.get(v);
  if (!x) {
    x = trustScore(v);
    tsCache.set(v, x);
  }
  return x;
}
