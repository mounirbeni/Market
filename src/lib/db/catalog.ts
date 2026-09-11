import { one } from "./client";

/* ============================================================
   توحيد أسماء الموديلات

   خانة الموديل مفتوحة: البائع كيكتب اللي بغى، حيت الموديلات
   ماكيسالوش وما يمكنش نحصروهم فقائمة.

   المشكل اللي كيجي معها: الثمن المرجعي كيقارن الموديل بمطابقة
   نص حرفية (market.ts — `c.model === target.model`). يعني
   «3 Series» و«3 series» و«Serie 3» و« 3 Series » غادي يوليو
   أربع موديلات مختلفين، وكل إعلان يولّي وحيد بلا مقارنات —
   والثمن المرجعي كيضعف بزاف.

   فالحل: كنخليو الكتابة حرة، وكنوحّدو عند الحفظ. إلا كان اللي
   كتب كيطابق شي موديل فالكتالوج (بلا حساسية حروف ولا فراغات
   زايدة)، كنسجّلو بالكتابة الرسمية ديال الكتالوج. وإلا كنسجّلو
   كما كتبو — بلا ما نمنعوه.
   ============================================================ */

/** تنظيف أساسي: بلا فراغات فالأطراف ولا فراغات مكرّرة فالوسط */
export const tidy = (s: string): string => s.trim().replace(/\s+/g, " ");

/**
 * الكتابة الرسمية للموديل من الكتالوج، ولا المدخل منظّف إلا
 * ماكانش. الفشل ماكيوقفش النشر — الموديل كيتسجّل كما كتبو صاحبو.
 */
export async function canonicalModel(
  kind: "car" | "moto",
  make: string,
  model: string,
): Promise<string> {
  const cleaned = tidy(model);
  if (!cleaned) return cleaned;
  try {
    const row = await one<{ model: string }>(
      `SELECT model FROM catalog_models
        WHERE kind = $1::vehicle_kind
          AND lower(make) = lower($2)
          AND lower(model) = lower($3)
        LIMIT 1`,
      [kind, tidy(make), cleaned],
    );
    return row?.model ?? cleaned;
  } catch {
    return cleaned;
  }
}

/** نفس المنطق للماركة */
export async function canonicalMake(
  kind: "car" | "moto",
  make: string,
): Promise<string> {
  const cleaned = tidy(make);
  if (!cleaned) return cleaned;
  try {
    const row = await one<{ make: string }>(
      `SELECT make FROM catalog_brands
        WHERE kind = $1::vehicle_kind AND lower(make) = lower($2) LIMIT 1`,
      [kind, cleaned],
    );
    return row?.make ?? cleaned;
  } catch {
    return cleaned;
  }
}
