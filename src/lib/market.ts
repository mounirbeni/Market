import type { Condition, Vehicle } from "./types";
import { VEHICLES } from "./data/vehicles";
import { sellerById } from "./data/sellers";

export const CURRENT_YEAR = 2026;

const COND_MULT: Record<Condition, number> = {
  excellent: 1.07,
  "tres-bon": 1.0,
  bon: 0.94,
  moyen: 0.85,
};

/** نسبة الاحتفاظ بالقيمة كل سنة */
const DEPRECIATION = { car: 0.9, moto: 0.925 };
/** أثر الكيلومتراج: تراجع القيمة لكل 50 ألف كم */
const KM_RATE = { car: 0.055, moto: 0.075 };
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

function similarity(target: EstimateInput, c: Vehicle): number {
  if (c.kind !== target.kind) return 0;
  let w = 0.12;
  if (c.make === target.make) w = 0.45;
  if (target.model && c.make === target.make && c.model === target.model) w = 1;
  if (w < 0.45 && target.body && c.body === target.body) w = 0.3;
  if (target.fuel && c.fuel === target.fuel) w *= 1.15;
  const yearGap = Math.abs(c.year - target.year);
  w *= Math.max(0.35, 1 - yearGap * 0.09);
  return w;
}

/** ثمن مرجعي مبني على إعلانات مشابهة، معدّل حسب السنة والكيلومتراج والحالة */
export function estimateValue(
  target: EstimateInput,
  { excludeId }: { excludeId?: string } = {},
): Estimate {
  const dep = DEPRECIATION[target.kind];
  const kmRate = KM_RATE[target.kind];
  const kmStep = KM_STEP[target.kind];
  const targetCond = COND_MULT[target.condition ?? "tres-bon"];

  const scored = VEHICLES.filter((v) => v.id !== excludeId)
    .map((c) => ({ c, w: similarity(target, c) }))
    .filter((x) => x.w > 0.1)
    .sort((a, b) => b.w - a.w)
    .slice(0, 24);

  if (!scored.length) {
    return { low: 0, mid: 0, high: 0, confidence: 0, sampleSize: 0, comparables: [] };
  }

  const adjusted = scored.map(({ c, w }) => {
    let p = c.price;
    // تعديل السنة
    p *= Math.pow(dep, c.year - target.year);
    // تعديل الكيلومتراج
    p *= 1 + (kmRate * (c.km - target.km)) / kmStep;
    // تعديل الحالة
    p *= targetCond / COND_MULT[c.condition];
    // ناقل السرعة
    if (target.gearbox && target.gearbox !== c.gearbox) {
      p *= target.gearbox === "automatique" ? 1.05 : 0.95;
    }
    return { p: Math.max(3000, p), w };
  });

  // متوسط مرجّح مع تحييد القيم الشاذة
  adjusted.sort((a, b) => a.p - b.p);
  const trimmed = adjusted.length >= 8 ? adjusted.slice(1, -1) : adjusted;
  const totalW = trimmed.reduce((s, x) => s + x.w, 0);
  const mid = trimmed.reduce((s, x) => s + x.p * x.w, 0) / totalW;

  const variance =
    trimmed.reduce((s, x) => s + x.w * Math.pow(x.p - mid, 2), 0) / totalW;
  const sd = Math.sqrt(variance);
  const relSd = Math.min(0.28, sd / mid);

  const confidence = Math.max(
    0.25,
    Math.min(0.97, (totalW / 6) * 0.6 + (1 - relSd / 0.28) * 0.4),
  );
  const spread = Math.max(0.06, Math.min(0.2, relSd * 0.9));

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

export function fairPrice(v: Vehicle): FairPrice {
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
    },
    { excludeId: v.id },
  );

  const delta = estimate.mid ? (v.price - estimate.mid) / estimate.mid : 0;
  const verdict: PriceVerdict =
    delta <= -0.14 ? "tres-bas"
      : delta <= -0.045 ? "bas"
        : delta < 0.045 ? "juste"
          : delta < 0.14 ? "haut"
            : "tres-haut";

  const span = estimate.high - estimate.low || 1;
  const position = Math.max(0, Math.min(1, (v.price - estimate.low) / span));

  return {
    estimate,
    delta,
    deltaDh: Math.round(v.price - estimate.mid),
    verdict,
    label: VERDICTS[verdict],
    position,
  };
}

