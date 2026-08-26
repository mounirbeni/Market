"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/store/app";
import { useVehiclesByIds } from "@/lib/useVehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { computeTco } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { Bell, Calculator, Car, Coins, Heart, Search, Trash, TrendingDown } from "@/components/icons";

export function FavoritesClient() {
  const { favorites, searches, removeSearch, ready, priceWatch, togglePriceWatch, isWatched } = useApp();

  /* التفاصيل كتجي من قاعدة البيانات — المتصفح كيخزّن غير المعرّفات */
  const { items } = useVehiclesByIds(favorites);

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
        <h2 className="h-section mb-5">المفضلة</h2>

        {items.length === 0 ? (
          <div className="card p-12 text-center">
            <span
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl"
              style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
            >
              <Heart size={30} />
            </span>
            <h3 className="mt-5 text-lg font-bold">ما زال ماحفظتي حتى مركبة</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
              كليكي على القلب فأي إعلان باش تلقاه هنا من بعد، وتقارن بيناتهم بسهولة.
            </p>
            <Link href="/vehicles" className="btn btn-primary mt-6"><Car size={16} /> تصفح المركبات</Link>
          </div>
        ) : (
          <>
            {stats && (
              <div className="card mb-5 grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
                {[
                  { l: "عدد المحفوظات", v: String(items.length), Icon: Heart },
                  { l: "الأرخص", v: `${formatNumber(stats.min)} د.م`, Icon: TrendingDown },
                  { l: "المتوسط", v: `${formatNumber(stats.avg)} د.م`, Icon: Coins },
                  { l: "أقل تكلفة استعمال", v: `${formatNumber(stats.cheapestRun)} د.م/سنة`, Icon: Calculator },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col items-center gap-1 text-center">
                    <s.Icon size={16} style={{ color: "var(--brand)" }} />
                    <div className="num text-sm font-extrabold" style={{ color: "var(--brand)" }}>{s.v}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-dim)" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            )}
            <div
              className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border p-4"
              style={{ borderColor: "var(--line-soft)", background: "var(--brand-soft)" }}
            >
              <Bell size={17} className="shrink-0" style={{ color: "var(--brand)" }} />
              <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <b style={{ color: "var(--brand)" }}>تنبيه انخفاض السعر:</b> فعّلو على أي مركبة
                وكيوصلك إشعار ملي البائع ينقّص الثمن.{" "}
                {priceWatch.length > 0 && (
                  <span className="num font-bold" style={{ color: "var(--brand)" }}>
                    {priceWatch.length} مفعّل
                  </span>
                )}
              </p>
              <button
                onClick={() => items.forEach((v) => { if (!isWatched(v.id)) togglePriceWatch(v.id); })}
                className="btn btn-solid btn-sm shrink-0"
              >
                فعّلو على الكل
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((v) => {
                const on = isWatched(v.id);
                return (
                  <div key={v.id} className="flex min-w-0 flex-col gap-2">
                    <VehicleCard v={v} />
                    <button
                      onClick={() => togglePriceWatch(v.id)}
                      aria-pressed={on}
                      className="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11.5px] font-bold transition-colors"
                      style={{
                        borderColor: on ? "transparent" : "var(--line)",
                        background: on ? "var(--brand-soft)" : "transparent",
                        color: on ? "var(--brand)" : "var(--text-dim)",
                      }}
                    >
                      <Bell size={13} />
                      {on ? "غادي نعلمك إلا نقص الثمن" : "نبّهني إلا نقص الثمن"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="h-section mb-2">البحوث المحفوظة</h2>
        <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
          البحوث اللي سجّلتي. فالنسخة الكاملة كتوصلك إشعارات ملي تدخل مركبة مطابقة.
        </p>

        {searches.length === 0 ? (
          <div className="card flex flex-col items-center p-10 text-center">
            <span
              className="grid h-12 w-12 place-items-center rounded-xl"
              style={{ background: "var(--surface-3)", color: "var(--text-dim)" }}
            >
              <Search size={22} />
            </span>
            <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
              ماكاين حتى بحث محفوظ. من صفحة النتائج، كليكي على «احفظ البحث».
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {searches.map((s) => (
              <li key={s.id} className="card flex items-center justify-between gap-3 p-3">
                <Link
                  href={`/vehicles?${s.query}`}
                  className="min-w-0 flex-1 text-sm font-bold transition hover:text-[var(--brand)]"
                >
                  <span className="block truncate">{s.label}</span>
                  <span className="block truncate text-[11px] font-normal" style={{ color: "var(--text-dim)" }}>
                    {s.query || "بدون فلاتر"}
                  </span>
                </Link>
                {s.alert && (
                  <span className="tag tag-good"><Bell size={11} /> تنبيه مفعّل</span>
                )}
                <button
                  onClick={() => removeSearch(s.id)}
                  className="btn btn-ghost btn-sm"
                  aria-label={`حذف ${s.label}`}
                >
                  <Trash size={13} /> حذف
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
