/** تنسيق الأرقام والأسعار حسب العادة المغربية */

/** فصل الآلاف بمسافة عادية — أوضح من النقطة في السياق العربي */
export function formatNumber(n: number): string {
  const r = Math.round(n);
  const sign = r < 0 ? "-" : "";
  return sign + String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** بالدرهم: 128 000 */
export function formatDh(n: number): string {
  return `${formatNumber(n)} د.م`;
}

/**
 * بالمليون (سنتيم) كما يتكلم المغاربة: 128 000 درهم = 12,8 مليون
 * 1 مليون سنتيم = 10 000 درهم
 */
export function formatMillion(n: number): string {
  const m = n / 10000;
  const txt =
    m >= 100 ? formatNumber(m) : m.toFixed(m % 1 === 0 ? 0 : 1).replace(".", ",");
  return `${txt} مليون`;
}

export type Unit = "dh" | "million";

export function formatPrice(n: number, unit: Unit): string {
  return unit === "million" ? formatMillion(n) : formatDh(n);
}

export function formatKm(n: number): string {
  return `${formatNumber(n)} كم`;
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return String(n);
}

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو",
  "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر",
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return `${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "منذ 3 أيام" */
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins <= 1 ? "دقيقة" : `${mins} دقيقة`}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours === 1 ? "ساعة" : hours === 2 ? "ساعتين" : `${hours} ساعات`}`;
  const days = Math.floor(hours / 24);
  if (days < 30)
    return `منذ ${days === 1 ? "يوم" : days === 2 ? "يومين" : `${days} أيام`}`;
  const months = Math.floor(days / 30);
  return `منذ ${months === 1 ? "شهر" : months === 2 ? "شهرين" : `${months} أشهر`}`;
}

export const AR = {
  fuel: {
    diesel: "ديزل",
    essence: "بنزين",
    hybride: "هجين",
    electrique: "كهربائي",
  } as const,
  gearbox: { manuelle: "يدوية", automatique: "أوتوماتيك" } as const,
  body: {
    citadine: "مدينية",
    berline: "صالون",
    suv: "دفع رباعي",
    break: "بريك",
    utilitaire: "نفعية",
    cabriolet: "مكشوفة",
    scooter: "سكوتر",
    roadster: "رودستر",
    trail: "طرق وعرة",
    sportive: "رياضية",
    custom: "كوستوم",
  } as const,
  condition: {
    excellent: "ممتازة",
    "tres-bon": "جيدة جداً",
    bon: "جيدة",
    moyen: "متوسطة",
  } as const,
  seller: { particulier: "خاص", professionnel: "محترف" } as const,
  kind: { car: "سيارة", moto: "دراجة نارية" } as const,
};
