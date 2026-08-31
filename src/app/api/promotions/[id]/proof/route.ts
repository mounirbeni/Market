import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, fail, ok, unauthorized, writeFail } from "@/lib/api";
import { PRIVATE_PREFIX } from "@/lib/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ProofBody {
  proof?: string;
}

/**
 * كيلصق سكرين شوت وصل الأداء بطلب ترويج ديال صاحبو.
 *
 * السكرين شوت تّرفع قبل عبر /api/upload برأس x-purpose: doc — نفس
 * مسار وثائق التوثيق (خاص، غير المشرف كيقدر يشوفو).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const b = await body<ProofBody>(req);
  const mine = `${PRIVATE_PREFIX}${user.id}/`;
  const proof = b?.proof;
  if (!proof || !proof.startsWith(mine) || proof.includes("..")) {
    return fail("خاصك ترفع سكرين شوت صحيح.", 400);
  }

  try {
    const { attachPromotionProof } = await import("@/lib/db/writes");
    await attachPromotionProof(user.id, id, proof);
    return ok({ attached: true });
  } catch (e) {
    return writeFail(e);
  }
}
