import { issueOtp, normalizePhone } from "@/lib/auth";
import { body, fail, ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await body<{ phone?: string }>(req);
  const phone = normalizePhone(b?.phone ?? "");
  if (!phone) return fail("رقم الهاتف ماشي صحيح. مثال: 0612345678");

  const r = await issueOtp(phone);
  if (!r.ok) return fail(r.error ?? "ماقدرناش نصيفطو الرمز.", 429);
  return ok({ phone, devCode: r.devCode });
}
