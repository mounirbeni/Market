import type { Vehicle } from "./types";
import { fairPriceOf } from "./market";
import { VEHICLES } from "./data/vehicles";

export type FlagLevel = "warn" | "danger";

export interface Flag {
  level: FlagLevel;
  label: string;
  detail: string;
}

/** كم من إعلان عند نفس البائع بنفس الماركة والموديل والسنة */
const dupCache = new Map<string, number>();
function duplicateCount(v: Vehicle) {
  const key = `${v.sellerId}|${v.make}|${v.model}|${v.year}`;
  let n = dupCache.get(key);
  if (n === undefined) {
    n = VEHICLES.filter(
      (o) => o.sellerId === v.sellerId && o.make === v.make && o.model === v.model && o.year === v.year,
    ).length;
    dupCache.set(key, n);
  }
  return n;
}

/**
 * كشف الإعلانات المشبوهة — إشارات موضوعية كتّحسب من المعطيات،
 * ماشي حكم نهائي على البائع.
 */
export function suspicionFlags(v: Vehicle): Flag[] {
  const flags: Flag[] = [];
  const fp = fairPriceOf(v);

  // 1. ثمن أقل بكثير من المرجع بلا سبب واضح
  if (!fp.weak && fp.delta < -0.34) {
    flags.push({
      level: "danger",
      label: "ثمن أقل بكثير من السوق",
      detail: `الثمن أقل بـ${Math.round(Math.abs(fp.delta) * 100)}٪ من المرجع المحسوب. هادي أشهر علامة ديال النصب — ماتصيفطش عربوناً أبداً.`,
    });
  } else if (!fp.weak && fp.delta < -0.22 && !v.inspected) {
    flags.push({
      level: "warn",
      label: "ثمن منخفض بلا فحص",
      detail: "الثمن تحت السوق والمركبة ماتفحصاتش. اطلب فحصاً مستقلاً قبل أي التزام.",
    });
  }

  // 2. كيلومتراج ماشي منطقي مع السنة
  const age = Math.max(1, 2026 - v.year);
  const kmPerYear = v.km / age;
  if (kmPerYear < 4000 && age >= 5) {
    flags.push({
      level: "warn",
      label: "كيلومتراج منخفض بشكل غير عادي",
      detail: `~${Math.round(kmPerYear).toLocaleString("en")} كم/سنة على ${age} سنوات. تحقق من العدّاد عبر الحاسوب (OBD) ومن دفتر الصيانة.`,
    });
  }

  // 3. وثائق ناقصة
  if (!v.papersOk) {
    flags.push({
      level: "danger",
      label: "الوثائق ماشي فسمية البائع",
      detail: "البطاقة الرمادية ماشي باسم اللي كيبيع. ماتخلّصش قبل ما تشوف عقد بيع موثّق من المالك الأصلي.",
    });
  }

  // 4. إعلان بلا صور كافية
  if (v.photos <= 3) {
    flags.push({
      level: "warn",
      label: "صور قليلة",
      detail: `${v.photos} صور فقط. اطلب صوراً للمحرك، أرضية الصندوق، والعدّاد قبل ما تتنقّل.`,
    });
  }

  // 5. إعلانات مكررة عند نفس البائع
  const dups = duplicateCount(v);
  if (dups > 1) {
    flags.push({
      level: "warn",
      label: "إعلانات مكررة",
      detail: `نفس البائع عندو ${dups} إعلانات لنفس الموديل والسنة. تأكد من المركبة اللي غادي تشوف بالضبط.`,
    });
  }

  // 6. فحص تقني منتهي
  if (Date.parse(v.technicalControl) < Date.parse("2026-08-25")) {
    flags.push({
      level: "warn",
      label: "الفحص التقني منتهي",
      detail: "خاصك تجدّدو قبل تحويل الملكية، وكيمكن يخبّي أعطاباً.",
    });
  }

  return flags;
}

export const riskLevel = (flags: Flag[]): FlagLevel | null =>
  flags.some((f) => f.level === "danger") ? "danger" : flags.length > 0 ? "warn" : null;
