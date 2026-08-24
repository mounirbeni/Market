"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  applyFilters,
  DEFAULT_FILTERS,
  filtersFromParams,
  paramsFromFilters,
  SORT_LABELS,
  type Filters,
  type SortKey,
} from "@/lib/search";
import { VehicleCard } from "@/components/VehicleCard";
import { FiltersPanel } from "./FiltersPanel";
import { SmartSearch } from "@/components/SmartSearch";
import { useApp } from "@/store/app";
import { cityName } from "@/lib/cities";
import { AR, formatNumber } from "@/lib/format";

const PAGE_SIZE = 12;

export function VehiclesClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const { saveSearch } = useApp();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [saved, setSaved] = useState(false);

  const filters = useMemo<Filters>(
    () => ({ ...DEFAULT_FILTERS, ...filtersFromParams(new URLSearchParams(sp.toString())) }),
    [sp],
  );

  const results = useMemo(() => applyFilters(filters), [filters]);

  const push = useCallback(
    (next: Filters) => {
      const qs = paramsFromFilters(next).toString();
      router.replace(qs ? `/vehicles?${qs}` : "/vehicles", { scroll: false });
      setVisible(PAGE_SIZE);
      setSaved(false);
    },
    [router],
  );

  const set = useCallback(
    (patch: Partial<Filters>) => push({ ...filters, ...patch }),
    [filters, push],
  );

  const reset = useCallback(() => push({ ...DEFAULT_FILTERS }), [push]);

  const activeChips = useMemo(() => {
    const out: { label: string; clear: Partial<Filters> }[] = [];
    if (filters.kind !== "all")
      out.push({ label: filters.kind === "car" ? "سيارات" : "دراجات", clear: { kind: "all" } });
    if (filters.make) out.push({ label: filters.make, clear: { make: "", model: "" } });
    if (filters.model) out.push({ label: filters.model, clear: { model: "" } });
    if (filters.city) out.push({ label: cityName(filters.city), clear: { city: "" } });
    if (filters.fuel) out.push({ label: AR.fuel[filters.fuel as keyof typeof AR.fuel], clear: { fuel: "" } });
    if (filters.gearbox)
      out.push({ label: AR.gearbox[filters.gearbox as keyof typeof AR.gearbox], clear: { gearbox: "" } });
    if (filters.body) out.push({ label: AR.body[filters.body as keyof typeof AR.body], clear: { body: "" } });
    if (filters.priceMax)
      out.push({ label: `حتى ${formatNumber(filters.priceMax)} د.م`, clear: { priceMax: undefined } });
    if (filters.priceMin)
      out.push({ label: `من ${formatNumber(filters.priceMin)} د.م`, clear: { priceMin: undefined } });
    if (filters.yearMin) out.push({ label: `من ${filters.yearMin}`, clear: { yearMin: undefined } });
    if (filters.yearMax) out.push({ label: `إلى ${filters.yearMax}`, clear: { yearMax: undefined } });
    if (filters.kmMax)
      out.push({ label: `أقل من ${formatNumber(filters.kmMax)} كم`, clear: { kmMax: undefined } });
    if (filters.trustMin) out.push({ label: `ثقة ${filters.trustMin}+`, clear: { trustMin: undefined } });
    if (filters.goodDealsOnly) out.push({ label: "صفقات فقط", clear: { goodDealsOnly: false } });
    if (filters.inspectedOnly) out.push({ label: "مفحوصة", clear: { inspectedOnly: false } });
    if (filters.verifiedOnly) out.push({ label: "وثائق موثقة", clear: { verifiedOnly: false } });
    if (filters.firstHandOnly) out.push({ label: "يد أولى", clear: { firstHandOnly: false } });
    if (filters.q) out.push({ label: `"${filters.q}"`, clear: { q: "" } });
    return out;
  }, [filters]);

  const title = useMemo(() => {
    const parts: string[] = [];
    parts.push(filters.kind === "moto" ? "دراجات نارية" : filters.kind === "car" ? "سيارات" : "مركبات");
    if (filters.make) parts.push(filters.make);
    if (filters.model) parts.push(filters.model);
    parts.push("مستعملة");
    if (filters.city) parts.push(`في ${cityName(filters.city)}`);
    return parts.join(" ");
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <SmartSearch />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <FiltersPanel filters={filters} set={set} reset={reset} count={results.length} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black">{title}</h1>
              <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
                <span className="num font-bold" style={{ color: "var(--accent)" }}>
                  {results.length}
                </span>{" "}
                نتيجة
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilters(true)}
                className="btn btn-ghost btn-sm lg:hidden"
              >
                تصفية
                {activeChips.length > 0 && (
                  <span className="num rounded-full px-1.5 text-[10px]"
                    style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                    {activeChips.length}
                  </span>
                )}
              </button>

              <select
                value={filters.sort}
                onChange={(e) => set({ sort: e.target.value as SortKey })}
                className="field !w-auto !py-2 text-xs"
                aria-label="الترتيب"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>{SORT_LABELS[k]}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  saveSearch({ label: title, query: paramsFromFilters(filters).toString(), alert: true });
                  setSaved(true);
                }}
                className="btn btn-ghost btn-sm"
                disabled={saved}
              >
                {saved ? "✓ تم الحفظ" : "🔔 احفظ البحث"}
              </button>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              {activeChips.map((c, i) => (
                <button
                  key={i}
                  onClick={() => set(c.clear)}
                  className="chip transition hover:border-[var(--color-clay-400)] hover:text-[var(--color-clay-400)]"
                >
                  {c.label} <span className="opacity-60">×</span>
                </button>
              ))}
              <button onClick={reset} className="text-[11px] underline" style={{ color: "var(--text-dim)" }}>
                مسح الكل
              </button>
            </div>
          )}

          {results.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl">🧭</p>
              <h2 className="mt-4 text-lg font-extrabold">ما لقينا حتى نتيجة</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
                جرّب توسّع المجال ديال الثمن، ولا تحيّد شي فلتر، ولا سجّل هاد البحث
                باش نعيطو ليك ملي تدخل شي مركبة مطابقة.
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <button onClick={reset} className="btn btn-ghost btn-sm">إعادة الضبط</button>
                <button
                  onClick={() => {
                    saveSearch({ label: title, query: paramsFromFilters(filters).toString(), alert: true });
                    setSaved(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  {saved ? "✓ تم تفعيل التنبيه" : "🔔 نبّهني"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.slice(0, visible).map((v) => (
                  <VehicleCard key={v.id} v={v} />
                ))}
              </div>
              {visible < results.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisible((n) => n + PAGE_SIZE)}
                    className="btn btn-ghost"
                  >
                    شوف المزيد (<span className="num">{results.length - visible}</span>)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFilters(false)}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto p-3"
            style={{ background: "var(--bg)" }}
          >
            <button
              onClick={() => setMobileFilters(false)}
              className="btn btn-primary btn-sm mb-3 w-full"
            >
              عرض <span className="num">{results.length}</span> نتيجة
            </button>
            <FiltersPanel filters={filters} set={set} reset={reset} count={results.length} />
          </div>
        </div>
      )}
    </div>
  );
}
