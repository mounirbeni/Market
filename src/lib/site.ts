/* ============================================================
   نطاق الموقع — مصدر واحد

   كان مكتوب بيدو ف4 بلايص (layout, sitemap, robots, mail)، وملي
   تبدّل النطاق من .com لـ.ma كان خاص تبديل كل وحدة على حدة —
   ونسيان وحدة معناها روابط كتوجّه لنطاق ماشي ديالنا: sitemap
   كيصرّح بروابط ماكايناش، وأزرار الإيميل كتحيّد المستعمل برّا.

   NEXT_PUBLIC_SITE_URL كتغلب — مفيدة للتجريب على نطاق مؤقت ديال
   Vercel بلا ما نبدّلو الكود.
   ============================================================ */

const DEFAULT_SITE_URL = "https://tariqmaroc.ma";

/** جذر الموقع بلا شرطة مائلة فالآخر: "https://tariqmaroc.ma" */
export const siteUrl = (): string =>
  (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

/** رابط مطلق من مسار داخلي: "/messages" → "https://tariqmaroc.ma/messages" */
export const absoluteUrl = (path: string): string =>
  `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
