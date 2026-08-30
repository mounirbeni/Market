/* ============================================================
   بيانات الماركات — الأسماء بالحروف اللاتينية ديما

   ملاحظة قانونية مهمة:
   شعارات الصانعين علامات تجارية مسجّلة. هاد الملف ماكيحتوي على
   حتى شعار — غير الاسم، اللون المرجعي، وبلد المنشأ (معطيات وقائع).
   إلا حصلتي على حق استعمال الشعارات الرسمية، حطّهم فـ
   public/brands/<slug>.svg وغادي يتعرضو تلقائياً بدل الشارة النصية.
   شوف public/brands/README.md.
   ============================================================ */

export interface BrandMeta {
  slug: string;
  name: string;
  /** لون مرجعي للعرض — ماشي جزء من العلامة التجارية */
  accent: string;
  country: string;
  kind: "car" | "moto" | "both";
}

export const BRANDS: BrandMeta[] = [
  // سيارات
  { slug: "dacia", name: "Dacia", accent: "#646b52", country: "رومانيا", kind: "car" },
  { slug: "renault", name: "Renault", accent: "#efdf00", country: "فرنسا", kind: "car" },
  { slug: "peugeot", name: "Peugeot", accent: "#00543d", country: "فرنسا", kind: "both" },
  { slug: "citroen", name: "Citroën", accent: "#c8102e", country: "فرنسا", kind: "car" },
  { slug: "volkswagen", name: "Volkswagen", accent: "#001e50", country: "ألمانيا", kind: "car" },
  { slug: "mercedes", name: "Mercedes", accent: "#1b1b1b", country: "ألمانيا", kind: "car" },
  { slug: "bmw", name: "BMW", accent: "#0066b1", country: "ألمانيا", kind: "both" },
  { slug: "audi", name: "Audi", accent: "#bb0a30", country: "ألمانيا", kind: "car" },
  { slug: "opel", name: "Opel", accent: "#f7ff14", country: "ألمانيا", kind: "car" },
  { slug: "toyota", name: "Toyota", accent: "#eb0a1e", country: "اليابان", kind: "car" },
  { slug: "nissan", name: "Nissan", accent: "#c3002f", country: "اليابان", kind: "car" },
  { slug: "honda", name: "Honda", accent: "#cc0000", country: "اليابان", kind: "both" },
  { slug: "suzuki", name: "Suzuki", accent: "#e30613", country: "اليابان", kind: "both" },
  { slug: "mitsubishi", name: "Mitsubishi", accent: "#e60012", country: "اليابان", kind: "car" },
  { slug: "isuzu", name: "Isuzu", accent: "#d31145", country: "اليابان", kind: "car" },
  { slug: "hyundai", name: "Hyundai", accent: "#002c5f", country: "كوريا الجنوبية", kind: "car" },
  { slug: "kia", name: "Kia", accent: "#05141f", country: "كوريا الجنوبية", kind: "car" },
  { slug: "ford", name: "Ford", accent: "#00274e", country: "أمريكا", kind: "car" },
  { slug: "chevrolet", name: "Chevrolet", accent: "#d1a12a", country: "أمريكا", kind: "car" },
  { slug: "jeep", name: "Jeep", accent: "#485c3e", country: "أمريكا", kind: "car" },
  { slug: "tesla", name: "Tesla", accent: "#cc0000", country: "أمريكا", kind: "car" },
  { slug: "fiat", name: "Fiat", accent: "#8b1d3f", country: "إيطاليا", kind: "car" },
  { slug: "seat", name: "Seat", accent: "#ac2b37", country: "إسبانيا", kind: "car" },
  { slug: "skoda", name: "Skoda", accent: "#0e3a2f", country: "التشيك", kind: "car" },
  { slug: "land-rover", name: "Land Rover", accent: "#005a2b", country: "بريطانيا", kind: "car" },
  { slug: "docker", name: "Docker", accent: "#1f5fe0", country: "المغرب", kind: "car" },

  // دراجات نارية
  { slug: "yamaha", name: "Yamaha", accent: "#0033a0", country: "اليابان", kind: "moto" },
  { slug: "kawasaki", name: "Kawasaki", accent: "#3fa535", country: "اليابان", kind: "moto" },
  { slug: "ktm", name: "KTM", accent: "#ff6600", country: "النمسا", kind: "moto" },
  { slug: "vespa", name: "Vespa", accent: "#1b365d", country: "إيطاليا", kind: "moto" },
  { slug: "benelli", name: "Benelli", accent: "#00954c", country: "إيطاليا", kind: "moto" },
  { slug: "harley-davidson", name: "Harley-Davidson", accent: "#f36e21", country: "أمريكا", kind: "moto" },
  { slug: "royal-enfield", name: "Royal Enfield", accent: "#a5202c", country: "الهند", kind: "moto" },
  { slug: "bajaj", name: "Bajaj", accent: "#0075c9", country: "الهند", kind: "moto" },
  { slug: "sym", name: "SYM", accent: "#005ca9", country: "تايوان", kind: "moto" },
  { slug: "kymco", name: "Kymco", accent: "#0b3d91", country: "تايوان", kind: "moto" },
  { slug: "haojue", name: "Haojue", accent: "#c8102e", country: "الصين", kind: "moto" },
  { slug: "mbk", name: "MBK", accent: "#e4002b", country: "فرنسا", kind: "moto" },
];

