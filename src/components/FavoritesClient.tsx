"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/store/app";
import { vehicleById } from "@/lib/data/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { computeTco } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

export function FavoritesClient() {
  const { favorites, searches, removeSearch, ready } = useApp();

  const items = useMemo(
    () => favorites.map((id) => vehicleById(id)).filter(Boolean) as Vehicle[],
    [favorites],
  );

  const stats = useMemo(() => {
    if (!items.length) return null;
    const prices = items.map((v) => v.price);
    const tcos = items.map((v) =>
      computeTco(v, {
        kmPerYear: v.kind === "moto" ? 8000 : 15000,
        years: 3,
        coverage: "tiers",
        includeDepreciation: false,
      }).perYear,
    );
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      cheapestRun: Math.min(...tcos),
    };
  }, [items]);

  if (!ready) return null;

  return (
    <div className="space-y-12">
      <section>
        <h2 className="section-title mb-5">المفضلة</h2>

        {items.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl">🤍</p>
            <h3 className="mt-4 text-lg font-extrabold">ما زال ماحفظتي حتى مركبة</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
              كليكي على القلب فأي إعلان باش تلقاه هنا من بعد، وتقارن بيناتهم بسهولة.
            </p>
            <Link href="/vehicles" className="btn btn-primary mt-6">تصفح المركبات</Link>
          </div>
        ) : (
          <>
            {stats && (
              <div className="card mb-5 grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
                {[
                  { l: "عدد المحفوظات", v: String(items.length) },
                  { l: "الأرخص", v: `${formatNumber(stats.min)} د.م` },
                  { l: "المتوسط", v: `${formatNumber(stats.avg)} د.م` },
                  { l: "أقل تكلفة استعمال", v: `${formatNumber(stats.cheapestRun)} د.م/سنة` },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className="num text-sm font-black" style={{ color: "var(--accent)" }}>{s.v}</div>
                    <div className="mt-1 text-[10px]" style={{ color: "var(--text-dim)" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((v) => (
                <VehicleCard key={v.id} v={v} />
              ))}
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="section-title mb-2">البحوث المحفوظة</h2>
        <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
          البحوث اللي سجّلتي. فالنسخة الكاملة كتوصلك إشعارات ملي تدخل مركبة مطابقة.
        </p>

        {searches.length === 0 ? (
          <div className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            ماكاين حتى بحث محفوظ. من صفحة النتائج، كليكي على «🔔 احفظ البحث».
          </div>
        ) : (
          <ul className="space-y-2">
            {searches.map((s) => (
              <li key={s.id} className="card flex items-center justify-between gap-3 p-3">
                <Link
                  href={`/vehicles?${s.query}`}
                  className="min-w-0 flex-1 text-sm font-bold transition hover:text-[var(--accent)]"
                >
                  <span className="block truncate">{s.label}</span>
                  <span className="block truncate text-[11px] font-normal" style={{ color: "var(--text-dim)" }}>
                    {s.query || "بدون فلاتر"}
                  </span>
                </Link>
                {s.alert && (
                  <span className="chip !text-[var(--color-atlas-400)]">🔔 تنبيه مفعّل</span>
                )}
                <button
                  onClick={() => removeSearch(s.id)}
                  className="btn btn-ghost btn-sm"
                  aria-label={`حذف ${s.label}`}
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
