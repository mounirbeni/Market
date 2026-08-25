"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { parseDarija, SEARCH_EXAMPLES } from "@/lib/darija";
import { applyFilters, paramsFromFilters, type Filters } from "@/lib/search";
import { Close, Search, Sparkle } from "./icons";

function toFilters(p: ReturnType<typeof parseDarija>): Partial<Filters> {
  return {
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
  };
}

export function SmartSearch({ big = false }: { big?: boolean }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const parsed = useMemo(() => parseDarija(value), [value]);
  const count = useMemo(
    () => (value.trim() ? applyFilters(toFilters(parsed)).length : null),
    [parsed, value],
  );

  function go(query = value) {
    const sp = paramsFromFilters(toFilters(parseDarija(query)));
    router.push(`/vehicles?${sp.toString()}`);
  }

  const active = focused || value.length > 0;

  return (
    <div className="w-full">
      <form onSubmit={(e) => { e.preventDefault(); go(); }}>
        <div
          className="flex items-center gap-2 rounded-2xl border p-1.5 transition-all duration-300"
          style={{
            background: "var(--surface-1)",
            borderColor: active ? "var(--brand)" : "var(--line)",
            boxShadow: active
              ? "0 0 0 4px color-mix(in oklab, var(--brand) 11%, transparent), var(--shadow-md)"
              : "var(--shadow-sm)",
          }}
        >
          <Search
            size={big ? 20 : 18}
            className="mr-3 shrink-0"
            style={{ color: active ? "var(--brand)" : "var(--text-dim)" }}
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="قول لينا شنو كتقلّب عليه… كليو ديزل تحت 13 مليون فكازا"
            aria-label="البحث بالدارجة"
            className={`min-w-0 flex-1 bg-transparent outline-none ${big ? "py-3 text-[15px]" : "py-2 text-sm"}`}
            style={{ color: "var(--text)" }}
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              aria-label="مسح البحث"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition"
              style={{ color: "var(--text-dim)" }}
            >
              <Close size={15} />
            </button>
          )}
          <button type="submit" className={`btn btn-primary shrink-0 ${big ? "" : "btn-sm"}`}>
            بحث
          </button>
        </div>
      </form>

      {value.trim() ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs animate-fade">
          {parsed.chips.length > 0 ? (
            <>
              <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--brand)" }}>
                <Sparkle size={13} /> فهمت:
              </span>
              {parsed.chips.map((c, i) => (
                <span
                  key={i}
                  className="chip"
                  style={{ borderColor: "color-mix(in oklab, var(--brand) 35%, transparent)", color: "var(--brand)" }}
                >
                  <span className="opacity-55">{c.kind}</span> {c.label}
                </span>
              ))}
            </>
          ) : (
            <span style={{ color: "var(--text-dim)" }}>
              بحث حر على النص — زيد الماركة أو المدينة أو الثمن باش نفهم أكثر
            </span>
          )}
          {count !== null && (
            <span className="chip" style={{ borderColor: "transparent" }}>
              <span className="num font-bold" style={{ color: count ? "var(--good)" : "var(--bad)" }}>{count}</span>
              نتيجة
            </span>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--text-dim)" }}>جرّب:</span>
          {SEARCH_EXAMPLES.slice(0, big ? 5 : 3).map((ex) => (
            <button
              key={ex}
              onClick={() => { setValue(ex); go(ex); }}
              className="chip transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
