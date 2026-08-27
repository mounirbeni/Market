import { CATALOG } from "./data/catalog";
import { CITIES } from "./cities";
import type { Filters } from "./search";

/* ============================================================
   فهرس الاقتراحات — أسماء المركبات دائماً بالحروف اللاتينية
   ملاحظة: أسماء الماركات والموديلات ماكيتكتبوش بالعربية أبداً.
   كيتكتبو كيف ما هوما فالبطاقة الرمادية: Dacia Logan, Mercedes Classe C.
   الفرنسية كلغة ثانوية للأنواع والوقود والناقل.
   ============================================================ */

export type SuggestKind = "make" | "model" | "body" | "fuel" | "city" | "gearbox";

export interface Suggestion {
  kind: SuggestKind;
  /** النص المعروض — لاتيني للمركبات */
  label: string;
  /** سطر ثانوي: عربي أو فرنسي */
  sub: string;
  /** عدد الإعلانات */
  count: number;
  /** الفلاتر اللي كيطبّقها هاد الاقتراح */
  filters: Partial<Filters>;
  /** نص البحث الكامل بعد الاختيار */
  query: string;
}

export const KIND_LABEL: Record<SuggestKind, string> = {
  make: "ماركة",
  model: "موديل",
  body: "نوع",
  fuel: "وقود",
  gearbox: "ناقل",
  city: "مدينة",
};

