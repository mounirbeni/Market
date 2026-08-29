/* ============================================================
   خيارات المركبة — مصدر وحيد

   لائحات الهيكل، الوقود، الدفع، المصدر... كانت مكررة فـ3 أماكن
   (لوحة الفلترة، البحث المتقدم، نموذج البيع) وكل وحدة كتبدّل
   بلا الأخرى. دابا كلشي كيقرا من هنا.
   ============================================================ */
import {
  Bolt, Door, Droplet, Flag, Fuel, Gearbox, Leaf, Palette,
} from "@/components/icons";

export const CAR_BODIES = [
  { value: "citadine", label: "مدينية", fr: "Citadine" },
  { value: "berline", label: "صالون", fr: "Berline" },
  { value: "suv", label: "دفع رباعي", fr: "SUV" },
  { value: "break", label: "بريك", fr: "Break" },
  { value: "utilitaire", label: "نفعية", fr: "Utilitaire" },
  { value: "cabriolet", label: "مكشوفة", fr: "Cabriolet" },
] as const;

export const MOTO_BODIES = [
  { value: "scooter", label: "سكوتر", fr: "Scooter" },
  { value: "roadster", label: "رودستر", fr: "Roadster" },
  { value: "trail", label: "طرق وعرة", fr: "Trail" },
  { value: "sportive", label: "رياضية", fr: "Sportive" },
  { value: "custom", label: "كوستوم", fr: "Custom" },
] as const;

export const MOTO_BODY_SET = new Set<string>(MOTO_BODIES.map((b) => b.value));

export const FUELS = [
  { value: "diesel", label: "ديزل", fr: "Diesel", Icon: Droplet },
  { value: "essence", label: "بنزين", fr: "Essence", Icon: Fuel },
  { value: "hybride", label: "هجين", fr: "Hybride", Icon: Leaf },
  { value: "electrique", label: "كهربائي", fr: "Électrique", Icon: Bolt },
] as const;

export const GEARBOXES = [
  { value: "manuelle", label: "يدوية", fr: "Manuelle", Icon: Gearbox },
  { value: "automatique", label: "أوتوماتيك", fr: "Automatique", Icon: Gearbox },
] as const;

export const CONDITIONS = [
  { value: "excellent", label: "ممتازة", fr: "Excellent" },
  { value: "tres-bon", label: "جيدة جداً", fr: "Très bon" },
  { value: "bon", label: "جيدة", fr: "Bon" },
  { value: "moyen", label: "متوسطة", fr: "Moyen" },
] as const;

/* «دفع كلي (4x4)» ماشي «دفع رباعي» — هاد التسمية مستعملة أصلاً
   لهيكل الـSUV فوق، وخاصنا نفرّقو بينهم باش مايتخلطوش. */
export const DRIVETRAINS = [
  { value: "fwd", label: "دفع أمامي", fr: "Traction avant" },
  { value: "rwd", label: "دفع خلفي", fr: "Propulsion" },
  { value: "awd", label: "دفع كلي (4x4)", fr: "4x4 / Intégral" },
] as const;

export const ORIGINS = [
  { value: "maghribia", label: "مغربية الأصل", fr: "Origine marocaine" },
  { value: "mostawrada", label: "مستوردة", fr: "Importée / dédouanée" },
] as const;

export const DOOR_OPTIONS = [2, 3, 4, 5] as const;

/** ألوان شائعة فسوق السيارات المغربي — البائع يقدر يكتب لون آخر */
export const COMMON_COLORS = [
  "أبيض", "أسود", "رمادي", "فضي", "أزرق", "أحمر", "بني", "بيج", "أخضر", "ذهبي",
] as const;

export const SPEC_ICONS = { Door, Palette, Flag } as const;
