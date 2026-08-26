import { applyFilters, DEFAULT_FILTERS, type Filters } from "./search";

/* ============================================================
   عدّادات الفلاتر (facets)

   كل خيار فاللوحة الجانبية كيبان معاه شحال من نتيجة غادي يعطي.
   الحساب كيتّدار مرة وحدة فالخادم بدل ما نديرو عشرات المرورات
   على اللائحة فالمتصفح.
   ============================================================ */

export const PRICE_MAX = 600000;
export const YEAR_MIN = 2004;
export const YEAR_MAX = 2026;
export const HIST_BUCKETS = 22;

export type FlagKey =
  | "goodDealsOnly"
  | "inspectedOnly"
  | "verifiedOnly"
  | "firstHandOnly"
  | "urgentOnly";

export const FLAG_KEYS: FlagKey[] = [
  "goodDealsOnly",
  "inspectedOnly",
  "verifiedOnly",
  "firstHandOnly",
  "urgentOnly",
];

export interface Facets {
  total: number;
  kind: { all: number; car: number; moto: number };
  body: Record<string, number>;
  fuel: Record<string, number>;
  gearbox: Record<string, number>;
  condition: Record<string, number>;
  city: Record<string, number>;
  flags: Record<FlagKey, number>;
  makes: Record<string, number>;
  models: Record<string, number>;
  priceHist: number[];
  yearHist: number[];
}

/** نفس التقسيم اللي كان كيتّدار فالمتصفح — باش الرسم مايتبدّلش */
export function bucketOf(v: number, min: number, max: number, buckets = HIST_BUCKETS) {
  const span = max - min || 1;
  // كنضربو قبل ما نقسمو — القسمة الأولى كتخلق فرق تقريب بين JS و SQL
  return Math.min(buckets - 1, Math.max(0, Math.floor(((v - min) * buckets) / span)));
}

export function emptyFacets(): Facets {
  return {
    total: 0,
    kind: { all: 0, car: 0, moto: 0 },
    body: {},
    fuel: {},
    gearbox: {},
    condition: {},
    city: {},
    flags: { goodDealsOnly: 0, inspectedOnly: 0, verifiedOnly: 0, firstHandOnly: 0, urgentOnly: 0 },
    makes: {},
    models: {},
    priceHist: new Array(HIST_BUCKETS).fill(0),
    yearHist: new Array(HIST_BUCKETS).fill(0),
  };
}

/** الحساب من البيانات المرفقة — المرجع اللي كتقاس عليه نسخة SQL */
export function facetsFromSeed(partial: Partial<Filters>): Facets {
  const f: Filters = { ...DEFAULT_FILTERS, ...partial };
  const out = emptyFacets();

  const countOf = (patch: Partial<Filters>) => applyFilters({ ...f, ...patch }).length;
  const tally = <K extends keyof Filters>(key: K, rows: { [P in K]: unknown }[]) => {
    const acc: Record<string, number> = {};
    for (const r of rows) {
      const k = String(r[key]);
      acc[k] = (acc[k] ?? 0) + 1;
    }
    return acc;
  };

  out.total = applyFilters(f).length;

  const kindBase = { make: "", model: "", body: "" } as const;
  out.kind = {
    all: countOf({ ...kindBase, kind: "all" }),
    car: countOf({ ...kindBase, kind: "car" }),
    moto: countOf({ ...kindBase, kind: "moto" }),
  };

  out.body = tally("body", applyFilters({ ...f, body: "" }));
  out.fuel = tally("fuel", applyFilters({ ...f, fuel: "" }));
  out.gearbox = tally("gearbox", applyFilters({ ...f, gearbox: "" }));
  out.condition = tally("condition", applyFilters({ ...f, condition: "" }));
  out.city = tally("city", applyFilters({ ...f, city: "" }));

  for (const flag of FLAG_KEYS) out.flags[flag] = countOf({ [flag]: true } as Partial<Filters>);

  out.makes = tally("make", applyFilters({ ...f, make: "", model: "" }));
  out.models = f.make ? tally("model", applyFilters({ ...f, model: "" })) : {};

  for (const v of applyFilters({ ...f, priceMin: undefined, priceMax: undefined }))
    out.priceHist[bucketOf(v.price, 0, PRICE_MAX)]++;
  for (const v of applyFilters({ ...f, yearMin: undefined, yearMax: undefined }))
    out.yearHist[bucketOf(v.year, YEAR_MIN, YEAR_MAX)]++;

  return out;
}
