import { createSession, normalizePhone, upsertUserByPhone, verifyOtp } from "@/lib/auth";
import { body, dbMissing, fail, ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const down = dbMissing();
  if (down) return down;
  const b = await body<{ phone?: string; code?: string; name?: string }>(req);
  const phone = normalizePhone(b?.phone ?? "");
  const code = (b?.code ?? "").replace(/\D/g, "");
  if (!phone) return fail("رقم الهاتف ماشي صحيح.");
  if (code.length !== 6) return fail("الرمز خاصو يكون 6 أرقام.");

  const check = await verifyOtp(phone, code);
  if (!check.ok) return fail(check.error ?? "الرمز ماشي صحيح.", 401);

  const userId = await upsertUserByPhone(phone, b?.name);
  await createSession(userId, req.headers.get("user-agent") ?? undefined);
  return ok({ userId });
}