const BY_NAME = new Map(BRANDS.map((b) => [b.name.toLowerCase(), b]));
const BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));

export const brandByName = (name: string) => BY_NAME.get(name.toLowerCase());
export const brandBySlug = (slug: string) => BY_SLUG.get(slug);

/**
 * الماركات اللي عندنا ملف شعار ديالها فـ public/brands/.
 * الباقي كيتعرض بشارة نصية مصمّمة.
 * شوف public/brands/README.md للمصادر وللوضع القانوني.
 */
export const OFFICIAL_LOGOS = new Set<string>([
  "abarth", "alfa-romeo", "alpine", "aston-martin", "audi", "baic",
  "bajaj", "bentley", "bmw", "byd", "changan", "chery", "chevrolet",
  "citroen", "cupra", "dacia", "deepal", "dongfeng", "ds", "exeed",
  "ferrari", "fiat", "ford", "foton", "gaz", "geely", "harley-davidson",
  "honda", "hyundai", "isuzu", "jac", "jaguar", "jeep", "jetour", "kia",
  "ktm", "land-rover", "leapmotor", "lexus", "mahindra", "maserati",
  "mazda", "mercedes", "mg", "mini", "mitsubishi", "nissan", "opel",
  "peugeot", "porsche", "renault", "rox", "royal-enfield", "seat", "skoda",
  "smart", "soueast", "ssangyong", "subaru", "suzuki", "tata", "tesla",
  "toyota", "vespa", "volkswagen", "volvo", "xpeng", "yamaha", "zeekr",
]);

/** الشعارات التي أُضيفت من carlogos.org بصيغة PNG. */
export const PNG_LOGOS = new Set<string>([
  "abarth", "alfa-romeo", "alpine", "aston-martin", "baic", "bentley", "byd",
  "changan", "chery", "cupra", "deepal", "ds", "dongfeng", "exeed", "ferrari",
  "foton", "gaz", "geely", "jac", "jaguar", "jetour", "leapmotor", "lexus", "mahindra",
  "maserati", "mazda", "mg", "mini", "porsche", "rox", "smart", "soueast", "ssangyong",
  "subaru", "tata", "volvo", "xpeng", "zeekr",
]);

export const hasOfficialLogo = (slug: string) => OFFICIAL_LOGOS.has(slug);

export const brandLogoPath = (slug: string) => {
  if (!hasOfficialLogo(slug)) return undefined;
  return `/brands/${slug}.${PNG_LOGOS.has(slug) ? "png" : "svg"}`;
};

/** أوّل حرفين للشارة المختصرة: BMW → BM، Land Rover → LR */
export function brandInitials(name: string): string {
  const words = name.split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
