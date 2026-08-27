import type { Seller } from "./types";

/* ============================================================
   المعارض

   كانت لائحة ديال 9 معارض مخترعين مرفقة مع الموقع — أسماء
   وعناوين وساعات عمل ديال محلات ماكايناش. تحيّدات: المعارض
   كيجيو من جدول `dealers` فقاعدة البيانات، والصفحة كتبيّن حالة
   فارغة حتى يتسجّل أول معرض حقيقي.
   ============================================================ */

export interface Dealer extends Seller {
  slug: string;
  tagline: string;
  about: string;
  address: string;
  hours: string;
  verified: boolean;
  brands: string[];
  /** لونين للخلفية ديال البطاقة */
  cover: [string, string];
  /** رقم صاحب المعرض — كيبان غير ملي يضغط الزائر */
  phone: string | null;
}

export const DEFAULT_COVER: [string, string] = ["#0d2a55", "#1f5fe0"];
