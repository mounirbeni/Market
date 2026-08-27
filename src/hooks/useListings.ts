"use client";

import { useEffect, useRef, useState } from "react";
import { paramsFromFilters, type Filters } from "@/lib/search";
import type { Vehicle } from "@/lib/types";

/* ============================================================
   جلب الإعلانات من الخادم

   البحث كيوقع فـSQL. قبل كان المتصفح كيفلتر لائحة مرفقة مع
   الموقع — وهاديك كانت إعلانات مخترعة. دابا كل عدّاد وكل لائحة
   كتجي من قاعدة البيانات.
   ============================================================ */
export function useListings(filters: Partial<Filters> | null, limit = 8) {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const latest = useRef(0);
  const key = filters ? `${limit}|${paramsFromFilters(filters).toString()}` : "";

  useEffect(() => {
    if (!filters) {
      setItems([]);
      setTotal(null);
      return;
    }

    const ticket = ++latest.current;
    const ctrl = new AbortController();
    setLoading(true);

    // كنّسناو شوية: المستخدم كيكتب حرف بحرف
    const timer = setTimeout(() => {
      const qs = paramsFromFilters(filters);
      qs.set("limit", String(limit));
      fetch(`/api/listings?${qs.toString()}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((j) => {
          if (ticket !== latest.current) return;
          setItems(j?.ok ? (j.data.items as Vehicle[]) : []);
          setTotal(j?.ok ? Number(j.data.total) : 0);
          setLoading(false);
        })
        .catch(() => {
          if (ticket !== latest.current) return;
          setItems([]);
          setTotal(null);
          setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { items, total, loading };
}
