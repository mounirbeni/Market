import { body, ok } from "@/lib/api";
import { findAll, findByIds } from "@/lib/source";
import { suggestFromRecent } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * «بناءً على اللي شفتي».
 *
 * المتصفح كيحتافظ بمعرّفات آخر المركبات اللي تشافو (فالتخزين
 * المحلي، ماكيتصيفطو لحتى حد آخر). هنا كنقراوهم من قاعدة البيانات
 * وكنقترحو من إعلانات حقيقية مشابهة.
 */
export async function POST(req: Request) {
  const b = await body<{ recent?: unknown; limit?: unknown }>(req);
  const recent = Array.isArray(b?.recent)
    ? b.recent.filter((x): x is string => typeof x === "string").slice(0, 12)
    : [];
  const limit = Math.max(1, Math.min(12, Number(b?.limit) || 4));

  if (recent.length < 2) return ok({ items: [] });

  const seen = await findByIds(recent);
  if (seen.length === 0) return ok({ items: [] });

  const kinds = new Set(seen.map((v) => v.kind));
  const pools = await Promise.all(
    [...kinds].map((kind) => findAll({ kind, sort: "recent" }, 120)),
  );

  return ok({ items: suggestFromRecent(recent, seen, pools.flat(), limit) });
}
