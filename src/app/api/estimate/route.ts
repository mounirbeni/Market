import { body, ok } from "@/lib/api";
import { estimateFor } from "@/lib/source";
import type { EstimateInput } from "@/lib/market";
import type { Condition } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   الثمن المرجعي

   الحساب كيوقع فالخادم حيت المشابهات هي إعلانات حقيقية فقاعدة
   البيانات — المتصفح ماعندوش داكشي. قبل كان كيتحسب فالمتصفح من
   لائحة إعلانات مرفقة مع الموقع، وهاديك كانت بيانات مخترعة.
   ============================================================ */

const CONDITIONS: Condition[] = ["excellent", "tres-bon", "bon", "moyen"];
const num = (v: unknown, lo: number, hi: number, dflt: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : dflt;
};

export async function POST(req: Request) {
  const b = await body<Record<string, unknown>>(req);
  const kind = b?.kind === "moto" ? "moto" : "car";

  const target: EstimateInput = {
    kind,
    make: String(b?.make ?? "").slice(0, 60),
    model: b?.model ? String(b.model).slice(0, 60) : undefined,
    year: num(b?.year, 1980, 2030, 2018),
    km: num(b?.km, 0, 2_000_000, 100_000),
    fuel: b?.fuel ? String(b.fuel).slice(0, 20) : undefined,
    gearbox: b?.gearbox ? String(b.gearbox).slice(0, 20) : undefined,
    body: b?.body ? String(b.body).slice(0, 20) : undefined,
    condition: CONDITIONS.includes(b?.condition as Condition)
      ? (b?.condition as Condition)
      : undefined,
    power: b?.power ? num(b.power, 1, 5000, 6) : undefined,
  };

  if (!target.make) return ok({ low: 0, mid: 0, high: 0, confidence: 0, sampleSize: 0, comparables: [] });

  const estimate = await estimateFor(target, {
    excludeId: b?.excludeId ? String(b.excludeId).slice(0, 40) : undefined,
  });

  // البطاقات ديال المشابهات: غير اللي كتبان فالواجهة
  return ok({
    ...estimate,
    comparables: estimate.comparables.slice(0, 6).map((c) => ({
      id: c.id,
      make: c.make,
      model: c.model,
      year: c.year,
      km: c.km,
      price: c.price,
      kind: c.kind,
    })),
  });
}
