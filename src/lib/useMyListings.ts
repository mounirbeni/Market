"use client";

import { useEffect, useState } from "react";
import type { Vehicle } from "./types";

export interface MyListing extends Vehicle {
  status: string;
}

/** إعلانات المستخدم اللي داخل — من قاعدة البيانات */
export function useMyListings() {
  const [items, setItems] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/me/listings")
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok) setItems(j.data.items as MyListing[]);
      })
      .catch(() => {
        /* الشبكة قاطعة ولا ماشي داخل — كنخلّيوها خاوية */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading };
}
