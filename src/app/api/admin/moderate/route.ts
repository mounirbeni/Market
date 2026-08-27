import { body, dbMissing, fail, forbidden, ok } from "@/lib/api";
import { getAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** إجراءات الإشراف — كلها كتحتاج حساب فـADMIN_EMAILS */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;

  const admin = await getAdmin();
  if (!admin) return forbidden();

  const b = await body<{ action?: string; ref?: string; userId?: string; reportId?: string }>(req);
  const mod = await import("@/lib/db/moderation");

  try {
    switch (b?.action) {
      case "hide":
      case "restore": {
        if (!b.ref) return fail("ماكاينش الإعلان.", 400);
        const done = await mod.setListingStatus(b.ref, b.action === "hide" ? "rejected" : "active");
        if (!done) return fail("ماكاينش الإعلان.", 404);
        break;
      }
      case "ban":
      case "unban": {
        if (!b.userId) return fail("ماكاينش الحساب.", 400);
        // حماية: المشرف ماقدرش يحضر راسو بالغلط
        if (b.userId === admin.id) return fail("ماتقدرش تحضر راسك.", 400);
        await mod.setUserBanned(b.userId, b.action === "ban");
        break;
      }
      case "actioned":
      case "dismissed": {
        if (!b.reportId) return fail("ماكاينش التبليغ.", 400);
        await mod.resolveReport(b.reportId, admin.id, b.action);
        break;
      }
      default:
        return fail("إجراء ماشي معروف.", 400);
    }
    return ok({ done: true });
  } catch (e) {
    console.error("[admin] فشل الإجراء:", e);
    return fail("ماقدرناش نديرو هاد الإجراء.", 500);
  }
}
