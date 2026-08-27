import { body, dbMissing, fail, ok } from "@/lib/api";
import { adminConfigured, adminLogout, finishAdminLogin, startAdminLogin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** دخول الإشراف: خطوة كلمة السر، من بعد خطوة الرمز */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  if (!adminConfigured()) return fail("الإشراف ماشي مضبوط.", 503);

  const b = await body<{ step?: string; email?: string; password?: string; code?: string }>(req);
  const email = String(b?.email ?? "").slice(0, 200);
  const ua = req.headers.get("user-agent") ?? undefined;

  const r =
    b?.step === "code"
      ? await finishAdminLogin(email, String(b?.code ?? "").slice(0, 12), ua)
      : await startAdminLogin(email, String(b?.password ?? "").slice(0, 200));

  if (!r.ok) return fail(r.error ?? "ماقدرناش.", 401);
  return ok({ step: b?.step === "code" ? "done" : "code", devCode: r.devCode });
}

export async function DELETE() {
  await adminLogout();
  return ok({ done: true });
}