/** تجريد اللواحق: Citroën → citroen، Mégane → megane، حذف الفراغات والشرطات */
export function latinize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** نفس التجريد ولكن كيحافظ على الفراغات باش نطابقو كل كلمة على حدة */
function latinWords(s: string): string[] {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/* ---------- المصطلحات الفرنسية (لغة ثانوية) ---------- */

export const FR_BODY: Record<string, string> = {
  citadine: "Citadine",
  berline: "Berline",
  suv: "SUV / 4x4",
  break: "Break",
  utilitaire: "Utilitaire",
  cabriolet: "Cabriolet",
  scooter: "Scooter",
  roadster: "Roadster",
  trail: "Trail",
  sportive: "Sportive",
  custom: "Custom",
};

export const FR_FUEL: Record<string, string> = {
  diesel: "Diesel",
  essence: "Essence",
  hybride: "Hybride",
  electrique: "Électrique",
};

export const FR_GEARBOX: Record<string, string> = {
  manuelle: "Boîte manuelle",
  automatique: "Boîte automatique",
};

export const FR_CONDITION: Record<string, string> = {
  excellent: "Excellent état",
  "tres-bon": "Très bon état",
  bon: "Bon état",
  moyen: "État moyen",
};

const AR_BODY: Record<string, string> = {
  citadine: "مدينية", berline: "صالون", suv: "دفع رباعي", break: "بريك",
  utilitaire: "نفعية", cabriolet: "مكشوفة", scooter: "سكوتر",
  roadster: "روadster", trail: "طرقية", sportive: "رياضية", custom: "كوستوم",
};
const AR_FUEL: Record<string, string> = {
  diesel: "گازوال", essence: "بنزين", hybride: "هجينة", electrique: "كهربائية",
};
const AR_GEARBOX: Record<string, string> = {
  manuelle: "عادي", automatique: "أوتوماتيك",
};

/** أسماء عربية شائعة للماركات — كتستعمل فقط باش نقترحو الكتابة اللاتينية */
const AR_MAKES: Record<string, string[]> = {
  Dacia: ["داسيا", "داشيا"], Renault: ["رونو", "رينو"], Peugeot: ["بيجو", "بيجوه"],
  "Citroën": ["سيتروين", "ستروين"], Volkswagen: ["فولكس", "فولكسفاكن"],
  Hyundai: ["هيونداي"], Kia: ["كيا"], Toyota: ["تويوتا", "طويوطا"], Ford: ["فورد"],
  Fiat: ["فيات"], Seat: ["سيات"], Skoda: ["سكودا"],
  Mercedes: ["مرسيدس", "مرسديس", "مرسيديس", "بنز"], BMW: ["بي ام", "بمو"],
  Audi: ["اودي", "أودي"], Nissan: ["نيسان"], Opel: ["اوبل", "أوبل"], Jeep: ["جيب"],
  "Land Rover": ["لاند روفر", "رانج روفر"], Suzuki: ["سوزوكي"],
  Chevrolet: ["شفروليه", "شيفروليه"], Mitsubishi: ["ميتسوبيشي"], Isuzu: ["ايسوزو"],
  Kymco: ["كيمكو"], Tesla: ["تيسلا"], Yamaha: ["ياماها"], Honda: ["هوندا"],
  KTM: ["كي تي ام"], Kawasaki: ["كاوازاكي"], "Royal Enfield": ["رويال انفيلد"],
  Vespa: ["فيسبا"], SYM: ["سيم"], MBK: ["ام بي كي"], Docker: ["دوكر"],
  Bajaj: ["باجاج"], Haojue: ["هاوجي"], Benelli: ["بينيلي"],
  "Harley-Davidson": ["هارلي"],
};

/* ---------- بناء الفهرس مرة وحدة ---------- */

interface IndexEntry extends Suggestion {
  /** المفتاح الرئيسي — الاسم الكامل بحروف لاتينية صغيرة بلا فراغات */
  primary: string;
  /** مفاتيح ثانوية: كلمات مفردة، اختصارات، الاسم بالماركة */
  alt: string[];
  /** أسماء عربية — كتستعمل غير باش نقترحو الكتابة اللاتينية الصحيحة */
  arabic: string[];
}

function buildIndex(): IndexEntry[] {
  const out: IndexEntry[] = [];

  // الماركات
  const makeCount = new Map<string, { n: number; kinds: Set<string> }>();
  for (const v of CATALOG) {
    const e = makeCount.get(v.make) ?? { n: 0, kinds: new Set<string>() };
    e.n++;
    e.kinds.add(v.kind);
    makeCount.set(v.make, e);
  }
  for (const [make, { n, kinds }] of makeCount) {
    out.push({
      kind: "make",
      label: make,
      sub: kinds.has("car") && kinds.has("moto")
        ? "سيارات ودراجات"
        : kinds.has("moto") ? "دراجات نارية" : "سيارات",
      count: n,
      filters: { make },
      query: make,
      primary: latinize(make),
      alt: latinWords(make).filter((w) => w.length >= 2),
      arabic: AR_MAKES[make] ?? [],
    });
  }

  // الموديلات — كيتعرضو دائماً «Make Model»
  const modelCount = new Map<string, number>();
  for (const v of CATALOG) {
    const k = `${v.make}|${v.model}`;
    modelCount.set(k, (modelCount.get(k) ?? 0) + 1);
  }
  for (const [k, n] of modelCount) {
    const [make, model] = k.split("|");
    const sample = CATALOG.find((v) => v.make === make && v.model === model)!;
    out.push({
      kind: "model",
      label: `${make} ${model}`,
      sub: sample.kind === "moto" ? "دراجة نارية" : (sample.body && FR_BODY[sample.body]) || "سيارة",
      count: n,
      filters: { make, model },
      query: `${make} ${model}`,
      // الموديل كيتلقى بالكلمة ديالو وحدها ولا مع الماركة
      primary: latinize(model),
      alt: [latinize(make + model), ...latinWords(model).filter((w) => w.length >= 2)],
      arabic: [],
    });
  }

  // أنواع الهياكل — بالفرنسية أساساً
  const bodyCount = new Map<string, number>();
  for (const v of CATALOG) {
    if (v.body) bodyCount.set(v.body, (bodyCount.get(v.body) ?? 0) + 1);
  }
  for (const [body, n] of bodyCount) {
    out.push({
      kind: "body",
      label: FR_BODY[body] ?? body,
      sub: AR_BODY[body] ?? "",
      count: n,
      filters: { body },
      query: FR_BODY[body] ?? body,
      primary: latinize(FR_BODY[body] ?? body),
      alt: [latinize(body), ...latinWords(FR_BODY[body] ?? "").filter((w) => w.length >= 2)],
      arabic: [AR_BODY[body] ?? ""].filter(Boolean),
    });
  }

  // الوقود
  for (const fuel of ["diesel", "essence", "hybride", "electrique"] as const) {
    const n = 1;
    out.push({
      kind: "fuel",
      label: FR_FUEL[fuel],
      sub: AR_FUEL[fuel],
      count: n,
      filters: { fuel },
      query: FR_FUEL[fuel],
      primary: latinize(FR_FUEL[fuel]),
      alt: [latinize(fuel)],
      arabic: [AR_FUEL[fuel]],
    });
  }

  // الناقل
  for (const gb of ["manuelle", "automatique"] as const) {
    const n = 1;
    out.push({
      kind: "gearbox",
      label: FR_GEARBOX[gb],
      sub: AR_GEARBOX[gb],
      count: n,
      filters: { gearbox: gb },
      query: FR_GEARBOX[gb],
      primary: latinize(FR_GEARBOX[gb]),
      alt: [latinize(gb), gb === "automatique" ? "auto" : "manuel", "boite"],
      arabic: [AR_GEARBOX[gb]],
    });
  }

  // المدن — الاسم الفرنسي هو المعروض، العربي كسطر ثانوي
  for (const c of CITIES) {
    const n = 1;
    out.push({
      kind: "city",
      label: c.fr,
      sub: c.ar,
      count: n,
      filters: { city: c.slug },
      query: c.fr,
      primary: latinize(c.fr),
      alt: [latinize(c.slug), ...c.aliases.filter((a) => /[a-z]/i.test(a)).map(latinize)],
      arabic: [c.ar, ...c.aliases.filter((a) => !/[a-z]/i.test(a))],
    });
  }

  return out;
}

let INDEX: IndexEntry[] | null = null;
const index = () => (INDEX ??= buildIndex());

/** ترتيب الأنواع فاللائحة */
const KIND_RANK: Record<SuggestKind, number> = {
  make: 0, model: 1, body: 3, fuel: 4, gearbox: 5, city: 2,
};

/**
 * الاقتراحات لنص جزئي. المطابقة على البداية أولاً (كتب M → Mercedes)،
 * من بعد المطابقة الجزئية.
 */
export function suggest(input: string, limit = 8): Suggestion[] {
  const raw = input.trim();
  if (!raw) return [];
  const q = latinize(raw);
  if (!q) return [];

  const scored = index()
    .map((e) => {
      let best = -1;
      // المفتاح الرئيسي عندو الأولوية القصوى
      if (e.primary === q) best = 100;
      else if (e.primary.startsWith(q)) best = 76 - Math.min(10, (e.primary.length - q.length) * 0.5);
      else if (q.length >= 3 && e.primary.includes(q)) best = 34;
      // المفاتيح الثانوية كيوصلو لسقف أقل باش ماتسبقش كلمة مفردة اسماً كاملاً
      for (const k of e.alt) {
        if (k === q) best = Math.max(best, 58);
        else if (k.startsWith(q)) best = Math.max(best, 52 - Math.min(8, (k.length - q.length) * 0.5));
        else if (q.length >= 3 && k.includes(q)) best = Math.max(best, 26);
      }
      if (best < 0) return null;
      // الشعبية كتوزن أكثر ملي يكون النص قصير (كتب حرف → بغي الماركة المشهورة)
      const popW = q.length <= 2 ? 1.4 : 0.5;
      return {
        e,
        score: best - KIND_RANK[e.kind] * 5 + Math.min(14, e.count * popW),
      };
    })
    .filter(Boolean) as { e: IndexEntry; score: number }[];

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ e }) => ({
      kind: e.kind, label: e.label, sub: e.sub,
      count: e.count, filters: e.filters, query: e.query,
    }));
}

