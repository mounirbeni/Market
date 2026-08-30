"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/store/app";
import { useDict, useLocale } from "@/lib/i18n/client";
import { DIR } from "@/lib/i18n/config";
import { fmtPrice } from "@/lib/i18n/labels";
import { Check, ChevronDown } from "./icons";

export function Price({
  value,
  className,
  sign = false,
  tone = "brand",
}: {
  value: number;
  className?: string;
  sign?: boolean;
  /** brand = أزرق العلامة (افتراضي) · inherit = يرث لون النص */
  tone?: "brand" | "inherit";
}) {
  const { unit } = useApp();
  const locale = useLocale();
  const abs = Math.abs(value);
  const prefix = sign ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";
  const parts = fmtPrice(abs, unit, locale).split(" ");
  const suffix = parts.pop();
  return (
    <span
      className={className}
      style={{ direction: DIR[locale], color: tone === "brand" ? "var(--brand)" : undefined }}
    >
      <span className="num">{prefix}{parts.join(" ")}</span>
      <span className="ms-1.5 text-[0.7em] font-semibold opacity-60">{suffix}</span>
    </span>
  );
}

/** قائمة منسدلة ماشي زوج أزرار — باش ماكتاخدش حيّز زايد فالهيدر */
export function UnitToggle({
  compact = false,
  onNav = false,
  align = "end",
}: {
  compact?: boolean;
  onNav?: boolean;
  /**
   * جهة القائمة المنسدلة نسبة للزر — خاصها تكون فالجهة اللي فيها
   * حيّز. «end» (الافتراضي) ملي الزر قريب من حافة الشاشة البعيدة
   * (بحال الهيدر)، «start» ملي الزر قريب من حافة الشاشة القريبة
   * (بحال قائمة الهاتف) — بلاها القائمة كتخرج بره الشاشة.
   */
  align?: "start" | "end";
}) {
  const { unit, setUnit } = useApp();
  const t = useDict();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(u: "dh" | "million") {
    setOpen(false);
    setUnit(u);
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.price.unitLabel}
        className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition"
        style={{
          borderColor: onNav ? "var(--nav-line)" : "var(--line)",
          color: onNav ? "var(--nav-muted)" : "var(--text-muted)",
        }}
      >
        {unit === "dh" ? t.price.dh : compact ? t.price.million : t.price.millionLong}
        <ChevronDown size={12} style={{ opacity: 0.7 }} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute ${align === "start" ? "start-0" : "end-0"} top-[calc(100%+4px)] z-20 min-w-[130px] overflow-hidden rounded-lg border py-1 shadow-lg`}
          style={{ borderColor: "var(--line)", background: "var(--surface-1)" }}
        >
          {(["dh", "million"] as const).map((u) => {
            const on = unit === u;
            return (
              <li key={u}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => pick(u)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-start text-[12.5px] font-semibold transition hover:bg-[var(--surface-3)]"
                  style={{ color: on ? "var(--brand)" : "var(--text)" }}
                >
                  {u === "dh" ? t.price.dh : t.price.millionLong}
                  {on && <Check size={13} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
