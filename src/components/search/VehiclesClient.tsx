"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  applyFilters, DEFAULT_FILTERS, filtersFromParams, paramsFromFilters,
  SORT_LABELS, type Filters, type SortKey,
} from "@/lib/search";
import { VehicleCard, VehicleRow } from "@/components/VehicleCard";
import { FiltersPanel } from "./FiltersPanel";
import { SmartSearch } from "@/components/SmartSearch";
import { useApp } from "@/store/app";
import { cityName } from "@/lib/cities";
import { AR, formatNumber } from "@/lib/format";
import {
  ArrowUpDown, Bell, Check, Close, Filter, Grid, Rows, Search as SearchIcon, Sliders,
} from "@/components/icons";

const PAGE_SIZE = 12;

export function VehiclesClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const { saveSearch } = useApp();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

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

  const set = useCallback((patch: Partial<Filters>) => push({ ...filters, ...patch }), [filters, push]);
  const reset = useCallback(() => push({ ...DEFAULT_FILTERS }), [push]);

  const activeChips = useMemo(() => {
    const out: { label: string; clear: Partial<Filters> }[] = [];
    if (filters.kind !== "all") out.push({ label: filters.kind === "car" ? "سيارات" : "دراجات", clear: { kind: "all" } });
    if (filters.make) out.push({ label: filters.make, clear: { make: "", model: "" } });
    if (filters.model) out.push({ label: filters.model, clear: { model: "" } });
    if (filters.city) out.push({ label: cityName(filters.city), clear: { city: "" } });
    if (filters.fuel) out.push({ label: AR.fuel[filters.fuel as keyof typeof AR.fuel], clear: { fuel: "" } });
    if (filters.gearbox) out.push({ label: AR.gearbox[filters.gearbox as keyof typeof AR.gearbox], clear: { gearbox: "" } });
    if (filters.body) out.push({ label: AR.body[filters.body as keyof typeof AR.body], clear: { body: "" } });
    if (filters.priceMax) out.push({ label: `حتى ${formatNumber(filters.priceMax)} د.م`, clear: { priceMax: undefined } });
    if (filters.priceMin) out.push({ label: `من ${formatNumber(filters.priceMin)} د.م`, clear: { priceMin: undefined } });
    if (filters.yearMin) out.push({ label: `من ${filters.yearMin}`, clear: { yearMin: undefined } });
    if (filters.yearMax) out.push({ label: `إلى ${filters.yearMax}`, clear: { yearMax: undefined } });
    if (filters.kmMax) out.push({ label: `أقل من ${formatNumber(filters.kmMax)} كم`, clear: { kmMax: undefined } });
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

  const doSave = () => {
    saveSearch({ label: title, query: paramsFromFilters(filters).toString(), alert: true });
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-7">
      <div className="mb-6"><SmartSearch /></div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[84px] max-h-[calc(100vh-104px)] overflow-y-auto pl-1">
            <FiltersPanel filters={filters} set={set} reset={reset} count={results.length} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* شريط الأدوات */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
              <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
                <span className="num font-bold" style={{ color: "var(--brand)" }}>{results.length}</span> نتيجة
                {results.length > 0 && <> · مرتّبة حسب {SORT_LABELS[filters.sort]}</>}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setMobileFilters(true)} className="btn btn-solid btn-sm lg:hidden">
                <Filter size={14} /> تصفية
                {activeChips.length > 0 && (
                  <span
                    className="num rounded-full px-1.5 text-[9.5px]"
                    style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
                  >
                    {activeChips.length}
                  </span>
                )}
              </button>

              <div
                className="hidden items-center rounded-lg border p-0.5 sm:flex"
                style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}
              >
                {([["grid", Grid, "شبكة"], ["list", Rows, "قائمة"]] as const).map(([k, Icon, lbl]) => (
                  <button
                    key={k}
                    onClick={() => setView(k)}
                    aria-label={lbl}
                    aria-pressed={view === k}
                    className="grid h-7 w-7 place-items-center rounded-md transition"
                    style={{
                      background: view === k ? "var(--surface-1)" : "transparent",
                      color: view === k ? "var(--brand)" : "var(--text-dim)",
                    }}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>

              <div className="relative">
                <ArrowUpDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-dim)" }}
                />
                <select
                  value={filters.sort}
                  onChange={(e) => set({ sort: e.target.value as SortKey })}
                  className="field !w-auto !py-2 !pr-8 text-[12px] font-semibold"
                  aria-label="الترتيب"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                    <option key={k} value={k}>{SORT_LABELS[k]}</option>
                  ))}
                </select>
              </div>

              <button onClick={doSave} className="btn btn-solid btn-sm" disabled={saved}>
                {saved ? <><Check size={14} /> تم الحفظ</> : <><Bell size={14} /> احفظ البحث</>}
              </button>
            </div>
          </div>

          {/* الفلاتر النشطة */}
          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <Sliders size={14} style={{ color: "var(--text-dim)" }} />
              {activeChips.map((c, i) => (
                <button
                  key={i}
                  onClick={() => set(c.clear)}
                  className="chip transition hover:border-[var(--bad)] hover:text-[var(--bad)]"
                >
                  {c.label} <Close size={11} className="opacity-60" />
                </button>
              ))}
              <button onClick={reset} className="text-[11px] font-semibold underline" style={{ color: "var(--text-dim)" }}>
                مسح الكل
              </button>
            </div>
          )}

          {/* النتائج */}
          {results.length === 0 ? (
            <div className="card flex flex-col items-center p-12 text-center">
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl"
                style={{ background: "var(--surface-3)", color: "var(--text-dim)" }}
              >
                <SearchIcon size={26} />
              </span>
              <h2 className="mt-4 text-lg font-bold">ما لقينا حتى نتيجة</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                جرّب توسّع المجال ديال الثمن، ولا تحيّد شي فلتر، ولا سجّل هاد البحث باش
                نعيطو ليك ملي تدخل شي مركبة مطابقة.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button onClick={reset} className="btn btn-solid btn-sm">إعادة الضبط</button>
                <button onClick={doSave} className="btn btn-primary btn-sm">
                  {saved ? <><Check size={14} /> تم تفعيل التنبيه</> : <><Bell size={14} /> نبّهني</>}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={
                  view === "grid"
                    ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col gap-4"
                }
              >
                {results.slice(0, visible).map((v) =>
                  view === "grid" ? <VehicleCard key={v.id} v={v} /> : <VehicleRow key={v.id} v={v} />,
                )}
              </div>
              {visible < results.length && (
                <div className="mt-8 text-center">
                  <button onClick={() => setVisible((n) => n + PAGE_SIZE)} className="btn btn-solid">
                    شوف المزيد <span className="num opacity-60">({results.length - visible})</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* فلاتر الموبايل */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/65 animate-fade" onClick={() => setMobileFilters(false)} aria-hidden="true" />
          <div
            className="absolute inset-y-0 right-0 flex w-[90%] max-w-sm flex-col"
            style={{ background: "var(--bg)" }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "var(--line-soft)" }}
            >
              <h2 className="text-sm font-bold">تصفية النتائج</h2>
              <button onClick={() => setMobileFilters(false)} aria-label="إغلاق" className="grid h-8 w-8 place-items-center rounded-lg border" style={{ borderColor: "var(--line)" }}>
                <Close size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <FiltersPanel filters={filters} set={set} reset={reset} count={results.length} />
            </div>
            <div className="border-t p-3" style={{ borderColor: "var(--line-soft)" }}>
              <button onClick={() => setMobileFilters(false)} className="btn btn-primary w-full">
                عرض <span className="num">{results.length}</span> نتيجة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
