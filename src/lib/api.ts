import { NextResponse } from "next/server";

/** ردود موحّدة — نفس الشكل فكل المسارات */
export const ok = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json({ ok: true, data }, init);

export const fail = (error: string, status = 400) =>
  NextResponse.json({ ok: false, error }, { status });

export const unauthorized = () => fail("خاصك تسجّل الدخول.", 401);
export const forbidden = () => fail("ماعندكش الصلاحية.", 403);

/** قراءة JSON بأمان */
export async function body<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/**
 * حارس قاعدة البيانات.
 * إلا DATABASE_URL ماشي مضبوط (مثلاً نشر على Vercel بلا متغير بيئة)،
 * كنرجعو رسالة واضحة بدل 500 صامت.
 */
export const dbMissing = () =>
  !process.env.DATABASE_URL
    ? fail("الخدمة ماشي مضبوطة: قاعدة البيانات غير متصلة. (DATABASE_URL)", 503)
    : null;

/** رسائل الأخطاء ديال طبقة الدردشة */
export const CHAT_ERRORS: Record<string, [string, number]> = {
  FORBIDDEN: ["ماعندكش الصلاحية على هاد المحادثة.", 403],
  NOT_FOUND: ["الإعلان ماكاينش.", 404],
  OWN_LISTING: ["ماتقدرش تراسل راسك على إعلانك.", 400],
  EMPTY: ["الرسالة خاوية.", 400],
  TOO_LONG: ["الرسالة طويلة بزاف.", 400],
  RATE_LIMIT: ["رسائل بزاف فوقت قصير. تسنّا شوية.", 429],
};
