import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, ok, unauthorized, writeFail } from "@/lib/api";
import { PROMOS, type PromoTier } from "@/lib/promo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PromoBody {
  ref?: string;
  tier?: string;
}

/**
 * طلب ترويج إعلان.
 *
 * الثمن والمدة كيتّاخدو من جدول الأثمنة ديال الخادم — ماشي من
 * المتصفح — باش حتى واحد مايقدرش يبدّلهم فالطلب.
 */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<PromoBody>(req);
  const tier = b?.tier as PromoTier | undefined;
  if (!b?.ref || !tier || !(tier in PROMOS)) return writeFail(new Error("BAD_TIER"));

  const meta = PROMOS[tier];
  try {
    const { requestPromotion } = await import("@/lib/db/writes");
    const id = await requestPromotion(user.id, b.ref, tier, meta.price, meta.days);
    return ok({ id, amount: meta.price, days: meta.days });
  } catch (e) {
    return writeFail(e);
  }
}
