import type { Vehicle } from "./types";
import { fairPriceOf } from "./market";

export type FlagLevel = "warn" | "danger";

export interface Flag {
  level: FlagLevel;
  /** مفتاح فالقاموس تحت `risk.flag` — النص كيتبنى فالعرض */
  key: string;
  /** قيم كتّعوّض داخل النص: {pct}، {km}، {years}… */
  vars?: Record<string, string>;
}

/**
 * كشف الإعلانات المشبوهة — إشارات موضوعية كتّحسب من المعطيات،
 * ماشي حكم نهائي على البائع.
 *
 * `duplicates` كيجي من الخادم (عدد إعلانات نفس البائع بنفس
 * الموديل والسنة) — المتصفح ماعندوش الإعلانات الأخرى.
 */
export function suspicionFlags(v: Vehicle, duplicates = 0): Flag[] {
  const flags: Flag[] = [];
  const fp = fairPriceOf(v);

  // 1. ثمن أقل بكثير من المرجع بلا سبب واضح
  if (!fp.weak && fp.delta < -0.34) {
    flags.push({
      level: "danger",
      key: "farBelow",
      vars: { pct: String(Math.round(Math.abs(fp.delta) * 100)) },
    });
  } else if (!fp.weak && fp.delta < -0.22 && !v.inspected) {
    flags.push({ level: "warn", key: "lowNoInspection" });
  }

  // 2. كيلومتراج ماشي منطقي مع السنة
  const age = Math.max(1, 2026 - v.year);
  const kmPerYear = v.km / age;
  if (kmPerYear < 4000 && age >= 5) {
    flags.push({
      level: "warn",
      key: "lowKm",
      vars: { km: Math.round(kmPerYear).toLocaleString("en"), years: String(age) },
    });
  }

  // 3. وثائق ناقصة
  if (!v.papersOk) {
    flags.push({ level: "danger", key: "papers" });
  }

  // 4. إعلان بلا صور كافية
  if (v.photos <= 3) {
    flags.push({ level: "warn", key: "fewPhotos", vars: { n: String(v.photos) } });
  }

  // 5. إعلانات مكررة عند نفس البائع
  const dups = duplicates;
  if (dups > 1) {
    flags.push({ level: "warn", key: "duplicates", vars: { n: String(dups) } });
  }

  // 6. فحص تقني منتهي
  if (v.technicalControl && Date.parse(v.technicalControl) < Date.now()) {
    flags.push({ level: "warn", key: "tcExpired" });
  }

  return flags;
}

export const riskLevel = (flags: Flag[]): FlagLevel | null =>
  flags.some((f) => f.level === "danger") ? "danger" : flags.length > 0 ? "warn" : null;