/* ============================================================
   مؤشر الثقة — 100 نقطة موزعة على ست ركائز
   ============================================================ */

export interface TrustPart {
  key: string;
  label: string;
  score: number;
  max: number;
  detail: string;
}

export interface TrustResult {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  parts: TrustPart[];
  flags: { level: "warn" | "info" | "danger"; text: string }[];
  strengths: string[];
}

function kmPerYear(v: Vehicle) {
  return v.km / Math.max(1, CURRENT_YEAR - v.year);
}

export function trustScore(v: Vehicle): TrustResult {
  const seller = sellerById(v.sellerId);
  const parts: TrustPart[] = [];
  const flags: TrustResult["flags"] = [];
  const strengths: string[] = [];

  // 1) البائع — 20
  let sellerScore = 0;
  if (seller.idVerified) sellerScore += 8;
  else flags.push({ level: "warn", text: "هوية البائع غير موثقة بعد" });
  if (seller.phoneVerified) sellerScore += 4;
  else flags.push({ level: "warn", text: "رقم الهاتف غير مؤكد" });
  sellerScore += Math.round(((seller.rating - 3.5) / 1.5) * 4);
  const seniority = Math.min(4, Math.max(0, CURRENT_YEAR - seller.since));
  sellerScore += seniority;
  sellerScore = Math.max(0, Math.min(20, sellerScore));
  parts.push({
    key: "seller",
    label: "موثوقية البائع",
    score: sellerScore,
    max: 20,
    detail: `${seller.idVerified ? "هوية موثقة" : "بدون توثيق"} · تقييم ${seller.rating.toFixed(1)} · منذ ${seller.since}`,
  });
  if (seller.idVerified && seller.rating >= 4.5) strengths.push("بائع موثق بتقييم مرتفع");

  // 2) الوثائق — 20
  let docs = 0;
  if (v.papersOk) docs += 8;
  else flags.push({ level: "danger", text: "الوثائق ليست في اسم البائع أو غير مكتملة" });
  if (v.vinChecked) docs += 6;
  const tcValid = new Date(v.technicalControl).getTime() > Date.parse("2026-08-24");
  if (tcValid) docs += 6;
  else flags.push({ level: "warn", text: "الفحص التقني قارب على الانتهاء" });
  parts.push({
    key: "docs",
    label: "الوثائق القانونية",
    score: docs,
    max: 20,
    detail: `${v.papersOk ? "بطاقة رمادية مطابقة" : "وثائق ناقصة"}${v.vinChecked ? " · رقم الهيكل مُتحقق منه" : ""}`,
  });
  if (v.vinChecked) strengths.push("رقم الهيكل (VIN) تم التحقق منه");

  // 3) تاريخ المركبة — 18
  let history = 0;
  if (v.serviceBook) history += 7;
  history += v.owners === 1 ? 7 : v.owners === 2 ? 5 : v.owners === 3 ? 2 : 0;
  const accident = v.history.some((h) => h.type === "accident");
  if (!accident) history += 4;
  else flags.push({ level: "info", text: "حادث مصرّح به في سجل المركبة" });
  if (v.owners >= 4) flags.push({ level: "warn", text: `${v.owners} ملاّك سابقين` });
  parts.push({
    key: "history",
    label: "سجل المركبة",
    score: history,
    max: 18,
    detail: `${v.owners} ${v.owners === 1 ? "مالك" : "ملاّك"} · ${v.serviceBook ? "دفتر صيانة كامل" : "بدون دفتر صيانة"}${accident ? " · حادث مصرّح" : ""}`,
  });
  if (v.firstHand && v.serviceBook) strengths.push("يد أولى مع دفتر صيانة كامل");

  // 4) شفافية الإعلان — 18
  let transp = 0;
  transp += v.photos >= 12 ? 7 : v.photos >= 8 ? 5 : v.photos >= 5 ? 3 : 1;
  if (v.hasVideo) transp += 4;
  transp += v.description.length > 220 ? 3 : v.description.length > 120 ? 2 : 0;
  transp += v.equipment.length >= 8 ? 4 : v.equipment.length >= 4 ? 2 : 1;
  transp = Math.min(18, transp);
  if (v.photos < 5) flags.push({ level: "warn", text: "عدد الصور قليل جداً" });
  parts.push({
    key: "transparency",
    label: "شفافية الإعلان",
    score: transp,
    max: 18,
    detail: `${v.photos} صورة${v.hasVideo ? " · فيديو متاح" : ""} · ${v.equipment.length} تجهيزة موثقة`,
  });
  if (v.hasVideo) strengths.push("فيديو حقيقي للمركبة");

  // 5) اتساق المعطيات — 14
  let coherence = 0;
  const kpy = kmPerYear(v);
  const lo = v.kind === "car" ? 6000 : 2500;
  const hi = v.kind === "car" ? 30000 : 14000;
  if (kpy >= lo && kpy <= hi) coherence += 8;
  else if (kpy < lo) {
    coherence += 3;
    flags.push({
      level: "warn",
      text: `كيلومتراج منخفض بشكل غير معتاد (${Math.round(kpy).toLocaleString("fr-FR")} كم/سنة) — يُنصح بالتحقق من العدّاد`,
    });
  } else {
    coherence += 5;
    flags.push({ level: "info", text: "كيلومتراج سنوي مرتفع مقارنة بالمعدل" });
  }

  const fp = fairPrice(v);
  if (fp.verdict === "juste" || fp.verdict === "bas" || fp.verdict === "haut") coherence += 6;
  else if (fp.verdict === "tres-bas") {
    coherence += 2;
    flags.push({
      level: "danger",
      text: "الثمن أقل بكثير من السوق — تأكد من سبب الفرق قبل دفع أي عربون",
    });
  } else coherence += 3;
  parts.push({
    key: "coherence",
    label: "اتساق المعطيات",
    score: coherence,
    max: 14,
    detail: `${Math.round(kpy).toLocaleString("fr-FR")} كم/سنة · ${fp.label}`,
  });

  // 6) الفحص المستقل — 10
  const inspection = v.inspected ? 10 : 0;
  parts.push({
    key: "inspection",
    label: "فحص TRIQ المستقل",
    score: inspection,
    max: 10,
    detail: v.inspected ? "١٢٠ نقطة فحص · تقرير متاح" : "لم يُطلب فحص بعد",
  });
  if (v.inspected) strengths.push("خضعت لفحص مستقل من ١٢٠ نقطة");

  const score = Math.round(parts.reduce((s, p) => s + p.score, 0));
  const grade: TrustResult["grade"] =
    score >= 86 ? "A+" : score >= 74 ? "A" : score >= 60 ? "B" : score >= 45 ? "C" : "D";

  return { score, grade, parts, flags, strengths };
}

export function trustColor(score: number): string {
  if (score >= 86) return "var(--color-atlas-400)";
  if (score >= 74) return "var(--color-saffron-400)";
  if (score >= 60) return "var(--color-saffron-600)";
  if (score >= 45) return "var(--color-clay-400)";
  return "var(--color-clay-500)";
}

/* ---------------- ذاكرة مؤقتة ---------------- */
const fpCache = new Map<string, FairPrice>();
const tsCache = new Map<string, TrustResult>();

export function fairPriceOf(v: Vehicle): FairPrice {
  let x = fpCache.get(v.id);
  if (!x) {
    x = fairPrice(v);
    fpCache.set(v.id, x);
  }
  return x;
}

export function trustOf(v: Vehicle): TrustResult {
  let x = tsCache.get(v.id);
  if (!x) {
    x = trustScore(v);
    tsCache.set(v.id, x);
  }
  return x;
}
