import type { Locale } from "./config";
import { CITIES, cityBySlug } from "@/lib/cities";
import { AR, formatNumber } from "@/lib/format";

/* ============================================================
   التسميات حسب اللغة

   بزاف من التسميات (الهيكل، الوقود، الدفع، المدن) عندها أصلاً
   حقل `fr` فمصدرها — vehicle-options.ts وcities.ts. هنا كنجمعو
   الباقي (الوقود فالبطاقات، الوحدات، «منذ…») ونعطيو دالة وحدة
   كتختار حسب اللغة.

   القاعدة: أي نص كيبان للزائر خاصو يدوز من هنا ولا من القاموس.
   ============================================================ */

export const FR_SPECS = {
  fuel: {
    diesel: "Diesel",
    essence: "Essence",
    hybride: "Hybride",
    electrique: "Électrique",
  },
  gearbox: { manuelle: "Manuelle", automatique: "Automatique" },
  body: {
    citadine: "Citadine",
    berline: "Berline",
    suv: "SUV",
    break: "Break",
    utilitaire: "Utilitaire",
    cabriolet: "Cabriolet",
    scooter: "Scooter",
    roadster: "Roadster",
    trail: "Trail",
    sportive: "Sportive",
    custom: "Custom",
  },
  condition: {
    excellent: "Excellent",
    "tres-bon": "Très bon",
    bon: "Bon",
    moyen: "Moyen",
  },
  seller: { particulier: "Particulier", professionnel: "Professionnel" },
  kind: { car: "Voiture", moto: "Moto" },
} as const;

/** خريطة التسميات ديال اللغة — نفس المفاتيح فالجوج */
export const specs = (locale: Locale) => (locale === "fr" ? FR_SPECS : AR);

/** اسم المدينة باللغة المطلوبة — كيرجع الـslug إلا ماعرفناهاش */
export const cityLabel = (slug: string, locale: Locale): string => {
  const c = cityBySlug(slug);
  return c ? (locale === "fr" ? c.fr : c.ar) : slug;
};

/** كل المدن بأسماء اللغة الحالية — مرتّبة بالأبجدية ديال اللغة */
export const citiesIn = (locale: Locale) =>
  CITIES.map((c) => ({ slug: c.slug, name: locale === "fr" ? c.fr : c.ar }));

/* ---------- الوحدات والتنسيق ---------- */

export const dhUnit = (locale: Locale) => (locale === "fr" ? "DH" : "د.م");
export const kmUnit = (locale: Locale) => (locale === "fr" ? "km" : "كم");
export const millionUnit = (locale: Locale) => (locale === "fr" ? "millions" : "مليون");

export const fmtDh = (n: number, locale: Locale) => `${formatNumber(n)} ${dhUnit(locale)}`;
export const fmtKm = (n: number, locale: Locale) => `${formatNumber(n)} ${kmUnit(locale)}`;

/** بالمليون سنتيم — الطريقة اللي كيتكلمو بيها المغاربة بالجوج لغات */
export function fmtMillion(n: number, locale: Locale): string {
  const m = n / 10000;
  const txt = m >= 100 ? formatNumber(m) : m.toFixed(m % 1 === 0 ? 0 : 1).replace(".", ",");
  return `${txt} ${millionUnit(locale)}`;
}

export const fmtPrice = (n: number, unit: "dh" | "million", locale: Locale) =>
  unit === "million" ? fmtMillion(n, locale) : fmtDh(n, locale);

const FR_MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو",
  "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر",
];

