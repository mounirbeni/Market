"use client";

import { formatPrice } from "@/lib/format";
import { useApp } from "@/store/app";

export function Price({
  value,
  className,
  sign = false,
}: {
  value: number;
  className?: string;
  sign?: boolean;
}) {
  const { unit } = useApp();
  const abs = Math.abs(value);
  const prefix = sign ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";
  return (
    <span className={className}>
      <span className="num">{prefix}{formatPrice(abs, unit).split(" ").slice(0, -1).join(" ")}</span>{" "}
      <span className="text-[0.75em] opacity-70">
        {unit === "million" ? "مليون" : "د.م"}
      </span>
    </span>
  );
}

export function UnitToggle({ compact = false }: { compact?: boolean }) {
  const { unit, setUnit } = useApp();
  return (
    <div
      className="inline-flex items-center rounded-full border p-0.5 text-xs"
      style={{ borderColor: "var(--line)" }}
      role="group"
      aria-label="وحدة عرض الثمن"
    >
      {(["dh", "million"] as const).map((u) => (
        <button
          key={u}
          onClick={() => setUnit(u)}
          aria-pressed={unit === u}
          className="rounded-full px-2.5 py-1 font-bold transition"
          style={{
            background: unit === u ? "var(--accent)" : "transparent",
            color: unit === u ? "var(--accent-ink)" : "var(--text-muted)",
          }}
        >
          {u === "dh" ? "درهم" : compact ? "مليون" : "بالمليون"}
        </button>
      ))}
    </div>
  );
}
