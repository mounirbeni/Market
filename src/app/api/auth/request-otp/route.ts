import { issueOtp, normalizeEmail } from "@/lib/auth";
import { body, dbMissing, fail, ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const down = dbMissing();
  if (down) return down;
  const b = await body<{ email?: string }>(req);
  const email = normalizeEmail(b?.email ?? "");
  if (!email) return fail("الإيميل ماشي صحيح. مثال: nom@example.com");

  const r = await issueOtp(email);
  if (!r.ok) return fail(r.error ?? "ماقدرناش نصيفطو الرمز.", 429);
  return ok({ email, devCode: r.devCode });
}
