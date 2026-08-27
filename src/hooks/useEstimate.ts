"use client";

import { useEffect, useRef, useState } from "react";
import type { Estimate, EstimateInput } from "@/lib/market";

export const EMPTY_ESTIMATE: Estimate = {
  low: 0,
  mid: 0,
  high: 0,
  confidence: 0,
  sampleSize: 0,
  comparables: [],
};

/* ============================================================
   الثمن المرجعي — كيتحسب فالخادم

   المشابهات هي إعلانات حقيقية فقاعدة البيانات، والمتصفح ماعندوش
   داكشي. قبل كان الحساب كيوقع هنا من لائحة مرفقة مع الموقع —
   وهاديك كانت بيانات مخترعة.

   كنّسناو 400 ملّي قبل ما نصيفطو: المستخدم كيحرّك السنة ولا
   الكيلومتراج بسرعة، وماكاين علاش نصيفطو طلب فكل حركة.
   ============================================================ */
export function useEstimate(target: EstimateInput | null, excludeId?: string) {
  const [estimate, setEstimate] = useState<Estimate>(EMPTY_ESTIMATE);
  const [loading, setLoading] = useState(false);
  const key = target ? JSON.stringify([target, excludeId]) : "";
  const latest = useRef(0);

  useEffect(() => {
    if (!target || !target.make) {
      setEstimate(EMPTY_ESTIMATE);
      return;
    }

    const ticket = ++latest.current;
    const ctrl = new AbortController();
    setLoading(true);

    const timer = setTimeout(() => {
      fetch("/api/estimate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...target, excludeId }),
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((j) => {
          // ردّ قديم وصل من بعد واحد جديد — كنتجاهلوه
          if (ticket !== latest.current) return;
          setEstimate(j?.ok ? (j.data as Estimate) : EMPTY_ESTIMATE);
          setLoading(false);
        })
        .catch(() => {
          if (ticket !== latest.current) return;
          setEstimate(EMPTY_ESTIMATE);
          setLoading(false);
        });
    }, 400);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { estimate, loading };
}
