import { getCatalog } from "@/lib/source";
import { ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** كتالوج الماركات/الموديلات — كيعمّر القوائم المنسدلة ديال البيع والتقييم */
export async function GET() {
  return ok({ items: await getCatalog() });
}
