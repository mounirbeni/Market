import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES } from "@/lib/i18n/config";

/* ============================================================
   Proxy — كيدوز قبل ما تتّرندر أي صفحة.

   كيدير جوج حوايج:

   1) اللغة. كل المسارات تحت app/[lang]/، فأي طلب بلا بادئة لغة
      (/cars) خاصو يتحوّل لـ/ar/cars ولا /fr/cars. الترتيب:
      الكوكي (اختيار صريح ديال الزائر) → Accept-Language ديال
      المتصفح → العربية.

   2) المسار الحالي فرأس — /dashboard/layout.tsx كيحتاجو باش يبني
      رابط «next» الصحيح ملي يرجّع المستخدم لصفحة الدخول. بلاه أي
      رابط عميق كيرجّع للوحة العامة بدل الصفحة المقصودة.

   (كان سميتو middleware.ts — تسمية مهجورة فهاد النسخة.)
   ============================================================ */

/** لغة المتصفح إلا كانت مدعومة — «fr-FR,fr;q=0.9,ar;q=0.8» → fr */
function fromAcceptLanguage(header: string | null) {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split("=")[1]) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    // «fr-FR» كيطابق «fr»
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (!hasLocale) {
    const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
    const locale =
      (cookie && isLocale(cookie) && cookie) ||
      fromAcceptLanguage(req.headers.get("accept-language")) ||
      DEFAULT_LOCALE;

    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  /* كنتخطّاو: مسارات الواجهة البرمجية (ماعندهاش لغة)، ملفات Next
     الداخلية، وأي ملف عندو امتداد (صور، خطوط، robots.txt…). */
  matcher: ["/((?!api|_next|.*\\.).*)"],
};
