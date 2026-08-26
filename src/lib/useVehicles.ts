"use client";

import { useEffect, useState } from "react";
import type { Vehicle } from "./types";

/**
 * كيجيب مركبات بمعرّفاتهم من الخادم — نفس الترتيب اللي دخل.
 *
 * المفضّلة، المقارنة و«آخر ما شفتي» كيخزّنو غير المعرّفات فالمتصفح، فهاد
 * الخطّاف هو اللي كيحوّلهم لمركبات حقيقية من قاعدة البيانات.
 */
export function useVehiclesByIds(ids: string[]) {
  const key = ids.join(",");
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(ids.length > 0);

  useEffect(() => {
    if (!key) {
      setItems([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetch(`/api/listings/by-ids?ids=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok) setItems(j.data.items as Vehicle[]);
      })
      .catch(() => {
        /* الشبكة قاطعة — كنخلّيو اللائحة اللي عندنا */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [key]);

  return { items, loading };
}
