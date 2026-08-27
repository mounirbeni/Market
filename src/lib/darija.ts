/**
 * محرّك البحث بالدارجة
 * يحوّل جملة عادية ("كليو ديزل تحت 12 مليون فكازا") إلى فلاتر بحث.
 */
import { CITIES } from "./cities";
import { CATALOG } from "./data/catalog";
import { formatNumber } from "./format";

export interface ParsedQuery {
  kind?: "car" | "moto";
  make?: string;
  model?: string;
  fuel?: string;
  gearbox?: string;
  body?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  kmMax?: number;
  text?: string;
  /** ما فهمه المحرك، لعرضه للمستخدم */
  chips: { label: string; kind: string }[];
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْٰ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ﭺچ]/g, "ج")
    .replace(/[پ]/g, "ب")
    .replace(/[ڤﭬ]/g, "ف")
    .replace(/[گﮒ]/g, "ك")
    .replace(/[ـ]/g, "")
    .replace(/[éèê]/g, "e")
    .replace(/[àâ]/g, "a")
    .replace(/[ôö]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/\s+/g, " ")
    .trim();
}

/** أسماء الماركات بالدارجة والفرنسية */
const MAKE_ALIASES: Record<string, string[]> = {
  Dacia: ["داسيا", "داشيا", "dacia"],
  Renault: ["رونو", "رينو", "renault"],
  Peugeot: ["بيجو", "بيجوه", "peugeot", "pijo"],
  "Citroën": ["سيتروين", "ستروين", "citroen", "citroën"],
  Volkswagen: ["فولكس", "فولكسفاكن", "volkswagen", "vw", "folks"],
  Hyundai: ["هيونداي", "هوندا ي", "hyundai"],
  Kia: ["كيا", "kia"],
  Toyota: ["تويوتا", "طويوطا", "toyota"],
  Ford: ["فورد", "ford"],
  Fiat: ["فيات", "فيا", "fiat"],
  Seat: ["سيات", "seat"],
  Skoda: ["سكودا", "skoda"],
  Mercedes: ["مرسيدس", "مرسديس", "مرسيديس", "mercedes", "benz"],
  BMW: ["بي ام", "بي ام دبليو", "bmw", "بمو"],
  Audi: ["اودي", "أودي", "audi"],
  Nissan: ["نيسان", "nissan"],
  Opel: ["اوبل", "أوبل", "opel"],
  Jeep: ["جيب", "jeep"],
  "Land Rover": ["لاند روفر", "رانج روفر", "land rover", "range rover"],
  Suzuki: ["سوزوكي", "suzuki"],
  Chevrolet: ["شفروليه", "شيفروليه", "chevrolet"],
  Mitsubishi: ["ميتسوبيشي", "mitsubishi"],
  Isuzu: ["ايسوزو", "isuzu"],
  Kymco: ["كيمكو", "kymco"],
  Tesla: ["تيسلا", "tesla"],
  Yamaha: ["ياماها", "yamaha"],
  Honda: ["هوندا", "honda"],
  KTM: ["كي تي ام", "ktm"],
  Kawasaki: ["كاوازاكي", "kawasaki"],
  "Royal Enfield": ["رويال انفيلد", "royal enfield"],
  Vespa: ["فيسبا", "vespa"],
  SYM: ["سيم", "sym"],
  MBK: ["ام بي كي", "mbk", "بوستر"],
  Docker: ["دوكر", "docker"],
  Bajaj: ["باجاج", "bajaj"],
  Haojue: ["هاوجي", "haojue"],
  Benelli: ["بينيلي", "benelli"],
  "Harley-Davidson": ["هارلي", "harley", "davidson"],
};