export function fmtDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  const months = locale === "fr" ? FR_MONTHS : AR_MONTHS;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtMonthYear(iso: string, locale: Locale): string {
  const d = new Date(iso);
  const months = locale === "fr" ? FR_MONTHS : AR_MONTHS;
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * «منذ 3 أيام» / «il y a 3 jours»
 *
 * العربية عندها المثنّى (يومين، ساعتين) — الفرنسية لا، عندها غير
 * الجمع بالـs. علاش الجوج مكتوبين بيدّهم بدل قالب مشترك.
 */
export function fmtTimeAgo(iso: string, locale: Locale, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (locale === "fr") {
    if (mins < 60) return mins <= 1 ? "il y a une minute" : `il y a ${mins} minutes`;
    if (hours < 24) return hours === 1 ? "il y a une heure" : `il y a ${hours} heures`;
    if (days < 30) return days === 1 ? "il y a un jour" : `il y a ${days} jours`;
    return months === 1 ? "il y a un mois" : `il y a ${months} mois`;
  }

  if (mins < 60) return `منذ ${mins <= 1 ? "دقيقة" : `${mins} دقيقة`}`;
  if (hours < 24) return `منذ ${hours === 1 ? "ساعة" : hours === 2 ? "ساعتين" : `${hours} ساعات`}`;
  if (days < 30) return `منذ ${days === 1 ? "يوم" : days === 2 ? "يومين" : `${days} أيام`}`;
  return `منذ ${months === 1 ? "شهر" : months === 2 ? "شهرين" : `${months} أشهر`}`;
}

/**
 * لائحة خيارات (هيكل، وقود، دفع…) بلغة الزائر.
 *
 * المصادر أصلاً فيهم `label` بالعربية و`fr` بالفرنسية — الفرنسي
 * كان كيبان كسطر صغير تحت العربي. ملي الواجهة كلها بالفرنسية،
 * الفرنسي كيولّي هو التسمية والعربي كيختفي.
 */
export function localizeOptions<T extends { label: string; fr?: string }>(
  options: readonly T[],
  locale: Locale,
): (Omit<T, "fr"> & { label: string; fr?: string })[] {
  return options.map((o) =>
    locale === "fr" ? { ...o, label: o.fr ?? o.label, fr: undefined } : { ...o },
  );
}

/* ============================================================
   قيم مخزّنة بالعربية

   الألوان والتجهيزات محفوظين فقاعدة البيانات بنصّهم العربي —
   هو اللي كيدوز فالفلاتر وفالروابط. ماكنبدّلوش القيمة، كنترجمو
   غير اللي كيبان. أي قيمة ماشي فاللائحة (بائع كتب لون بيدّو)
   كتبان كما هي — أحسن من ما تختفي.
   ============================================================ */

const COLOR_FR: Record<string, string> = {
  "أبيض": "Blanc", "أسود": "Noir", "رمادي": "Gris", "فضي": "Argent",
  "أزرق": "Bleu", "أحمر": "Rouge", "بني": "Marron", "بيج": "Beige",
  "أخضر": "Vert", "ذهبي": "Doré",
};

const EQUIPMENT_FR: Record<string, string> = {
  "مكيف الهواء": "Climatisation",
  "نظام ABS": "ABS",
  "وسائد هوائية": "Airbags",
  "زجاج كهربائي": "Vitres électriques",
  "راديو Bluetooth": "Radio Bluetooth",
  "شاشة تعمل باللمس": "Écran tactile",
  "كاميرا الرجوع للخلف": "Caméra de recul",
  "حساسات ركن": "Radar de recul",
  "مثبت السرعة": "Régulateur de vitesse",
  "جنطات ألومنيوم": "Jantes alliage",
  "GPS": "GPS",
  "فتحة سقف": "Toit ouvrant",
  "مقاعد جلدية": "Sièges cuir",
  "أضواء LED": "Feux LED",
};

/** لون كما كيتعرض — القيمة المخزّنة كتبقى هي هي */
export const colorLabel = (value: string, locale: Locale) =>
  locale === "fr" ? COLOR_FR[value] ?? value : value;

/** تجهيز كما كيتعرض — القيمة المخزّنة كتبقى هي هي */
export const equipmentLabel = (value: string, locale: Locale) =>
  locale === "fr" ? EQUIPMENT_FR[value] ?? value : value;

/**
 * كيعوّض `{key}` داخل نص القاموس.
 *
 * أي مفتاح ماكاينش فـ`vars` كيتخلّى كما هو — أحسن من نص ناقص
 * بلا ما نعرفو علاش.
 */
export const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

/**
 * اسم البائع الافتراضي: "مستعمل طريق" هو placeholder فقاعدة البيانات
 * لحساب مازال ماكمّلش الملف الشخصي (`src/lib/auth.ts`). القيمة
 * المخزّنة تبقى عربية — هي sentinel كتقارَن بيه أماكن أخرى — هنا
 * كنبدّلو غير العرض حسب لغة الزائر.
 */
export const DEFAULT_SELLER_NAME = "مستعمل طريق";
export const sellerDisplayName = (name: string, locale: Locale) =>
  name === DEFAULT_SELLER_NAME
    ? (locale === "fr" ? "Utilisateur TRIQ" : DEFAULT_SELLER_NAME)
    : name;

/* ============================================================
   درجات الترويج (promo.ts)

   `PROMOS` بقات عربية — الداشبورد والإدارة كيقراوها مباشرة، وماشي
   دابا وقتهم. هنا كنعطيو نسخة مترجمة للسطوح العمومية (بطاقة
   المركبة، صفحة الترويج) بلا ما نمسّو المصدر الأصلي.
   ============================================================ */
import type { PromoTier } from "@/lib/promo";
import { PROMOS } from "@/lib/promo";
import type { Dictionary } from "./server";

export function promoLabel(tier: PromoTier, locale: Locale, t: Dictionary): string {
  return locale === "fr" ? t.promo[tier].label : PROMOS[tier].label;
}
export function promoBlurb(tier: PromoTier, locale: Locale, t: Dictionary): string {
  return locale === "fr" ? t.promo[tier].blurb : PROMOS[tier].blurb;
}
export function promoBenefits(tier: PromoTier, locale: Locale, t: Dictionary): string[] {
  return locale === "fr" ? t.promo[tier].benefits : PROMOS[tier].benefits;
}
