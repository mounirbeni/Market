"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseDarija } from "@/lib/darija";
import {
  hasArabic, KIND_LABEL, latinHint, modelsOfMake, suggest, topMakes,
  type Suggestion,
} from "@/lib/suggest";
import { applyFilters, paramsFromFilters, type Filters } from "@/lib/search";
import {
  ArrowLeft, Car, Close, Fuel, Info, MapPin, Search, Sparkle, Transmission,
} from "./icons";

const KIND_ICON = {
  make: Sparkle, model: Car, body: Car, fuel: Fuel, gearbox: Transmission, city: MapPin,
} as const;

/** أمثلة بالحروف اللاتينية — كيف ما كتبان فالبطاقة الرمادية */
const EXAMPLES = ["Dacia Logan", "Mercedes Classe C", "Golf 7 TDI", "Yamaha MT-07", "Diesel Casablanca"];

function toFilters(p: ReturnType<typeof parseDarija>): Partial<Filters> {
  return {
    kind: p.kind ?? "all",
    make: p.make ?? "", model: p.model ?? "", fuel: p.fuel ?? "",
    gearbox: p.gearbox ?? "", body: p.body ?? "", city: p.city ?? "",
    priceMin: p.priceMin, priceMax: p.priceMax,
    yearMin: p.yearMin, yearMax: p.yearMax, kmMax: p.kmMax,
    q: p.text ?? "",
  };
}

export function SmartSearch({ big = false }: { big?: boolean }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  /** الماركة المختارة — ملي تتختار كتبان الموديلات ديالها */
  const [pickedMake, setPickedMake] = useState<string | null>(null);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = "smart-search-list";

  const arabicTyped = hasArabic(value);

  const items = useMemo<Suggestion[]>(() => {
    if (pickedMake) return modelsOfMake(pickedMake);
    if (!value.trim()) return topMakes(6);
    if (arabicTyped) return latinHint(value);
    return suggest(value, 8);
  }, [value, pickedMake, arabicTyped]);

  const parsed = useMemo(() => parseDarija(value), [value]);
  const count = useMemo(
    () => (value.trim() && !arabicTyped ? applyFilters(toFilters(parsed)).length : null),
    [parsed, value, arabicTyped],
  );

  useEffect(() => setCursor(-1), [value, pickedMake]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function goFilters(f: Partial<Filters>) {
    setOpen(false);
    router.push(`/search?${paramsFromFilters(f).toString()}`);
  }

  function goText(query = value) {
    setOpen(false);
    router.push(`/search?${paramsFromFilters(toFilters(parseDarija(query))).toString()}`);
  }

  function choose(s: Suggestion) {
    // اختيار ماركة كيفتح الموديلات بدل ما يبحث مباشرة
    if (s.kind === "make" && !pickedMake) {
      setPickedMake(s.label);
      setValue(s.query + " ");
      inputRef.current?.focus();
      return;
    }
    setValue(s.query);
    goFilters(s.filters);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      if (pickedMake) { setPickedMake(null); setValue(""); }
      else setOpen(false);
      return;
    }
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => (c + 1) % items.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => (c <= 0 ? items.length - 1 : c - 1)); }
    else if (e.key === "Enter" && cursor >= 0) { e.preventDefault(); choose(items[cursor]); }
  }

  const active = open || value.length > 0;

  return (
    <div className="relative w-full" ref={boxRef}>
      <form onSubmit={(e) => { e.preventDefault(); cursor >= 0 ? choose(items[cursor]) : goText(); }}>
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
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              if (pickedMake && !e.target.value.startsWith(pickedMake)) setPickedMake(null);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            placeholder="Dacia Logan, Mercedes AMG, Golf TDI…"
            aria-label="البحث بالحروف اللاتينية"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={cursor >= 0 ? `${listId}-${cursor}` : undefined}
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            dir="auto"
            className={`min-w-0 flex-1 bg-transparent outline-none ${big ? "py-3 text-[15px]" : "py-2 text-sm"}`}
            style={{ color: "var(--text)" }}
          />
          {value && (
            <button
              type="button"
              onClick={() => { setValue(""); setPickedMake(null); inputRef.current?.focus(); }}
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

      {/* لائحة الاقتراحات */}
      {open && items.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="card-raised absolute inset-x-0 top-full z-50 mt-2 max-h-[62vh] overflow-y-auto p-1.5"
        >
          {arabicTyped && (
            <p
              className="mx-1 mb-1.5 flex items-start gap-2 rounded-lg p-2.5 text-[11.5px] leading-relaxed"
              style={{ background: "var(--warn-soft)", color: "var(--text-muted)" }}
            >
              <Info size={14} className="mt-px shrink-0" style={{ color: "var(--warn)" }} />
              <span>
                أسماء المركبات كتُكتب <b>بالحروف اللاتينية</b> كيف ما هي فالبطاقة الرمادية.
                هاذي المطابقة:
              </span>
            </p>
          )}

          {pickedMake && (
            <div className="mx-1 mb-1.5 flex items-center gap-2 px-1.5 py-1">
              <span className="chip" style={{ background: "var(--brand-soft)", color: "var(--brand)", borderColor: "transparent" }}>
                <bdi dir="ltr">{pickedMake}</bdi>
              </span>
              <span className="text-[11.5px]" style={{ color: "var(--text-dim)" }}>اختار الموديل</span>
              <button
                type="button"
                onClick={() => { setPickedMake(null); setValue(""); inputRef.current?.focus(); }}
                className="mr-auto text-[11px] underline"
                style={{ color: "var(--text-dim)" }}
              >
                بدّل الماركة
              </button>
            </div>
          )}

          {items.map((s, i) => {
            const Icon = KIND_ICON[s.kind];
            const on = i === cursor;
            return (
              <button
                key={`${s.kind}-${s.label}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={on}
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(s)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-colors"
                style={{ background: on ? "var(--surface-3)" : "transparent" }}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                  style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <bdi dir="ltr" className="block truncate text-[13.5px] font-bold">
                    {s.label}
                  </bdi>
                  {s.sub && (
                    <bdi className="block truncate text-[11px]" style={{ color: "var(--text-dim)" }}>
                      {s.sub}
                    </bdi>
                  )}
                </span>
                <span className="chip chip-plain shrink-0 text-[10px]">
                  {KIND_LABEL[s.kind]} · <span className="num">{s.count}</span>
                </span>
                {s.kind === "make" && !pickedMake && (
                  <ArrowLeft size={13} className="shrink-0" style={{ color: "var(--text-dim)" }} />
                )}
              </button>
            );
          })}

          {value.trim() && !arabicTyped && count !== null && (
            <button
              type="button"
              onClick={() => goText()}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-bold"
              style={{ color: "var(--brand)", background: "var(--brand-soft)" }}
            >
              <Search size={14} />
              بحث حر على «<bdi dir="ltr">{value}</bdi>»
              <span className="num mr-auto">{count}</span>
            </button>
          )}
        </div>
      )}

      {/* ملاحظة دائمة + أمثلة */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className="flex items-center gap-1 text-[11px] font-bold"
          style={{ color: "var(--brand)" }}
        >
          <Info size={12} /> بالحروف اللاتينية:
        </span>
        {EXAMPLES.slice(0, big ? 5 : 3).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => { setValue(ex); setPickedMake(null); goText(ex); }}
            className="chip transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            dir="ltr"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
