"use client";

import { useApp } from "@/store/app";
import { useDict, useLocale } from "@/lib/i18n/client";
import { DIR } from "@/lib/i18n/config";
import { fmtPrice } from "@/lib/i18n/labels";

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

export function UnitToggle({ compact = false, onNav = false }: { compact?: boolean; onNav?: boolean }) {
  const { unit, setUnit } = useApp();
  const t = useDict();
  return (
    <div
      className="inline-flex items-center rounded-lg border p-0.5 text-[11px]"
      style={{
        borderColor: onNav ? "var(--nav-line)" : "var(--line)",
        background: onNav ? "rgba(255,255,255,0.08)" : "var(--surface-3)",
      }}
      role="group"
      aria-label={t.price.unitLabel}
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
          {u === "dh" ? t.price.dh : compact ? t.price.million : t.price.millionLong}
        </button>
      ))}
    </div>
  );
}