const MODEL_ALIASES: Record<string, string[]> = {
  Logan: ["لوكان", "لوجان", "logan"],
  Sandero: ["سانديرو", "سندرو", "sandero", "ستيبواي", "stepway"],
  Duster: ["دوستر", "duster"],
  Dokker: ["دوكر", "dokker"],
  Lodgy: ["لودجي", "lodgy"],
  "Clio 4": ["كليو", "clio"],
  Symbol: ["سامبول", "symbol"],
  "Mégane": ["ميكان", "megane", "ميغان"],
  Kangoo: ["كانكو", "kangoo"],
  Captur: ["كابتور", "captur"],
  "208": ["208"],
  "301": ["301"],
  "3008": ["3008"],
  Partner: ["بارتنر", "partner"],
  "C-Elysée": ["اليزي", "elysee", "c-elysee"],
  C3: ["c3", "سي تروا"],
  "Golf 7": ["كولف", "golf", "غولف"],
  "Golf 8": ["كولف 8", "golf 8"],
  Polo: ["بولو", "polo"],
  Passat: ["باسات", "passat"],
  Tiguan: ["تيكوان", "tiguan"],
  i10: ["i10", "اي 10"],
  i20: ["i20"],
  Accent: ["اكسنت", "accent"],
  Tucson: ["توسان", "tucson"],
  Picanto: ["بيكانتو", "picanto"],
  Rio: ["ريو", "rio"],
  Sportage: ["سبورتاج", "sportage"],
  Yaris: ["ياريس", "yaris"],
  Corolla: ["كورولا", "corolla"],
  Hilux: ["هيلوكس", "hilux"],
  Fiesta: ["فييستا", "fiesta"],
  Focus: ["فوكس", "focus"],
  Punto: ["بونتو", "punto"],
  Tipo: ["تيبو", "tipo"],
  Ibiza: ["ابيزا", "ibiza"],
  Leon: ["ليون", "leon"],
  Octavia: ["اوكتافيا", "octavia"],
  Fabia: ["فابيا", "fabia"],
  "Classe C": ["كلاس س", "classe c", "c220", "c200"],
  "Classe A": ["كلاس ا", "classe a", "a180"],
  "Classe E": ["كلاس ي", "classe e", "e220"],
  "Série 3": ["سيري 3", "serie 3", "320d", "318"],
  "Série 1": ["سيري 1", "serie 1", "116"],
  X1: ["x1"],
  A3: ["a3"],
  A4: ["a4"],
  Q3: ["q3"],
  Qashqai: ["كاشكاي", "qashqai"],
  Micra: ["ميكرا", "micra"],
  Corsa: ["كورسا", "corsa"],
  Compass: ["كومباس", "compass"],
  Swift: ["سويفت", "swift"],
  Spark: ["سبارك", "spark"],
  L200: ["l200"],
  "Model 3": ["موديل 3", "model 3"],
  "MT-07": ["mt07", "mt-07", "ام تي"],
  "CB500X": ["cb500", "cb500x"],
  "PCX 125": ["pcx"],
  "Duke 390": ["ديوك", "duke"],
  Z650: ["z650"],
  "R 1200 GS": ["r1200", "1200 gs", "جي اس"],
  "GSX-R 600": ["gsxr", "gsx-r"],
  NMAX: ["nmax", "ان ماكس"],
  Aerox: ["ايروكس", "aerox"],
  Booster: ["بوستر", "booster"],
  Kisbee: ["كيسبي", "kisbee"],
  "TRK 502": ["trk"],
  "Africa Twin": ["افريكا توين", "africa twin"],
  "Iron 883": ["ايرون", "883"],
  Ranger: ["رانجر", "ranger"],
  "D-Max": ["dmax", "d-max"],
  Zoe: ["زوي", "zoe"],
  Spring: ["سبرينك", "spring"],
  Kona: ["كونا", "kona"],
  Caddy: ["كادي", "caddy"],
  "Ténéré 700": ["تينيري", "tenere"],
  "Ninja 650": ["نينجا", "ninja"],
  R6: ["r6"],
  "CBR 600RR": ["cbr"],
  "Forza 125": ["فورزا", "forza"],
  "Agility 125": ["اجيليتي", "agility"],
  Django: ["دجانكو", "django"],
  "F 850 GS": ["f850", "850 gs"],
  "Meteor 350": ["ميتيور", "meteor"],
  Pulsar: ["بولسار", "pulsar"],
};

const FUEL_ALIASES: Record<string, string[]> = {
  diesel: ["ديزل", "مازوط", "كازوال", "gasoil", "diesel", "dci", "tdi", "hdi", "crdi", "cdti", "d4d"],
  essence: ["بنزين", "ايسانس", "سانس", "essence", "petrol", "tsi", "puretech", "sce"],
  hybride: ["هجين", "هيبريد", "hybride", "hybrid"],
  electrique: ["كهربايي", "كهربا", "electrique", "electric", "ev"],
};

