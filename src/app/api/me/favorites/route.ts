import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, ok, unauthorized, writeFail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** المفضّلة ديال المستخدم اللي داخل */
export async function GET() {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { listFavorites } = await import("@/lib/db/writes");
  const rows = await listFavorites(user.id);
  return ok({
    favorites: rows.map((r) => r.ref),
    priceWatch: rows.filter((r) => r.price_watch).map((r) => r.ref),
  });
}

interface FavBody {
  ref?: string;
  on?: boolean;
  watch?: boolean;
}

/** حفظ/إزالة إعلان، ولا تشغيل مراقبة الثمن */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<FavBody>(req);
  if (!b?.ref) return writeFail(new Error("NOT_FOUND"));

  try {
    const w = await import("@/lib/db/writes");
    if (typeof b.watch === "boolean") await w.setPriceWatch(user.id, b.ref, b.watch);
    else if (b.on === false) await w.removeFavorite(user.id, b.ref);
    else await w.addFavorite(user.id, b.ref);
    return ok({ done: true });
  } catch (e) {
    return writeFail(e);
  }
}
