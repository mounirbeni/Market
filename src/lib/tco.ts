import type { Vehicle } from "./types";
import { CURRENT_YEAR } from "./market";

/** أسعار المحروقات المرجعية بالدرهم/لتر — قابلة للتعديل من الواجهة */
export const FUEL_PRICES = {
  diesel: 11.2,
  essence: 15.1,
  hybride: 15.1,
  /** درهم/كيلوواط ساعة */
  electrique: 1.4,
};

/**
 * الضريبة الخصوصية السنوية على المركبات (الفينيات)
 * حسب القوة الجبائية ونوع الوقود
 */
export function vignette(v: Pick<Vehicle, "kind" | "fuel" | "fiscalPower" | "displacement">): number {
  if (v.kind === "moto") {
    const cc = v.displacement ?? 125;
    if (cc <= 50) return 0;
    if (cc <= 125) return 120;
    if (cc <= 250) return 250;
    if (cc <= 500) return 500;
    return 800;
  }
  if (v.fuel === "electrique") return 0;
  const cv = v.fiscalPower;
  if (v.fuel === "diesel") {
    if (cv <= 7) return 700;
    if (cv <= 10) return 1500;
    if (cv <= 14) return 6000;
    return 20000;
  }
  if (cv <= 7) return 350;
  if (cv <= 10) return 650;
  if (cv <= 14) return 3000;
  return 8000;
}

const PREMIUM_BRANDS = [
  "Mercedes", "BMW", "Audi", "Land Rover", "Tesla", "Harley-Davidson", "KTM", "Vespa",
];

/** تأمين تقديري سنوي (شامل للسيارات الحديثة، ضد الغير للقديمة) */
export function insurance(v: Vehicle, coverage: "tiers" | "tous-risques" = "tiers"): number {
  if (v.kind === "moto") {
    const cc = v.displacement ?? 125;
    const base = cc <= 50 ? 550 : cc <= 125 ? 900 : cc <= 500 ? 1500 : 2600;
    return Math.round(coverage === "tous-risques" ? base + v.price * 0.028 : base);
  }
  const base = 1900 + Math.max(0, v.fiscalPower - 5) * 260;
  const premium = PREMIUM_BRANDS.includes(v.make) ? 1.25 : 1;
  const total =
    coverage === "tous-risques" ? base * premium + v.price * 0.032 : base * premium;
  return Math.round(total);
}

/** صيانة سنوية تقديرية */
export function maintenance(v: Vehicle, kmPerYear: number): number {
  const age = Math.max(0, CURRENT_YEAR - v.year);
  const premium = PREMIUM_BRANDS.includes(v.make) ? 2.1 : 1;
  if (v.kind === "moto") {
    const cc = v.displacement ?? 125;
    const base = cc <= 125 ? 700 : cc <= 500 ? 1400 : 2400;
    return Math.round((base * premium * (1 + age * 0.05) * kmPerYear) / 8000);
  }
  const base = 2200 + v.fiscalPower * 150;
  const ageFactor = 1 + Math.min(1.1, age * 0.075);
  const kmFactor = kmPerYear / 15000;
  const elec = v.fuel === "electrique" ? 0.55 : 1;
  return Math.round(base * premium * ageFactor * kmFactor * elec);
}

/** الفحص التقني السنوي المتوسط */
export function technicalControlCost(v: Vehicle): number {
  const age = CURRENT_YEAR - v.year;
  if (v.kind === "moto") return age >= 5 ? 120 : 0;
  if (age < 5) return 0;
  if (age <= 10) return 150; // مرة كل سنتين ≈ 300 د.م
  return 300;
}

export function tyres(v: Vehicle, kmPerYear: number): number {
  if (v.kind === "moto") {
    const cc = v.displacement ?? 125;
    const set = cc <= 125 ? 900 : cc <= 500 ? 2200 : 3800;
    return Math.round((set * kmPerYear) / 12000);
  }
  const set = 2800 + v.fiscalPower * 180;
  return Math.round((set * kmPerYear) / 45000);
}

export function fuelCost(v: Vehicle, kmPerYear: number, prices = FUEL_PRICES): number {
  const price = prices[v.fuel];
  return Math.round((v.consumption / 100) * kmPerYear * price);
}

/** خسارة القيمة السنوية المتوقعة */
export function depreciation(v: Vehicle, years = 1): number {
  const rate = v.kind === "car" ? 0.1 : 0.075;
  const age = CURRENT_YEAR - v.year;
  // الانخفاض يتباطأ مع تقادم المركبة
  const eff = rate * Math.max(0.35, 1 - age * 0.045);
  const future = v.price * Math.pow(1 - eff, years);
  return Math.round((v.price - future) / years);
}

export interface TcoOptions {
  kmPerYear: number;
  years: number;
  coverage: "tiers" | "tous-risques";
  fuelPrices?: typeof FUEL_PRICES;
  includeDepreciation: boolean;
}

export interface TcoLine {
  key: string;
  label: string;
  perYear: number;
  hint?: string;
}

export interface TcoResult {
  lines: TcoLine[];
  perYear: number;
  perMonth: number;
  perKm: number;
  total: number;
  years: number;
  resaleValue: number;
}

export function computeTco(v: Vehicle, opts: TcoOptions): TcoResult {
  const { kmPerYear, years, coverage } = opts;
  const lines: TcoLine[] = [
    {
      key: "fuel",
      label: v.fuel === "electrique" ? "الشحن الكهربائي" : "المحروقات",
      perYear: fuelCost(v, kmPerYear, opts.fuelPrices),
      hint: `${v.consumption} ${v.fuel === "electrique" ? "ك.و.س" : "ل"}/100كم`,
    },
    {
      key: "insurance",
      label: coverage === "tous-risques" ? "التأمين (جميع الأخطار)" : "التأمين (ضد الغير)",
      perYear: insurance(v, coverage),
    },
    {
      key: "vignette",
      label: "الضريبة السنوية (الفينيات)",
      perYear: vignette(v),
      hint: v.kind === "car" ? `${v.fiscalPower} حصان جبائي` : `${v.displacement ?? "-"} سم³`,
    },
    { key: "maintenance", label: "الصيانة وقطع الغيار", perYear: maintenance(v, kmPerYear) },
    { key: "tyres", label: "الإطارات", perYear: tyres(v, kmPerYear) },
    { key: "control", label: "الفحص التقني", perYear: technicalControlCost(v) },
  ];

  if (opts.includeDepreciation) {
    lines.push({
      key: "depreciation",
      label: "خسارة القيمة",
      perYear: depreciation(v, years),
      hint: "الفرق بين ثمن الشراء وثمن البيع المتوقع",
    });
  }

  const perYear = lines.reduce((s, l) => s + l.perYear, 0);
  const rate = v.kind === "car" ? 0.1 : 0.075;
  const age = CURRENT_YEAR - v.year;
  const eff = rate * Math.max(0.35, 1 - age * 0.045);

  return {
    lines: lines.filter((l) => l.perYear > 0),
    perYear,
    perMonth: Math.round(perYear / 12),
    perKm: perYear / Math.max(1, kmPerYear),
    total: perYear * years,
    years,
    resaleValue: Math.round(v.price * Math.pow(1 - eff, years)),
  };
}
