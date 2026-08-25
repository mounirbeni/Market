import type { Vehicle } from "./types";

/** درجات ترويج الإعلان — مرتّبة من الأقوى للأضعف */
export type PromoTier = "top" | "urgent" | "featured";

export interface PromoMeta {
  tier: PromoTier;
  label: string;
  short: string;
  /** توضيح للبائع فصفحة الترويج */
  blurb: string;
  color: string;
  /** ثمن التفعيل بالدرهم */
  price: number;
  days: number;
  /** رفعة الترتيب فنتائج البحث */
  rankBoost: number;
  /** مضاعف المشاهدات المتوقع (للعرض فصفحة الترويج) */
  liftX: number;
  benefits: string[];
}

export const PROMOS: Record<PromoTier, PromoMeta> = {
  top: {
    tier: "top",
    label: "فأعلى اللائحة",
    short: "الأعلى",
    blurb: "إعلانك كيطلع فأول 3 نتائج فكل بحث كيطابق المركبة ديالك.",
    color: "var(--brand)",
    price: 199,
    days: 30,
    rankBoost: 60,
    liftX: 5.4,
    benefits: [
      "أول 3 نتائج فكل بحث مطابق",
      "إطار أزرق وشارة واضحة فالبطاقة",
      "ظهور فقسم «مركبات مميزة» فالصفحة الرئيسية",
      "إحصائيات مفصّلة: مشاهدات، حفظ، ضغطات على الرقم",
      "٣٠ يوم",
    ],
  },
  urgent: {
    tier: "urgent",
    label: "بيع مستعجل",
    short: "مستعجل",
    blurb: "بيّن للمشترين بلي بغيتي تبيع دغيا — كيزيد الاتصالات بزاف.",
    color: "var(--bad)",
    price: 99,
    days: 21,
    rankBoost: 28,
    liftX: 3.1,
    benefits: [
      "شارة حمراء «بيع مستعجل» فالبطاقة وفصفحة الإعلان",
      "أولوية فالترتيب على الإعلانات العادية",
      "فلتر خاص: المشترين اللي كيقلّبو على صفقة كيلقاوك",
      "٢١ يوم",
    ],
  },
  featured: {
    tier: "featured",
    label: "إعلان مميّز",
    short: "مميّز",
    blurb: "الأساسي: بطاقتك كتبان بشارة ذهبية وكتفرق على الباقي.",
    color: "var(--warn)",
    price: 49,
    days: 14,
    rankBoost: 12,
    liftX: 1.9,
    benefits: [
      "شارة «مميّز» فالبطاقة",
      "رفعة خفيفة فالترتيب",
      "١٤ يوم",
    ],
  },
};

export const PROMO_ORDER: PromoTier[] = ["top", "urgent", "featured"];

export const promoOf = (v: Vehicle): PromoMeta | null =>
  v.promo ? PROMOS[v.promo] : null;

export const promoRank = (v: Vehicle) => (v.promo ? PROMOS[v.promo].rankBoost : 0);
