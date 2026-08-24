import type { HistoryEvent, Vehicle } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { RAW, type RawListing } from "./raw";
import { SELLERS } from "./sellers";
import { int, NOW, pick, pickMany, rng } from "./seed";

const COLORS = ["أبيض", "أسود", "رمادي", "فضي", "أزرق ليلي", "أحمر", "بيج", "بني"] as const;
const MOTO_COLORS = ["أسود مطفي", "أزرق", "أحمر", "أبيض", "رمادي", "برتقالي"] as const;

const CAR_EQUIPMENT = [
  "مكيف الهواء",
  "نظام ABS",
  "وسائد هوائية",
  "قفل مركزي",
  "زجاج كهربائي",
  "راديو Bluetooth",
  "شاشة تعمل باللمس",
  "كاميرا الرجوع للخلف",
  "حساسات ركن",
  "مثبت السرعة",
  "جنطات ألومنيوم",
  "GPS",
  "فتحة سقف",
  "مقاعد جلدية",
  "تكييف أوتوماتيكي",
  "أضواء LED",
  "مقود متعدد الوظائف",
  "نظام ESP",
];

const MOTO_EQUIPMENT = [
  "نظام ABS",
  "أضواء LED",
  "لوحة عدادات رقمية",
  "مقبض مسخّن",
  "حقائب جانبية",
  "درع واقي للمحرك",
  "عادم رياضي",
  "إطارات جديدة",
  "شاحن USB",
  "زجاج أمامي عالٍ",
  "نظام تحكم في الجر",
  "وضعيات قيادة متعددة",
];

const DESC_OPENERS = [
  "الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي.",
  "المركبة مصانة بزاف، الصيانة كاملة كتدار فالوكالة.",
  "بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة.",
  "ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة.",
  "مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي.",
  "الطوموبيل مزيانة بزاف، ما فيها لا صدمة لا صباغة.",
  "صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب.",
  "للجادين فقط، الثمن قابل للنقاش الخفيف.",
];

const DESC_MOTO_OPENERS = [
  "الموطور فحالة زوينة، خدمة بلا مشاكل.",
  "صيانة مضبوطة عند الوكيل المعتمد، الوثائق كاملة.",
  "مستعملة فالويكاند فقط، البنو والإطارات فحالة ممتازة.",
  "بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة.",
  "المحرك نظيف والصيانة كاملة موثقة بالفواتير.",
];

const DESC_CLOSERS = [
  "الفحص التقني صالح والوثائق جاهزة للتحويل.",
  "ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.",
  "التسليم فوري بعد إتمام الإجراءات.",
  "نقبل الفحص عند أي كراج ديال اختيارك.",
  "الثمن نهائي تقريباً، المرجو الجدية.",
];

function pickCarPapers(r: () => number, cond: string) {
  if (cond === "excellent") return true;
  if (cond === "moyen") return r() > 0.35;
  return r() > 0.12;
}

