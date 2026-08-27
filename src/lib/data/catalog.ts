import type { Body, VehicleKind } from "@/lib/types";

/* ============================================================
   كتالوج المركبات — مرجع، ماشي إعلانات

   لائحة الماركات والموديلات اللي كتّباع فالمغرب. كتعمّر القوائم
   المنسدلة ديال البيع والتقييم، والاقتراحات فالبحث، وكتخدم
   لتحليل الكتابة بالدارجة («كليو ديزل»).

   هنا غير معطيات المركبة نفسها — نوع الهيكل، القوة الجبائية،
   سعة المحرك. الأثمنة والكيلومتراج والمدن كيجيو من الإعلانات
   الحقيقية فقاعدة البيانات، ماشي من هنا.
   ============================================================ */

export interface CatalogItem {
  kind: VehicleKind;
  make: string;
  model: string;
  /** نوع الهيكل الغالب لهاد الموديل */
  body: Body;
  /** القوة الجبائية التقريبية (سيارات) */
  cv?: number;
  /** سعة المحرك بالسنتيمتر مكعب (دراجات) */
  cc?: number;
  doors?: number;
}

export const CATALOG: CatalogItem[] = [
  { kind: "car", make: "Audi", model: "A3", body: "citadine", cv: 8, doors: 5 },
  { kind: "car", make: "Audi", model: "A4", body: "berline", cv: 9, doors: 4 },
  { kind: "car", make: "Audi", model: "Q3", body: "suv", cv: 9, doors: 5 },
  { kind: "car", make: "BMW", model: "Série 1", body: "citadine", cv: 6, doors: 5 },
  { kind: "car", make: "BMW", model: "Série 3", body: "berline", cv: 9, doors: 4 },
  { kind: "car", make: "BMW", model: "X1", body: "suv", cv: 8, doors: 5 },
  { kind: "car", make: "Chevrolet", model: "Spark", body: "citadine", cv: 4, doors: 5 },
  { kind: "car", make: "Citroën", model: "C-Elysée", body: "berline", cv: 6, doors: 4 },
  { kind: "car", make: "Citroën", model: "C3", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Dacia", model: "Dokker", body: "utilitaire", cv: 6, doors: 5 },
  { kind: "car", make: "Dacia", model: "Duster", body: "suv", cv: 7, doors: 5 },
  { kind: "car", make: "Dacia", model: "Lodgy", body: "break", cv: 6, doors: 5 },
  { kind: "car", make: "Dacia", model: "Logan", body: "berline", cv: 6, doors: 4 },
  { kind: "car", make: "Dacia", model: "Sandero", body: "citadine", cv: 6, doors: 5 },
  { kind: "car", make: "Dacia", model: "Spring", body: "citadine", cv: 4, doors: 5 },
  { kind: "car", make: "Fiat", model: "Punto", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Fiat", model: "Tipo", body: "berline", cv: 6, doors: 4 },
  { kind: "car", make: "Ford", model: "Fiesta", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Ford", model: "Focus", body: "citadine", cv: 6, doors: 5 },
  { kind: "car", make: "Ford", model: "Ranger", body: "utilitaire", cv: 9, doors: 4 },
  { kind: "car", make: "Hyundai", model: "Accent", body: "berline", cv: 6, doors: 4 },
  { kind: "car", make: "Hyundai", model: "i10", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Hyundai", model: "i20", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Hyundai", model: "Kona", body: "suv", cv: 7, doors: 5 },
  { kind: "car", make: "Hyundai", model: "Tucson", body: "suv", cv: 8, doors: 5 },
  { kind: "car", make: "Isuzu", model: "D-Max", body: "utilitaire", cv: 8, doors: 4 },
  { kind: "car", make: "Jeep", model: "Compass", body: "suv", cv: 7, doors: 5 },
  { kind: "car", make: "Kia", model: "Picanto", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Kia", model: "Rio", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Kia", model: "Sportage", body: "suv", cv: 7, doors: 5 },
  { kind: "car", make: "Land Rover", model: "Range Rover Evoque", body: "suv", cv: 9, doors: 5 },
  { kind: "car", make: "Mercedes", model: "Classe A", body: "citadine", cv: 7, doors: 5 },
  { kind: "car", make: "Mercedes", model: "Classe C", body: "berline", cv: 9, doors: 4 },
  { kind: "car", make: "Mercedes", model: "Classe E", body: "berline", cv: 10, doors: 4 },
  { kind: "car", make: "Mitsubishi", model: "L200", body: "utilitaire", cv: 9, doors: 4 },
  { kind: "car", make: "Nissan", model: "Micra", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Nissan", model: "Qashqai", body: "suv", cv: 6, doors: 5 },
  { kind: "car", make: "Opel", model: "Corsa", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Peugeot", model: "208", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Peugeot", model: "3008", body: "suv", cv: 7, doors: 5 },
  { kind: "car", make: "Peugeot", model: "301", body: "berline", cv: 6, doors: 4 },
  { kind: "car", make: "Peugeot", model: "Partner", body: "utilitaire", cv: 6, doors: 4 },
  { kind: "car", make: "Renault", model: "Captur", body: "suv", cv: 6, doors: 5 },
  { kind: "car", make: "Renault", model: "Clio 4", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Renault", model: "Kangoo", body: "utilitaire", cv: 6, doors: 4 },
  { kind: "car", make: "Renault", model: "Mégane", body: "berline", cv: 7, doors: 5 },
  { kind: "car", make: "Renault", model: "Symbol", body: "berline", cv: 6, doors: 4 },
  { kind: "car", make: "Renault", model: "Zoe", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Seat", model: "Ibiza", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Seat", model: "Leon", body: "citadine", cv: 6, doors: 5 },
  { kind: "car", make: "Skoda", model: "Fabia", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Skoda", model: "Octavia", body: "berline", cv: 6, doors: 5 },
  { kind: "car", make: "Suzuki", model: "Swift", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Tesla", model: "Model 3", body: "berline", cv: 8, doors: 4 },
  { kind: "car", make: "Toyota", model: "Corolla", body: "berline", cv: 7, doors: 4 },
  { kind: "car", make: "Toyota", model: "Hilux", body: "utilitaire", cv: 9, doors: 4 },
  { kind: "car", make: "Toyota", model: "Yaris", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Volkswagen", model: "Caddy", body: "utilitaire", cv: 7, doors: 4 },
  { kind: "car", make: "Volkswagen", model: "Golf 7", body: "citadine", cv: 6, doors: 5 },
  { kind: "car", make: "Volkswagen", model: "Golf 8", body: "citadine", cv: 7, doors: 5 },
  { kind: "car", make: "Volkswagen", model: "Passat", body: "berline", cv: 8, doors: 4 },
  { kind: "car", make: "Volkswagen", model: "Polo", body: "citadine", cv: 5, doors: 5 },
  { kind: "car", make: "Volkswagen", model: "Tiguan", body: "suv", cv: 8, doors: 5 },
  { kind: "moto", make: "Bajaj", model: "Boxer", body: "roadster", cc: 150 },
  { kind: "moto", make: "Bajaj", model: "Pulsar", body: "roadster", cc: 199 },
  { kind: "moto", make: "Benelli", model: "TRK 502", body: "trail", cc: 500 },
  { kind: "moto", make: "BMW", model: "F 850 GS", body: "trail", cc: 853 },
  { kind: "moto", make: "BMW", model: "R 1200 GS", body: "trail", cc: 1170 },
  { kind: "moto", make: "Docker", model: "Star", body: "roadster", cc: 125 },
  { kind: "moto", make: "Haojue", model: "DK 150", body: "roadster", cc: 150 },
  { kind: "moto", make: "Harley-Davidson", model: "Forty-Eight", body: "custom", cc: 1202 },
  { kind: "moto", make: "Harley-Davidson", model: "Iron 883", body: "custom", cc: 883 },
  { kind: "moto", make: "Honda", model: "Africa Twin", body: "trail", cc: 998 },
  { kind: "moto", make: "Honda", model: "CB500X", body: "trail", cc: 471 },
  { kind: "moto", make: "Honda", model: "CBR 600RR", body: "sportive", cc: 599 },
  { kind: "moto", make: "Honda", model: "Forza 125", body: "scooter", cc: 125 },
  { kind: "moto", make: "Honda", model: "PCX 125", body: "scooter", cc: 125 },
  { kind: "moto", make: "Honda", model: "Transalp 750", body: "trail", cc: 755 },
  { kind: "moto", make: "Kawasaki", model: "Ninja 650", body: "sportive", cc: 649 },
  { kind: "moto", make: "Kawasaki", model: "Z650", body: "roadster", cc: 649 },
  { kind: "moto", make: "KTM", model: "790 Adventure", body: "trail", cc: 799 },
  { kind: "moto", make: "KTM", model: "Duke 390", body: "roadster", cc: 373 },
  { kind: "moto", make: "Kymco", model: "Agility 125", body: "scooter", cc: 125 },
  { kind: "moto", make: "MBK", model: "Booster", body: "scooter", cc: 50 },
  { kind: "moto", make: "Peugeot", model: "Django", body: "scooter", cc: 125 },
  { kind: "moto", make: "Peugeot", model: "Kisbee", body: "scooter", cc: 50 },
  { kind: "moto", make: "Royal Enfield", model: "Classic 500", body: "custom", cc: 499 },
  { kind: "moto", make: "Royal Enfield", model: "Meteor 350", body: "custom", cc: 349 },
  { kind: "moto", make: "Suzuki", model: "GSX-R 600", body: "sportive", cc: 599 },
  { kind: "moto", make: "SYM", model: "Jet 14", body: "scooter", cc: 125 },
  { kind: "moto", make: "SYM", model: "Symphony 125", body: "scooter", cc: 125 },
  { kind: "moto", make: "Vespa", model: "Primavera 125", body: "scooter", cc: 125 },
  { kind: "moto", make: "Yamaha", model: "Aerox", body: "scooter", cc: 155 },
  { kind: "moto", make: "Yamaha", model: "MT-07", body: "roadster", cc: 689 },
  { kind: "moto", make: "Yamaha", model: "NMAX", body: "scooter", cc: 155 },
  { kind: "moto", make: "Yamaha", model: "R6", body: "sportive", cc: 599 },
  { kind: "moto", make: "Yamaha", model: "Ténéré 700", body: "trail", cc: 689 },
  { kind: "moto", make: "Yamaha", model: "Tracer 700", body: "trail", cc: 689 },
];

/** الماركات ديال نوع معيّن، مرتّبة */
export function makesOf(kind?: VehicleKind): string[] {
  const set = new Set<string>();
  for (const c of CATALOG) if (!kind || c.kind === kind) set.add(c.make);
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** الموديلات ديال ماركة */
export function modelsOf(make: string, kind?: VehicleKind): string[] {
  const set = new Set<string>();
  for (const c of CATALOG) {
    if (c.make !== make) continue;
    if (kind && c.kind !== kind) continue;
    set.add(c.model);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** سطر الكتالوج ديال موديل معيّن */
export function catalogItem(make: string, model: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.make === make && c.model === model);
}

/** واش هاد الماركة ديال سيارات ولا دراجات (ولا بجوج)؟ */
export function kindsOfMake(make: string): Set<VehicleKind> {
  const out = new Set<VehicleKind>();
  for (const c of CATALOG) if (c.make === make) out.add(c.kind);
  return out;
}
