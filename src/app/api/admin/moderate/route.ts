import { body, dbMissing, fail, forbidden, ok } from "@/lib/api";
import { getAdmin, logAdmin } from "@/lib/admin";
import { PROMOS, type PromoTier } from "@/lib/promo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * إجراءات الإشراف.
 * كلها كتحتاج جلسة إشراف — كوكي منفصل على كوكي المستخدمين.
 * وكل إجراء كيتسجّل فـadmin_log.
 */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;

  const admin = await getAdmin();
  if (!admin) return forbidden();

  const b = await body<Record<string, string>>(req);
  const action = b?.action ?? "";
  const m = await import("@/lib/db/moderation");

  const need = (k: string) => {
    const v = b?.[k];
    if (!v) throw new Error(`MISSING:${k}`);
    return v;
  };

  try {
    switch (action) {
      /* ---- الإعلانات ---- */
      case "listing:hide":
      case "listing:restore":
      case "listing:sold": {
        const ref = need("ref");
        const status =
          action === "listing:hide" ? "rejected" : action === "listing:sold" ? "sold" : "active";
        if (!(await m.setListingStatus(ref, status))) return fail("ماكاينش الإعلان.", 404);
        await logAdmin(admin.email, action, ref);
        break;
      }
      /* ---- الترويج ---- */
      case "promo:activate": {
        const id = need("promoId");
        if (!(await m.activatePromotion(id))) return fail("ماكاينش الطلب.", 404);
        await logAdmin(admin.email, action, id);
        break;
      }
      case "promo:cancel": {
        const id = need("promoId");
        if (!(await m.cancelPromotion(id))) return fail("ماكاينش الطلب.", 404);
        await logAdmin(admin.email, action, id);
        break;
      }
      case "promo:grant": {
        const ref = need("ref");
        const tier = need("tier");
        if (!(tier in PROMOS)) return fail("نوع الترويج ماشي معروف.", 400);
        const days = PROMOS[tier as PromoTier].days;
        if (!(await m.grantPromotion(ref, tier, days, admin.email)))
          return fail("ماكاينش الإعلان.", 404);
        await logAdmin(admin.email, action, ref, `${tier} · ${days} يوم`);
        break;
      }
      case "promo:clear": {
        const ref = need("ref");
        if (!(await m.setListingPromo(ref, null))) return fail("ماكاينش الإعلان.", 404);
        await logAdmin(admin.email, action, ref);
        break;
      }
      case "listing:delete": {
        const ref = need("ref");
        if (!(await m.deleteListing(ref))) return fail("ماكاينش الإعلان.", 404);
        await logAdmin(admin.email, action, ref);
        break;
      }

      /* ---- الحسابات ---- */
      case "user:ban":
      case "user:unban": {
        const id = need("userId");
        await m.setUserBanned(id, action === "user:ban");
        await logAdmin(admin.email, action, id);
        break;
      }
      case "user:verify":
      case "user:unverify": {
        const id = need("userId");
        await m.setUserVerified(id, action === "user:verify");
        await logAdmin(admin.email, action, id);
        break;
      }
      case "user:pro":
      case "user:private": {
        const id = need("userId");
        await m.setUserType(id, action === "user:pro");
        await logAdmin(admin.email, action, id);
        break;
      }

      /* ---- توثيق الهوية ---- */
      case "verif:approve":
      case "verif:reject": {
        const id = need("verifId");
        const approve = action === "verif:approve";
        if (!(await m.reviewVerification(id, approve, admin.email, b?.note)))
          return fail("ماكاينش الطلب.", 404);
        await logAdmin(admin.email, action, id, b?.note);
        break;
      }

      /* ---- المعارض ---- */
      case "dealer:verify":
      case "dealer:unverify": {
        const slug = need("slug");
        if (!(await m.setDealerVerified(slug, action === "dealer:verify")))
          return fail("ماكاينش المعرض.", 404);
        await logAdmin(admin.email, action, slug);
        break;
      }

      /* ---- التبليغات ---- */
      case "report:actioned":
      case "report:dismissed": {
        const id = need("reportId");
        await m.resolveReport(id, action === "report:actioned" ? "actioned" : "dismissed");
        await logAdmin(admin.email, action, id);
        break;
      }

      /* ---- الكتالوج ---- */
      case "catalog:add": {
        const kind = b?.kind === "moto" ? "moto" : "car";
        await m.addCatalogModel(kind, need("make"), need("model"));
        await logAdmin(admin.email, action, `${b?.make} ${b?.model}`);
        break;
      }
      case "catalog:remove": {
        const kind = b?.kind === "moto" ? "moto" : "car";
        await m.removeCatalogModel(kind, need("make"), need("model"));
        await logAdmin(admin.email, action, `${b?.make} ${b?.model}`);
        break;
      }

      default:
        return fail("إجراء ماشي معروف.", 400);
    }
    return ok({ done: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("MISSING:")) return fail("معطيات ناقصة.", 400);
    console.error("[admin] فشل الإجراء:", e);
    return fail("ماقدرناش نديرو هاد الإجراء.", 500);
  }
}
