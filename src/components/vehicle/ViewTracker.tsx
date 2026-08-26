"use client";

import { useEffect } from "react";

/** كيسجّل مشاهدة الإعلان مرة وحدة ملي تتحل الصفحة */
export function ViewTracker({ listingRef }: { listingRef: string }) {
  useEffect(() => {
    fetch("/api/listings/view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ref: listingRef }),
    }).catch(() => {
      /* العدّاد ماشي حرج — كنتجاهلو الفشل */
    });
  }, [listingRef]);

  return null;
}
