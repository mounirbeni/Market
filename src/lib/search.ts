import type { Vehicle } from "./types";
import { VEHICLES } from "./data/vehicles";
import { fairPriceOf, trustOf } from "./market";
import { normalize } from "./darija";
import { promoRank } from "./promo";

export interface Filters {
  kind: "all" | "car" | "moto";
  q: string;
  make: string;
  model: string;
  city: string;
  fuel: string;
  gearbox: string;
  body: string;
  /** حالة المركبة العامة */
  condition: string;
  /** إعلانات البيع المستعجل فقط */
  urgentOnly: boolean;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  kmMax?: number;
  sellerType: string;
  /** خيارات الثقة */
  trustMin?: number;
  inspectedOnly: boolean;
  verifiedOnly: boolean;
  firstHandOnly: boolean;
  goodDealsOnly: boolean;
  sort: SortKey;
}

export type SortKey =
  | "pertinence"
  | "recent"
  | "price-asc"
  | "price-desc"
  | "km-asc"
  | "year-desc"
  | "trust-desc"
  | "deal";

export const SORT_LABELS: Record<SortKey, string> = {
  pertinence: "الأنسب",
  deal: "أحسن صفقة",
  recent: "الأحدث",
  "price-asc": "الأرخص",
  "price-desc": "الأغلى",
  "km-asc": "الأقل كيلومتراج",
  "year-desc": "الأحدث موديلاً",
  "trust-desc": "الأعلى ثقة",
};

export const DEFAULT_FILTERS: Filters = {
  kind: "all",
  q: "",
  make: "",
  model: "",
  city: "",
  fuel: "",
  gearbox: "",
  body: "",
  condition: "",
  urgentOnly: false,
  sellerType: "",
  inspectedOnly: false,
  verifiedOnly: false,
  firstHandOnly: false,
  goodDealsOnly: false,
  sort: "pertinence",
};

/** ذاكرة مؤقتة للحسابات الثقيلة */
const trustCache = new Map<string, number>();
const dealCache = new Map<string, number>();

export function cachedTrust(v: Vehicle): number {
  let t = trustCache.get(v.id);
  if (t === undefined) {
    t = trustOf(v).score;
    trustCache.set(v.id, t);
  }
  return t;
}

export function cachedDelta(v: Vehicle): number {
  let d = dealCache.get(v.id);
  if (d === undefined) {
    d = fairPriceOf(v).delta;
    dealCache.set(v.id, d);
  }
  return d;
}

export function applyFilters(filters: Partial<Filters>, source = VEHICLES): Vehicle[] {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const q = f.q ? normalize(f.q) : "";

  let out = source.filter((v) => {
    if (f.kind !== "all" && v.kind !== f.kind) return false;
    if (f.make && v.make !== f.make) return false;
    if (f.model && v.model !== f.model) return false;
    if (f.city && v.city !== f.city) return false;
    if (f.fuel && v.fuel !== f.fuel) return false;
    if (f.gearbox && v.gearbox !== f.gearbox) return false;
    if (f.body && v.body !== f.body) return false;
    if (f.condition && v.condition !== f.condition) return false;
    if (f.urgentOnly && v.promo !== "urgent") return false;
    if (f.priceMin && v.price < f.priceMin) return false;
    if (f.priceMax && v.price > f.priceMax) return false;
    if (f.yearMin && v.year < f.yearMin) return false;
    if (f.yearMax && v.year > f.yearMax) return false;
    if (f.kmMax && v.km > f.kmMax) return false;
    if (f.inspectedOnly && !v.inspected) return false;
    if (f.firstHandOnly && !v.firstHand) return false;
    if (f.verifiedOnly && !(v.papersOk && v.vinChecked)) return false;
    if (f.trustMin && cachedTrust(v) < f.trustMin) return false;
    if (f.goodDealsOnly && cachedDelta(v) > -0.045) return false;
    if (q) {
      const hay = normalize(
        `${v.make} ${v.model} ${v.version} ${v.year} ${v.color} ${v.description}`,
      );
      if (!q.split(" ").every((w) => hay.includes(w))) return false;
    }
    return true;
  });

  out = [...out].sort((a, b) => {
    switch (f.sort) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "km-asc": return a.km - b.km;
      case "year-desc": return b.year - a.year;
      case "trust-desc": return cachedTrust(b) - cachedTrust(a);
      case "deal": return cachedDelta(a) - cachedDelta(b);
      case "recent":
        return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      default: {
        const score = (v: Vehicle) =>
          cachedTrust(v) * 0.6 +
          promoRank(v) +
          Math.max(-20, Math.min(20, -cachedDelta(v) * 120)) +
          (Date.parse(v.publishedAt) - Date.parse("2026-07-01")) / (86400000 * 4);
        return score(b) - score(a);
      }
    }
  });

  return out;
}

