import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { body, ok } from "@/lib/api";
import { trackView } from "@/lib/source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * تسجيل مشاهدة إعلان.
 *
 * الزائر كيتعرف بتوقيع مجهول (IP + المتصفح) — قاعدة البيانات
 * كتحسب المشاهدة مرة وحدة لكل زائر فاليوم، فالتحديث المتكرر
 * ماكيرفعش العدّاد.
 */
export async function POST(req: Request) {
  const b = await body<{ ref?: string }>(req);
  if (!b?.ref) return ok({ done: false });

  const h = await headers();
  const fingerprint = createHash("sha256")
    .update(
      [
        h.get("x-forwarded-for") ?? "",
        h.get("user-agent") ?? "",
        new Date().toISOString().slice(0, 10),
      ].join("|"),
    )
    .digest("hex")
    .slice(0, 32);

  await trackView(b.ref, fingerprint);
  return ok({ done: true });
}
