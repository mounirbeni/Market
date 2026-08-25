import { SELLERS } from "./sellers";
import type { Seller } from "@/lib/types";

export interface Dealer extends Seller {
  slug: string;
  tagline: string;
  about: string;
  address: string;
  hours: string;
  verified: boolean;
  brands: string[];
  cover: [string, string];
}

const EXTRA: Record<string, Omit<Dealer, keyof Seller>> = {
  s01: {
    slug: "auto-plus-casa",
    tagline: "وكالة سيارات مستعملة معتمدة",
    about:
      "أوطو بلاص كازا معرض متخصص فالسيارات المستعملة المفحوصة، خدام من 2014. كل مركبة كتدوز من فحص 120 نقطة قبل ما تُعرض، وكنوفرو ضمان ميكانيكي 3 شهور على المحرك وناقل الحركة.",
    address: "زنقة الزرقطوني، الدار البيضاء",
    hours: "الإثنين ـ السبت · 9:00 — 19:00",
    verified: true,
    brands: ["Dacia", "Renault", "Peugeot", "Volkswagen", "Kia"],
    cover: ["#0d2a55", "#1f5fe0"],
  },
  s02: {
    slug: "garage-atlas-marrakech",
    tagline: "بيع وشراء وتبادل",
    about:
      "كراج الأطلس فمراكش، متخصص فالسيارات العائلية والدفع الرباعي. كنقبلو التبادل وكنساعدو فملفات التمويل مع البنوك الشريكة.",
    address: "شارع محمد السادس، مراكش",
    hours: "كل يوم · 8:30 — 20:00",
    verified: true,
    brands: ["Dacia", "Toyota", "Hyundai", "Nissan"],
    cover: ["#123a72", "#2f7dff"],
  },
  s04: {
    slug: "siyarat-chamal-tanger",
    tagline: "أكبر مخزون فالشمال",
    about:
      "سيارات الشمال بطنجة، أكثر من 12 سنة فالسوق. مخزون دائم يفوق 80 مركبة، مع خدمة توصيل لكل مدن الشمال.",
    address: "طريق تطوان، طنجة",
    hours: "الإثنين ـ السبت · 9:00 — 18:30",
    verified: true,
    brands: ["Volkswagen", "Mercedes", "BMW", "Audi", "Seat"],
    cover: ["#0a1e3d", "#1550cc"],
  },
  s06: {
    slug: "auto-souss-agadir",
    tagline: "سيارات مضمونة بأثمنة معقولة",
    about:
      "أوطو سوس بأكادير، متخصص فالسيارات الاقتصادية والمدينية. كل إعلان معاه تقرير حالة مفصّل.",
    address: "شارع الحسن الثاني، أكادير",
    hours: "الإثنين ـ الجمعة · 9:00 — 19:00 · السبت · 9:00 — 14:00",
    verified: true,
    brands: ["Hyundai", "Kia", "Dacia", "Suzuki"],
    cover: ["#0e2b56", "#2f7dff"],
  },
  s08: {
    slug: "motor-house-casa",
    tagline: "دراجات نارية حصرياً",
    about:
      "موتور هاوس أول معرض بالدار البيضاء متخصص كامل فالدراجات النارية: رياضية، طرق وعرة، سكوتر. كنوفرو الصيانة وقطع الغيار الأصلية.",
    address: "بولفار غاندي، الدار البيضاء",
    hours: "الإثنين ـ السبت · 9:30 — 19:30",
    verified: true,
    brands: ["Yamaha", "Honda", "Kawasaki", "KTM", "Benelli"],
    cover: ["#101c3d", "#2f7dff"],
  },
  s10: {
    slug: "rahma-car-oujda",
    tagline: "ثقة من 2019",
    about:
      "الرحمة كار بوجدة، بيع وشراء السيارات المستعملة مع تسهيلات فالأداء ومساعدة فإجراءات التحويل.",
    address: "شارع محمد الخامس، وجدة",
    hours: "الإثنين ـ السبت · 9:00 — 19:00",
    verified: true,
    brands: ["Fiat", "Peugeot", "Citroën", "Renault"],
    cover: ["#0d2a55", "#1f5fe0"],
  },
  s12: {
    slug: "premium-motors-rabat",
    tagline: "سيارات راقية ومفحوصة",
    about:
      "بريميوم موتورز بالرباط، متخصص فالعلامات الراقية. كل مركبة كتجي بتقرير فحص كامل وتاريخ صيانة موثّق من الوكالة.",
    address: "حي الرياض، الرباط",
    hours: "الإثنين ـ السبت · 9:00 — 20:00",
    verified: true,
    brands: ["Mercedes", "BMW", "Audi", "Volkswagen", "Land Rover"],
    cover: ["#06152c", "#1550cc"],
  },
  s14: {
    slug: "bike-store-casa",
    tagline: "سكوتر ودراجات المدينة",
    about:
      "بايك ستور، متجر متخصص فالسكوتر والدراجات الصغيرة للمدينة، مع ورشة صيانة داخلية.",
    address: "درب عمر، الدار البيضاء",
    hours: "كل يوم ماعدا الأحد · 9:00 — 19:00",
    verified: true,
    brands: ["SYM", "Peugeot", "Vespa", "Kymco", "Honda"],
    cover: ["#0f2140", "#2f7dff"],
  },
  s16: {
    slug: "auto-deal-sud-laayoune",
    tagline: "مركبات الجنوب",
    about:
      "أوطو ديل الجنوب بالعيون، متخصص فالمركبات النفعية والدفع الرباعي المناسبة لطرق الجنوب.",
    address: "شارع مكة، العيون",
    hours: "الإثنين ـ السبت · 8:30 — 18:00",
    verified: true,
    brands: ["Toyota", "Mitsubishi", "Isuzu", "Ford"],
    cover: ["#0a1e3d", "#1f5fe0"],
  },
};

export const DEALERS: Dealer[] = SELLERS.filter((s) => EXTRA[s.id]).map((s) => ({
  ...s,
  ...EXTRA[s.id],
}));

export const dealerBySlug = (slug: string) => DEALERS.find((d) => d.slug === slug);
export const dealerBySellerId = (id: string) => DEALERS.find((d) => d.id === id);