/** الموديلات ديال ماركة معيّنة — كتبان ملي المستخدم يختار ماركة */
export function modelsOfMake(make: string, limit = 10): Suggestion[] {
  return CATALOG.filter((c) => c.make === make)
    .slice(0, limit)
    .map((c) => ({
      kind: "model" as const,
      label: `${make} ${c.model}`,
      sub: c.kind === "moto" ? "دراجة نارية" : (c.body && FR_BODY[c.body]) || "سيارة",
      count: 1,
      filters: { make, model: c.model },
      query: `${make} ${c.model}`,
    }));
}

/** أشهر الماركات — كتبان ملي يكون الحقل خاوي */
export function topMakes(limit = 8): Suggestion[] {
  return index()
    .filter((e) => e.kind === "make")
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ kind, label, sub, count, filters, query }) => ({
      kind, label, sub, count, filters, query,
    }));
}

/** واش النص فيه حروف عربية */
export const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);

/**
 * ملي يكتب المستخدم بالعربية، كنلقاو ليه الكتابة اللاتينية الصحيحة
 * باش يتعلّم يكتبها كيف ما هي فالبطاقة الرمادية.
 */
export function latinHint(input: string): Suggestion[] {
  const t = input.trim();
  if (!t || !hasArabic(t)) return [];
  const norm = t.replace(/[\u0640\u064B-\u0652]/g, "");
  return index()
    .filter((e) => e.arabic.some((a) => norm.includes(a) || a.includes(norm)))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(({ kind, label, sub, count, filters, query }) => ({
      kind, label, sub, count, filters, query,
    }));
}
