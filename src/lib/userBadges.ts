import { Award, BadgeCheck, Phone, ShieldCheck, Star } from "@/components/icons";
import type { TrustLevel } from "./userTrust";

/* ============================================================
   شارات الحساب

   كل شارة مربوطة بمعطى حقيقي — عمرها ما كتنّبنى غير لأنّ الحساب
   تسجّل. «بائع موثوق» بالخصوص: توثيق هوية + مؤشر ثقة مرتفع، ماشي
   حساب جديد.
   ============================================================ */

export interface UserBadgeInput {
  idVerified: boolean;
  phoneVerified: boolean;
  type: "particulier" | "professionnel";
  dealerVerified: boolean;
  trustLevel: TrustLevel;
}

export interface UserBadge {
  key: string;
  label: string;
  Icon: typeof BadgeCheck;
  color: string;
}

export function userBadges(input: UserBadgeInput): UserBadge[] {
  const badges: UserBadge[] = [];

  if (input.idVerified) {
    badges.push({ key: "verified", label: "حساب موثق", Icon: ShieldCheck, color: "var(--good)" });
  }
  if (input.idVerified && input.trustLevel === "high") {
    badges.push({ key: "trusted", label: "بائع موثوق", Icon: Star, color: "var(--warn)" });
  }
  if (input.dealerVerified) {
    badges.push({ key: "company", label: "شركة موثقة", Icon: Award, color: "var(--brand)" });
  } else if (input.type === "professionnel") {
    badges.push({ key: "pro", label: "بائع محترف", Icon: BadgeCheck, color: "var(--data)" });
  }
  if (input.phoneVerified) {
    badges.push({ key: "phone", label: "رقم هاتف مؤكد", Icon: Phone, color: "var(--good)" });
  }

  return badges;
}
