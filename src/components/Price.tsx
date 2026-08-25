"use client";

import { formatPrice } from "@/lib/format";
import { useApp } from "@/store/app";

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
  const abs = Math.abs(value);
  const prefix = sign ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";
  const parts = formatPrice(abs, unit).split(" ");
  const suffix = parts.pop();
  return (
    <span
      className={className}
      style={{ direction: "rtl", color: tone === "brand" ? "var(--brand)" : undefined }}
    >
      <span className="num">{prefix}{parts.join(" ")}</span>
      <span className="ms-1.5 text-[0.7em] font-semibold opacity-60">{suffix}</span>
    </span>
  );
}

export function UnitToggle({ compact = false, onNav = false }: { compact?: boolean; onNav?: boolean }) {
  const { unit, setUnit } = useApp();
  return (
    <div
      className="inline-flex items-center rounded-lg border p-0.5 text-[11px]"
      style={{
        borderColor: onNav ? "var(--nav-line)" : "var(--line)",
        background: onNav ? "rgba(255,255,255,0.08)" : "var(--surface-3)",
      }}
      role="group"
      aria-label="وحدة عرض الثمن"
    >
      {(["dh", "million"] as const).map((u) => (
        <button
          key={u}
          onClick={() => setUnit(u)}
          aria-pressed={unit === u}
          className="rounded-md px-2.5 py-1 font-bold transition"
          style={{
            background: unit === u ? "var(--brand)" : "transparent",
            color: unit === u ? "#fff" : onNav ? "var(--nav-muted)" : "var(--text-dim)",
          }}
        >
          {u === "dh" ? "درهم" : compact ? "مليون" : "بالمليون"}
        </button>
      ))}
    </div>
  );
}
