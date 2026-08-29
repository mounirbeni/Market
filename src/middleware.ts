import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ============================================================
   كنمرّرو المسار الحالي فرأس — باش /dashboard/layout.tsx يقدر
   يبني رابط "next" الصحيح ملي يرجّع المستخدم لصفحة الدخول
   (Server Components ماعندهمش وصول مباشر لمسار الطلب بلا
   middleware).

   بلا هادشي كان مبني على "/dashboard" ثابت — أي رابط عميق
   (مثلاً /dashboard/listings/123/edit) كان كيرجّع المستخدم
   لواجهة القيادة العامة بعد الدخول، ماشي للصفحة اللي كان قاصدها.

   محدود بـ/dashboard فقط — ماكيلمسش باقي الموقع.
   ============================================================ */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
