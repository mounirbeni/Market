import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, fail, ok, unauthorized } from "@/lib/api";
import { PRIVATE_PREFIX } from "@/lib/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** حالة التوثيق ديال المستخدم */
export async function GET() {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { one } = await import("@/lib/db/client");
  const row = await one<{ kind: string; status: string; note: string | null; created_at: string }>(
    `SELECT kind::text, status::text, note, created_at FROM verifications
      WHERE user_id = $1::uuid ORDER BY created_at DESC LIMIT 1`,
    [user.id],
  );
  return ok({ verified: user.id_verified, request: row });
}

/**
 * طلب توثيق.
 *
 * الوثيقة تّرفعات قبل عبر /api/upload برأس x-purpose: doc، وكنقبلو
 * غير المسارات اللي تحت private/<المعرّف ديالو> — بلا هاد الفحص
 * شي واحد يقدر يعطينا مسار ديال واحد آخر.
 */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<{ kind?: string; doc?: string; back?: string }>(req);
  const kind = b?.kind === "registre" ? "registre" : "cin";
  const mine = `${PRIVATE_PREFIX}${user.id}/`;
  const check = (p?: string) => (p && p.startsWith(mine) && !p.includes("..") ? p : null);

  const doc = check(b?.doc);
  if (!doc) return fail("خاصك ترفع الوثيقة.", 400);
  const back = check(b?.back);

  const { sql, one } = await import("@/lib/db/client");

  const open = await one<{ id: string }>(
    "SELECT id FROM verifications WHERE user_id = $1::uuid AND status = 'pending'",
    [user.id],
  );
  if (open) return fail("عندك طلب فانتظار المراجعة.", 409);

  await sql(
    `INSERT INTO verifications (user_id, kind, doc_path, doc_back_path)
     VALUES ($1::uuid, $2::verification_kind, $3, $4)`,
    [user.id, kind, doc, back],
  );
  return ok({ status: "pending" });
}
