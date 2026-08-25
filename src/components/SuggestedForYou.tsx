"use client";

import { useMemo } from "react";
import { useApp } from "@/store/app";
import { suggestFromRecent } from "@/lib/search";
import { VehicleCard } from "@/components/VehicleCard";
import { Sparkle } from "@/components/icons";

/**
 * «بناءً على اللي شفتي» — كتبان غير ملي يكون عند المستخدم تاريخ تصفح.
 * كترجع null قبل الترطيب باش ماكاينش اختلاف بين الخادم والمتصفح.
 */
export function SuggestedForYou({ limit = 4 }: { limit?: number }) {
  const { recent, ready } = useApp();
  const items = useMemo(() => suggestFromRecent(recent, limit), [recent, limit]);

  if (!ready || recent.length < 2 || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16">
      <header className="mb-7">
        <span className="eyebrow"><Sparkle size={13} /> مخصّص ليك</span>
        <h2 className="h-section mt-3">بناءً على اللي شفتي</h2>
        <p className="mt-2 max-w-xl text-sm" style={{ color: "var(--text-muted)" }}>
          مقترحة من الماركات، أنواع الهياكل والأثمنة اللي كتصفّحتي فيها. ماكنشاركو
          هاد المعطيات مع حتى حد — كتبقى فالمتصفح ديالك.
        </p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((v) => (
          <VehicleCard key={v.id} v={v} compact />
        ))}
      </div>
    </section>
  );
}