const GEARBOX_ALIASES: Record<string, string[]> = {
  automatique: ["اوتوماتيك", "أوتوماتيك", "اوطوماتيك", "otomatik", "automatique", "auto", "dsg", "bva"],
  manuelle: ["يدويه", "مانويل", "manuelle", "manuel", "bvm"],
};

const BODY_ALIASES: Record<string, string[]> = {
  suv: ["دفع رباعي", "فور فور", "4x4", "suv", "طوط ترين"],
  citadine: ["مدينيه", "سيتادين", "citadine", "compacte"],
  berline: ["صالون", "برلين", "berline", "sedan"],
  utilitaire: ["نفعيه", "يوتيليتير", "utilitaire", "فوركو", "fourgon", "بيك اب", "pickup"],
  scooter: ["سكوتر", "سكوطر", "scooter", "طاكس"],
  trail: ["تريل", "trail", "طرق وعره", "adventure"],
  sportive: ["سبور", "رياضيه", "sportive", "sport"],
  roadster: ["رودستر", "roadster", "naked"],
  custom: ["كوستوم", "custom", "شوبر"],
  break: ["بريك", "break", "7 بلايص", "7 places"],
};

const MOTO_WORDS = ["موطور", "موتور", "دراجه", "دراجه ناريه", "moto", "بيكالا", "سكوتر", "scooter", "بيكاله"];
const CAR_WORDS = ["طوموبيل", "طونوبيل", "سياره", "voiture", "كار", "طوموبيلا"];

const MAX_WORDS = ["تحت", "اقل من", "ماكس", "حتى", "ب ", "فحدود", "في حدود", "moins de", "max", "jusqu"];
const MIN_WORDS = ["فوق", "اكثر من", "من فوق", "بلوس", "plus de", "min", "starting"];

