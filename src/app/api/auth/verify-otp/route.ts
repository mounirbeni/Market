import { createSession, normalizeEmail, upsertUserByEmail, verifyOtp } from "@/lib/auth";
import { body, dbMissing, fail, ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const down = dbMissing();
  if (down) return down;
  const b = await body<{ email?: string; code?: string; name?: string }>(req);
  const email = normalizeEmail(b?.email ?? "");
  const code = (b?.code ?? "").replace(/\D/g, "");
  if (!email) return fail("الإيميل ماشي صحيح.", 400, "BAD_EMAIL");
  if (code.length !== 6) return fail("الرمز خاصو يكون 6 أرقام.", 400, "BAD_CODE_LENGTH");

  const check = await verifyOtp(email, code);
  if (!check.ok) return fail(check.error ?? "الرمز ماشي صحيح.", 401, check.code);

  const userId = await upsertUserByEmail(email, b?.name);
  await createSession(userId, req.headers.get("user-agent") ?? undefined);
  return ok({ userId });
}
