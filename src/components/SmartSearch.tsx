"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { parseDarija, SEARCH_EXAMPLES } from "@/lib/darija";
import { applyFilters, paramsFromFilters } from "@/lib/search";

export function SmartSearch({ big = false }: { big?: boolean }) {
  const [value, setValue] = useState("");
  const router = useRouter();

  const parsed = useMemo(() => parseDarija(value), [value]);

  const count = useMemo(() => {
    if (!value.trim()) return null;
    return applyFilters({
      kind: parsed.kind ?? "all",
      make: parsed.make ?? "",
      model: parsed.model ?? "",
      fuel: parsed.fuel ?? "",
      gearbox: parsed.gearbox ?? "",
      body: parsed.body ?? "",
      city: parsed.city ?? "",
      priceMin: parsed.priceMin,
      priceMax: parsed.priceMax,
      yearMin: parsed.yearMin,
      yearMax: parsed.yearMax,
      kmMax: parsed.kmMax,
      q: parsed.text ?? "",
    }).length;
  }, [parsed, value]);

  function go(query = value) {
    const p = parseDarija(query);
    const sp = paramsFromFilters({
      kind: p.kind ?? "all",
      make: p.make ?? "",
      model: p.model ?? "",
      fuel: p.fuel ?? "",
      gearbox: p.gearbox ?? "",
      body: p.body ?? "",
      city: p.city ?? "",
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      yearMin: p.yearMin,
      yearMax: p.yearMax,
      kmMax: p.kmMax,
      q: p.text ?? "",
    });
    router.push(`/vehicles?${sp.toString()}`);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="relative"
      >
        <div
          className="flex items-center gap-2 rounded-2xl border p-2 transition-all"
          style={{
            background: "var(--bg-card)",
            borderColor: value ? "var(--accent)" : "var(--line)",
            boxShadow: value ? "0 0 0 4px color-mix(in oklab, var(--accent) 12%, transparent)" : "none",
          }}
        >
          <span className="shrink-0 pr-3 text-xl" aria-hidden="true">🔎</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="قول لينا شنو كتقلّب عليه… مثلاً: كليو ديزل تحت 12 مليون فكازا"
            aria-label="البحث بالدارجة"
            className={`min-w-0 flex-1 bg-transparent outline-none ${big ? "py-3 text-base" : "py-2 text-sm"}`}
            style={{ color: "var(--text)" }}
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              aria-label="مسح"
              className="px-2 text-lg opacity-50 hover:opacity-100"
            >
              ×
            </button>
          )}
          <button type="submit" className={`btn btn-primary shrink-0 ${big ? "" : "btn-sm"}`}>
            بحث
          </button>
        </div>
      </form>

      {value.trim() ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs animate-rise">
          {parsed.chips.length > 0 ? (
            <>
              <span style={{ color: "var(--text-dim)" }}>فهمت:</span>
              {parsed.chips.map((c, i) => (
                <span
                  key={i}
                  className="chip !border-[color-mix(in_oklab,var(--accent)_45%,transparent)] !text-[var(--accent)]"
                >
                  <span className="opacity-60">{c.kind}:</span> {c.label}
                </span>
              ))}
            </>
          ) : (
            <span style={{ color: "var(--text-dim)" }}>
              بحث حر على النص — جرّب تزيد الماركة أو المدينة أو الثمن
            </span>
          )}
          {count !== null && (
            <span className="chip !border-transparent" style={{ background: "var(--bg-inset)" }}>
              <span className="num font-bold" style={{ color: "var(--color-atlas-400)" }}>{count}</span> نتيجة
            </span>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-dim)" }}>جرّب:</span>
          {SEARCH_EXAMPLES.slice(0, big ? 6 : 3).map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setValue(ex);
                go(ex);
              }}
              className="chip transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
