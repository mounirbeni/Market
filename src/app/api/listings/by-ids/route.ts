import { findByIds } from "@/lib/source";
import { ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * مركبات بمعرّفاتها — /api/listings/by-ids?ids=c001,c002
 * كتخدم المفضّلة والمقارنة و«آخر ما شفتي» اللي معرّفاتهم مخزّنين فالمتصفح.
 */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("ids") ?? "";
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return ok({ items: await findByIds(ids) });
}
