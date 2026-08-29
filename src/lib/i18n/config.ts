/* ============================================================
   اللغات

   العربية (الدارجة) هي لغة المنصة الأصلية والافتراضية. الفرنسية
   لغة ثانوية — المغرب سوق ثنائي اللغة، وبزاف من المشترين كيقلّبو
   بالفرنسية.

   الاتجاه كيتبدّل مع اللغة: العربية RTL والفرنسية LTR. علاش
   التصميم خاصو يستعمل الخصائص المنطقية (ps/pe/ms/me/start/end)
   ماشي الفيزيائية (pl/pr/left/right) — بلاها التخطيط كينقلب
   غالط فالفرنسية.
   ============================================================ */

export const LOCALES = ["ar", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

/** لغة المنصة الأصلية — الزائر اللي ماعندو حتى تفضيل كيوصلها */
export const DEFAULT_LOCALE: Locale = "ar";

export const isLocale = (v: string): v is Locale =>
  (LOCALES as readonly string[]).includes(v);

/** اتجاه الكتابة لكل لغة */
export const DIR: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  fr: "ltr",
};

/** الاسم كما كيتسمّى بلغتو — بحال ما كيبان فمبدّل اللغة */
export const LOCALE_NAME: Record<Locale, string> = {
  ar: "العربية",
  fr: "Français",
};

/** وسم اللغة الكامل — لـ<html lang> وللتنسيق المحلي للتواريخ */
export const HTML_LANG: Record<Locale, string> = {
  ar: "ar-MA",
  fr: "fr-MA",
};

/** الكوكي اللي كيتذكّر اختيار الزائر — كيقراه proxy.ts */
export const LOCALE_COOKIE = "triq:lang";

/**
 * كيحيّد بادئة اللغة من مسار: "/fr/cars" → "/cars".
 * كيرجّع "/" ملي المسار هو اللغة وحدها.
 */
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (m && isLocale(m[1])) return m[2] || "/";
  return pathname;
}

/** كيبني مسار باللغة المطلوبة: ("/cars", "fr") → "/fr/cars" */
export function localePath(pathname: string, locale: Locale): string {
  const clean = stripLocale(pathname);
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