export function filtersFromParams(sp: URLSearchParams): Partial<Filters> {
  const num = (k: string) => {
    const raw = sp.get(k);
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    kind: (sp.get("kind") as Filters["kind"]) || "all",
    q: sp.get("q") || "",
    make: sp.get("make") || "",
    model: sp.get("model") || "",
    city: sp.get("city") || "",
    fuel: sp.get("fuel") || "",
    gearbox: sp.get("gearbox") || "",
    body: sp.get("body") || "",
    condition: sp.get("condition") || "",
    urgentOnly: sp.get("urgent") === "1",
    sellerType: sp.get("sellerType") || "",
    priceMin: num("priceMin"),
    priceMax: num("priceMax"),
    yearMin: num("yearMin"),
    yearMax: num("yearMax"),
    kmMax: num("kmMax"),
    trustMin: num("trustMin"),
    inspectedOnly: sp.get("inspected") === "1",
    verifiedOnly: sp.get("verified") === "1",
    firstHandOnly: sp.get("firstHand") === "1",
    goodDealsOnly: sp.get("deals") === "1",
    sort: (sp.get("sort") as SortKey) || "pertinence",
  };
}

export function paramsFromFilters(f: Partial<Filters>): URLSearchParams {
  const sp = new URLSearchParams();
  const set = (k: string, v: unknown, skip?: unknown) => {
    if (v === undefined || v === null || v === "" || v === skip) return;
    sp.set(k, String(v));
  };
  set("kind", f.kind, "all");
  set("q", f.q);
  set("make", f.make);
  set("model", f.model);
  set("city", f.city);
  set("fuel", f.fuel);
  set("gearbox", f.gearbox);
  set("body", f.body);
  set("condition", f.condition);
  set("sellerType", f.sellerType);
  set("priceMin", f.priceMin);
  set("priceMax", f.priceMax);
  set("yearMin", f.yearMin);
  set("yearMax", f.yearMax);
  set("kmMax", f.kmMax);
  set("trustMin", f.trustMin);
  if (f.inspectedOnly) sp.set("inspected", "1");
  if (f.verifiedOnly) sp.set("verified", "1");
  if (f.firstHandOnly) sp.set("firstHand", "1");
  if (f.goodDealsOnly) sp.set("deals", "1");
  if (f.urgentOnly) sp.set("urgent", "1");
  set("sort", f.sort, "pertinence");
  return sp;
}

export function similarVehicles(v: Vehicle, limit = 4): Vehicle[] {
  return VEHICLES.filter((c) => c.id !== v.id && c.kind === v.kind)
    .map((c) => {
      let s = 0;
      if (c.make === v.make) s += 3;
      if (c.body === v.body) s += 2;
      if (c.fuel === v.fuel) s += 1.5;
      if (c.city === v.city) s += 1;
      s -= Math.abs(c.year - v.year) * 0.4;
      s -= Math.abs(c.price - v.price) / Math.max(v.price, 1) * 4;
      return { c, s };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.c);
}

/**
 * اقتراحات مبنية على اللي شافه المستخدم — كتوزن الماركة، نوع الهيكل،
 * الوقود، المدينة ونطاق الثمن ديال آخر المركبات المتصفَّحة.
 */
export function suggestFromRecent(recentIds: string[], limit = 4): Vehicle[] {
  const seen = recentIds
    .map((id) => VEHICLES.find((v) => v.id === id))
    .filter(Boolean) as Vehicle[];
  if (seen.length === 0) return [];

  const weight = <T extends string | number>(vals: T[]) => {
    const m = new Map<T, number>();
    vals.forEach((v, i) => m.set(v, (m.get(v) ?? 0) + 1 / (i + 1)));
    return m;
  };
  const makes = weight(seen.map((v) => v.make));
  const bodies = weight(seen.map((v) => v.body));
  const fuels = weight(seen.map((v) => v.fuel));
  const cities = weight(seen.map((v) => v.city));
  const avgPrice = seen.reduce((s, v) => s + v.price, 0) / seen.length;
  const kinds = new Set(seen.map((v) => v.kind));

  return VEHICLES.filter((v) => !recentIds.includes(v.id) && kinds.has(v.kind))
    .map((v) => {
      const priceGap = Math.abs(v.price - avgPrice) / Math.max(1, avgPrice);
      const score =
        (makes.get(v.make) ?? 0) * 3 +
        (bodies.get(v.body) ?? 0) * 2.2 +
        (fuels.get(v.fuel) ?? 0) * 1.4 +
        (cities.get(v.city) ?? 0) * 1.2 +
        Math.max(0, 2.4 - priceGap * 4) +
        cachedTrust(v) / 45 +
        Math.max(-1.5, -cachedDelta(v) * 6);
      return { v, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.v);
}
