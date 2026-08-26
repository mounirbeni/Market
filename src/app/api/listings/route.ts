import { findVehicles } from "@/lib/source";
import { DEFAULT_FILTERS, filtersFromParams } from "@/lib/search";
import { ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * بحث الإعلانات — نفس معاملات الـURL ديال صفحات النتائج.
 *   /api/listings?kind=car&make=Dacia&limit=24&offset=0
 *
 * كيقرا من قاعدة البيانات ملي تكون موصولة، وإلا من البيانات المرفقة.
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const filters = { ...DEFAULT_FILTERS, ...filtersFromParams(sp) };

  const num = (key: string, fallback: number) => {
    const n = Number(sp.get(key));
    return Number.isFinite(n) ? n : fallback;
  };
  const limit = Math.min(200, Math.max(1, Math.trunc(num("limit", 24))));
  const offset = Math.max(0, Math.trunc(num("offset", 0)));

  const { items, total } = await findVehicles(filters, { limit, offset });
  return ok({ items, total });
}
