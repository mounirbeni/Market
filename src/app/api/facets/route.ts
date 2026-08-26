import { getFacets } from "@/lib/source";
import { DEFAULT_FILTERS, filtersFromParams } from "@/lib/search";
import { ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** عدّادات الفلاتر — نفس معاملات البحث، وكيرجع عدد كل خيار */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const filters = { ...DEFAULT_FILTERS, ...filtersFromParams(sp) };
  return ok(await getFacets(filters));
}
