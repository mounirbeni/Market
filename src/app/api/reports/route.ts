import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, ok, writeFail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReportBody {
  ref?: string;
  reason?: string;
  note?: string;
}

/**
 * التبليغ عن إعلان.
 * التسجيل ماشي واجب — النصب خاصو يتبلّغ حتى من ناس ماشي داخلين.
 */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;

  const b = await body<ReportBody>(req);
  if (!b?.ref || !b.reason) return writeFail(new Error("BAD_REASON"));

  const user = await getCurrentUser();
  try {
    const { reportListing } = await import("@/lib/db/writes");
    await reportListing(user?.id ?? null, b.ref, b.reason, b.note ?? "");
    return ok({ done: true });
  } catch (e) {
    return writeFail(e);
  }
}
