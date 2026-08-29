/* ============================================================
   مؤشر ثقة الحساب

   ماشي نفس trustScore() ديال lib/market.ts — هاداك كيقيّم إعلان
   وحيد (الثمن، الوثائق، الصور...). هنا كنقيّمو الحساب كاملاً:
   شحال كمّل من الملف الشخصي، واش موثّق، واش نشيط، وواش الإعلانات
   ديالو نظيفة وبلا بلاغات. توثيق الهوية عامل واحد من بزاف، ماشي
   الوحيد — بحال ما تطلب.
   ============================================================ */

export type TrustLevel = "low" | "medium" | "high";

export interface UserTrustInput {
  onboarded: boolean;
  hasAvatar: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  idVerified: boolean;
  /** تاريخ إنشاء الحساب */
  memberSince: Date;
  activeListings: number;
  /** متوسط مؤشر ثقة الإعلانات النشيطة (0-100)، null إلا ماكانش عندو حتى واحد */
  avgListingTrust: number | null;
  /** بلاغات تّحسمات ضد إعلاناته */
  negativeReports: number;
}

export interface UserTrustPart {
  key: string;
  label: string;
  score: number;
  max: number;
  done: boolean;
  /** اقتراح ملموس لرفع النقطة — null إلا كانت مكتملة */
  action: string | null;
}

export interface UserTrustResult {
  score: number;
  level: TrustLevel;
  levelLabel: string;
  parts: UserTrustPart[];
}

const LEVEL_LABEL: Record<TrustLevel, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

function levelOf(score: number): TrustLevel {
  if (score >= 75) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function userTrustScore(input: UserTrustInput): UserTrustResult {
  const months = Math.max(
    0,
    (Date.now() - input.memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30),
  );

  const parts: UserTrustPart[] = [
    {
      key: "profile",
      label: "إكمال الملف الشخصي",
      score: (input.onboarded ? 15 : 0) + (input.hasAvatar ? 5 : 0),
      max: 20,
      done: input.onboarded && input.hasAvatar,
      action: !input.onboarded
        ? "كمّل معلومات حسابك الأساسية"
        : !input.hasAvatar
          ? "أضف صورة شخصية أو شعار النشاط"
          : null,
    },
    {
      key: "phone",
      label: "تأكيد رقم الهاتف",
      score: input.phoneVerified ? 15 : 0,
      max: 15,
      done: input.phoneVerified,
      action: input.phoneVerified ? null : "أكّد رقم الهاتف ديالك",
    },
    {
      key: "email",
      label: "تأكيد البريد الإلكتروني",
      score: input.emailVerified ? 10 : 0,
      max: 10,
      done: input.emailVerified,
      action: input.emailVerified ? null : "أكّد البريد الإلكتروني ديالك",
    },
    {
      key: "id",
      label: "توثيق الهوية",
      score: input.idVerified ? 25 : 0,
      max: 25,
      done: input.idVerified,
      action: input.idVerified ? null : "وثّق حسابك (اختياري) — كيرفع الثقة بزاف",
    },
    {
      key: "activity",
      label: "نشاط الحساب",
      score: Math.round(Math.min(10, (months / 12) * 10)),
      max: 10,
      done: months >= 12,
      action: months >= 12 ? null : "استمر فاستعمال حسابك — النقطة كتزيد مع الوقت",
    },
    {
      key: "listings",
      label: "جودة الإعلانات",
      score: input.avgListingTrust != null ? Math.round((input.avgListingTrust / 100) * 15) : 0,
      max: 15,
      done: input.avgListingTrust != null && input.avgListingTrust >= 70,
      action:
        input.avgListingTrust == null
          ? "انشر إعلاناً كاملاً بصور ووثائق"
          : input.avgListingTrust < 70
            ? "كمّل معلومات ووثائق إعلاناتك الحالية"
            : null,
    },
    {
      key: "reports",
      label: "بلا بلاغات مخالفة",
      score: Math.max(0, 5 - input.negativeReports * 2.5),
      max: 5,
      done: input.negativeReports === 0,
      action: input.negativeReports === 0 ? null : "حافظ على معلومات صحيحة ومتناسقة فإعلاناتك",
    },
  ];

  const score = Math.max(
    0,
    Math.min(100, Math.round(parts.reduce((s, p) => s + p.score, 0))),
  );
  const level = levelOf(score);

  return { score, level, levelLabel: LEVEL_LABEL[level], parts };
}