function findAlias(text: string, table: Record<string, string[]>): string | undefined {
  let best: { key: string; len: number } | undefined;
  for (const [key, aliases] of Object.entries(table)) {
    for (const a of [...aliases, key]) {
      const n = normalize(a);
      if (n.length < 2) continue;
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}\\p{N}]|$)`, "u");
      if (re.test(text) && (!best || n.length > best.len)) {
        best = { key, len: n.length };
      }
    }
  }
  return best?.key;
}

interface NumToken {
  value: number;
  unit: "million" | "dh" | "km" | "year" | "plain";
  index: number;
  raw: string;
}

function extractNumbers(text: string): NumToken[] {
  const tokens: NumToken[] = [];
  const re = /(\d+(?:[.,]\d+)?)\s*(مليون|ملاين|مليونه|الف|درهم|د\.?م|dh|dhs|mad|كم|km|سنتيم)?/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const value = parseFloat(m[1].replace(",", "."));
    const suffix = m[2] ?? "";
    let unit: NumToken["unit"] = "plain";
    if (/مليون|ملاين|مليونه/.test(suffix)) unit = "million";
    else if (/الف/.test(suffix)) unit = "dh";
    else if (/درهم|د\.?م|dh|dhs|mad|سنتيم/.test(suffix)) unit = "dh";
    else if (/كم|km/.test(suffix)) unit = "km";
    else if (value >= 1980 && value <= 2027 && Number.isInteger(value)) unit = "year";
    tokens.push({ value, unit, index: m.index, raw: m[0] });
  }
  return tokens;
}

function contextBefore(text: string, index: number): "max" | "min" | undefined {
  const before = text.slice(Math.max(0, index - 22), index);
  if (MAX_WORDS.some((w) => before.includes(normalize(w)))) return "max";
  if (MIN_WORDS.some((w) => before.includes(normalize(w)))) return "min";
  return undefined;
}

export function parseDarija(input: string): ParsedQuery {
  const text = normalize(input);
  const q: ParsedQuery = { chips: [] };
  if (!text) return q;

  // النوع
  if (MOTO_WORDS.some((w) => text.includes(normalize(w)))) q.kind = "moto";
  else if (CAR_WORDS.some((w) => text.includes(normalize(w)))) q.kind = "car";

  const make = findAlias(text, MAKE_ALIASES);
  if (make) {
    q.make = make;
    q.chips.push({ label: make, kind: "الماركة" });
    const isMoto = CATALOG.some((v) => v.make === make && v.kind === "moto");
    const isCar = CATALOG.some((v) => v.make === make && v.kind === "car");
    if (!q.kind && isMoto !== isCar) q.kind = isMoto ? "moto" : "car";
  }

  const model = findAlias(text, MODEL_ALIASES);
  if (model && (!make || CATALOG.some((v) => v.model === model && v.make === make))) {
    q.model = model;
    q.chips.push({ label: model, kind: "الموديل" });
    if (!q.make) {
      const found = CATALOG.find((v) => v.model === model);
      if (found) {
        q.make = found.make;
        q.kind = q.kind ?? found.kind;
      }
    }
  }

  const fuel = findAlias(text, FUEL_ALIASES);
  if (fuel) {
    q.fuel = fuel;
    q.chips.push({
      label: { diesel: "ديزل", essence: "بنزين", hybride: "هجين", electrique: "كهربائي" }[fuel]!,
      kind: "الوقود",
    });
  }

  const gearbox = findAlias(text, GEARBOX_ALIASES);
  if (gearbox) {
    q.gearbox = gearbox;
    q.chips.push({ label: gearbox === "automatique" ? "أوتوماتيك" : "يدوية", kind: "الناقل" });
  }

  const body = findAlias(text, BODY_ALIASES);
  if (body) {
    q.body = body;
    if (["scooter", "trail", "roadster", "custom", "sportive"].includes(body)) q.kind = "moto";
  }

  // المدينة
  for (const c of CITIES) {
    const hit = [c.ar, c.fr, ...c.aliases].some((a) => {
      const n = normalize(a);
      return n.length > 2 && (text.includes(` ${n}`) || text.includes(`ف${n}`) || text.startsWith(n));
    });
    if (hit) {
      q.city = c.slug;
      q.chips.push({ label: c.ar, kind: "المدينة" });
      break;
    }
  }

  // الأرقام
  const nums = extractNumbers(text);
  const cheap = /رخيص|رخيصه|بلا فلوس|pas cher/.test(text);

  for (const t of nums) {
    const ctx = contextBefore(text, t.index);
    if (t.unit === "year") {
      if (ctx === "max") q.yearMax = t.value;
      else q.yearMin = t.value;
      q.chips.push({ label: `${t.value}`, kind: ctx === "max" ? "قبل سنة" : "من سنة" });
      continue;
    }
    if (t.unit === "km") {
      q.kmMax = t.value < 1000 ? t.value * 1000 : t.value;
      q.chips.push({ label: `أقل من ${formatNumber(q.kmMax)} كم`, kind: "الكيلومتراج" });
      continue;
    }
    let dh: number | undefined;
    if (t.unit === "million") dh = t.value * 10000;
    else if (t.unit === "dh") dh = t.value < 1000 ? t.value * 1000 : t.value;
    else if (t.unit === "plain") {
      if (t.value >= 5000) dh = t.value;
      else if (t.value >= 3 && t.value <= 400 && ctx) dh = t.value * 10000; // "تحت 12" = 12 مليون
    }
    if (dh === undefined) continue;
    if (ctx === "min") {
      q.priceMin = dh;
      q.chips.push({ label: `من ${formatNumber(dh)} د.م`, kind: "الثمن" });
    } else {
      q.priceMax = dh;
      q.chips.push({ label: `حتى ${formatNumber(dh)} د.م`, kind: "الثمن" });
    }
  }

  if (cheap && !q.priceMax) {
    q.priceMax = q.kind === "moto" ? 25000 : 90000;
    q.chips.push({ label: "أثمنة منخفضة", kind: "الثمن" });
  }

  if (q.kind) {
    q.chips.unshift({ label: q.kind === "moto" ? "دراجات" : "سيارات", kind: "النوع" });
  }

  // النص المتبقي (بحث حر)
  if (!q.chips.length) q.text = input.trim();

  return q;
}

/** أمثلة تُعرض للمستخدم */
export const SEARCH_EXAMPLES = [
  "كليو ديزل تحت 13 مليون فكازا",
  "دوستر ديزل من 2018",
  "سكوتر 125 رخيص فكازا",
  "golf tdi moins de 180000 dh",
  "طوموبيل بنزين أقل من 100000 كم",
  "MT-07 فكازا",
];
