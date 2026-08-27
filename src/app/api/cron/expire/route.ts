import { fail, ok } from "@/lib/api";
import { expirePromotions } from "@/lib/db/moderation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   انتهاء الترويجات — كيتّنادى كل يوم

   Vercel Cron كيصيفط رأس `authorization: Bearer <CRON_SECRET>`.
   بلا السرّ المسار مسدود: بلاه أي واحد يقدر ينادي عليه (ماشي
   خطير بزاف، ولكن ماكاين علاش نخلّيوه محلول).

   المهمة idempotent: تناديها 100 مرة ولا مرة، النتيجة وحدة.
   ============================================================ */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) return fail("ماعندكش الصلاحية.", 403);
  }

  if (!process.env.DATABASE_URL) return fail("قاعدة البيانات ماشي موصولة.", 503);

  try {
    const expired = await expirePromotions();
    if (expired > 0) console.log(`[cron] ${expired} ترويج تسالى`);
    return ok({ expired });
  } catch (e) {
    console.error("[cron] فشل انتهاء الترويجات:", e);
    return fail("فشل.", 500);
  }
}
