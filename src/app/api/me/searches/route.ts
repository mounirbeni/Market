import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, ok, unauthorized, writeFail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** البحوث المحفوظة ديال المستخدم */
export async function GET() {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { listSearches } = await import("@/lib/db/writes");
  return ok({ items: await listSearches(user.id) });
}

interface SearchBody {
  label?: string;
  query?: string;
  id?: string;
  alert?: boolean;
}

/** حفظ بحث جديد ولا تبديل التنبيه */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<SearchBody>(req);
  try {
    const w = await import("@/lib/db/writes");
    if (b?.id && typeof b.alert === "boolean") {
      await w.setSearchAlert(user.id, b.id, b.alert);
      return ok({ done: true });
    }
    if (!b?.label) return writeFail(new Error("BAD_REASON"));
    const id = await w.addSearch(user.id, b.label, b.query ?? "");
    return ok({ id });
  } catch (e) {
    return writeFail(e);
  }
}

/** مسح بحث محفوظ */
export async function DELETE(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return writeFail(new Error("NOT_FOUND"));
  try {
    const { removeSearch } = await import("@/lib/db/writes");
    await removeSearch(user.id, id);
    return ok({ done: true });
  } catch (e) {
    return writeFail(e);
  }
}