function buildHistory(raw: RawListing, r: () => number, owners: number): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  const month = int(r, 1, 12);
  events.push({
    date: `${raw.year}-${String(month).padStart(2, "0")}-12`,
    type: "mise-en-circulation",
    label: "أول تسجيل في المغرب",
    detail: `${raw.make} ${raw.model} ${raw.version}`,
  });

  const age = Math.max(1, 2026 - raw.year);
  const kmPerYear = raw.km / age;

  for (let i = 1; i < owners; i++) {
    const y = raw.year + Math.round((age * i) / owners);
    events.push({
      date: `${y}-0${int(r, 1, 9)}-${String(int(r, 10, 27))}`,
      type: "proprietaire",
      label: `تغيير المالك رقم ${i + 1}`,
      km: Math.round((kmPerYear * (y - raw.year)) / 500) * 500,
    });
  }

  const serviceCount = Math.min(4, Math.max(1, Math.floor(age / 2)));
  for (let i = 1; i <= serviceCount; i++) {
    const y = raw.year + Math.round((age * i) / (serviceCount + 1));
    events.push({
      date: `${y}-${String(int(r, 1, 12)).padStart(2, "0")}-${String(int(r, 10, 27))}`,
      type: "entretien",
      label: pick(r, [
        "صيانة دورية: زيت + فلاتر",
        "تغيير سير التوزيع",
        "تغيير الفرامل الأمامية",
        "صيانة كبرى في الوكالة",
        "تغيير الإطارات الأربعة",
        "تغيير البطارية",
      ]),
      km: Math.round((kmPerYear * (y - raw.year)) / 500) * 500,
    });
  }

  if (r() < 0.22) {
    const y = raw.year + int(r, 1, Math.max(1, age - 1));
    events.push({
      date: `${y}-${String(int(r, 1, 12)).padStart(2, "0")}-14`,
      type: "accident",
      label: "حادث مصرّح به",
      detail: pick(r, [
        "صدمة خفيفة في الصدام الأمامي — تم الإصلاح",
        "خدوش جانبية — صباغة جزئية للباب الأيمن",
        "صدمة خلفية خفيفة — تغيير الصدام",
      ]),
    });
  }

  events.push({
    date: `2026-0${int(r, 1, 8)}-${String(int(r, 10, 27))}`,
    type: "visite",
    label: "الفحص التقني — صالح",
    km: raw.km - int(r, 200, 3000),
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

function buildVehicle(raw: RawListing, index: number): Vehicle {
  const r = rng(raw.id);
  const isMoto = raw.kind === "moto";
  const age = Math.max(1, 2026 - raw.year);

  const owners = raw.cond === "excellent" ? int(r, 1, 2) : raw.cond === "moyen" ? int(r, 2, 4) : int(r, 1, 3);
  const firstHand = owners === 1;

  const proSellers = SELLERS.filter((s) => s.type === "professionnel");
  const privSellers = SELLERS.filter((s) => s.type === "particulier");
  const cityPro = proSellers.filter((s) => s.city === raw.city);
  const cityPriv = privSellers.filter((s) => s.city === raw.city);
  const wantsPro = r() < (raw.price > 200000 ? 0.7 : 0.45);
  const pool = wantsPro
    ? cityPro.length
      ? cityPro
      : proSellers
    : cityPriv.length
      ? cityPriv
      : privSellers;
  const seller = pool[index % pool.length];

  const photos = int(r, 4, 16);
  const hasVideo = r() < 0.3;
  const serviceBook = raw.cond === "excellent" ? r() < 0.9 : r() < 0.55;
  const vinChecked = r() < 0.62;
  const inspected = r() < 0.3;

  const daysAgo = int(r, 0, 34);
  const publishedAt = new Date(NOW - daysAgo * 86400000 - int(r, 0, 20) * 3600000).toISOString();

  const dropCount = r() < 0.35 ? int(r, 1, 2) : 0;
  const priceDrops: number[] = [];
  for (let i = 0; i < dropCount; i++) {
    priceDrops.push(Math.round((raw.price * (0.02 + r() * 0.05)) / 500) * 500);
  }

  const equipmentPool = isMoto ? MOTO_EQUIPMENT : CAR_EQUIPMENT;
  const equipCount = raw.price > 220000 ? int(r, 8, 11) : raw.price > 120000 ? int(r, 5, 8) : int(r, 3, 6);
  const equipment = pickMany(r, equipmentPool, Math.min(equipCount, equipmentPool.length));

  const description = [
    pick(r, isMoto ? DESC_MOTO_OPENERS : DESC_OPENERS),
    `${raw.make} ${raw.model} ${raw.version} موديل ${raw.year}، قاطعة ${formatNumber(raw.km)} كيلومتر.`,
    serviceBook ? "دفتر الصيانة متوفر بجميع الفواتير." : "الصيانة كتدار عند ميكانيسيان ثقة.",
    pick(r, DESC_CLOSERS),
  ].join(" ");

  const tcMonth = int(r, 9, 12);
  const technicalControl = `2026-${String(tcMonth).padStart(2, "0")}-${String(int(r, 5, 27)).padStart(2, "0")}`;

  return {
    id: raw.id,
    kind: raw.kind,
    make: raw.make,
    model: raw.model,
    version: raw.version,
    year: raw.year,
    km: raw.km,
    price: raw.price,
    owners,
    fuel: raw.fuel,
    gearbox: raw.gearbox,
    body: raw.body,
    fiscalPower: raw.cv,
    consumption: raw.conso,
    displacement: raw.cc,
    doors: raw.doors,
    color: pick(r, isMoto ? MOTO_COLORS : COLORS),
    city: raw.city,
    condition: raw.cond,
    firstHand,
    papersOk: pickCarPapers(r, raw.cond),
    technicalControl,
    inspected,
    photos,
    hasVideo,
    serviceBook,
    vinChecked,
    description,
    equipment,
    history: buildHistory(raw, r, owners),
    sellerId: seller.id,
    publishedAt,
    views: int(r, 120, 4200) + age * 10,
    saves: int(r, 3, 180),
    priceDrops,
    negotiable: r() < 0.72,
    exchangeAccepted: r() < 0.28,
    boosted: r() < 0.18,
  };
}

export const VEHICLES: Vehicle[] = RAW.map(buildVehicle);

export const vehicleById = (id: string) => VEHICLES.find((v) => v.id === id);

export const MAKES = Array.from(new Set(VEHICLES.map((v) => v.make))).sort();

export function makesFor(kind: "car" | "moto" | "all") {
  const list = kind === "all" ? VEHICLES : VEHICLES.filter((v) => v.kind === kind);
  return Array.from(new Set(list.map((v) => v.make))).sort();
}

export function modelsFor(make: string) {
  return Array.from(
    new Set(VEHICLES.filter((v) => v.make === make).map((v) => v.model)),
  ).sort();
}
