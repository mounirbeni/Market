"use client";

import { useState, type ReactNode } from "react";
import { useDict } from "@/lib/i18n/client";
import { ChevronDown } from "@/components/icons";
import type { IconProps } from "@/components/icons";

type IconCmp = (p: IconProps) => React.JSX.Element;

/* ---------------- قسم قابل للطي ---------------- */
export function FilterSection({
  title,
  Icon,
  children,
  activeCount = 0,
  defaultOpen = true,
}: {
  title: string;
  Icon: IconCmp;
  children: ReactNode;
  activeCount?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: "var(--line-soft)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-3.5 text-start"
      >
        <Icon size={15} style={{ color: activeCount ? "var(--brand)" : "var(--text-dim)" }} />
        <span className="flex-1 text-[12.5px] font-bold" style={{ color: "var(--text)" }}>
          {title}
        </span>
        {activeCount > 0 && (
          <span
            className="num grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9.5px] font-bold"
            style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
          >
            {activeCount}
          </span>
        )}
        <ChevronDown
          size={15}
          style={{
            color: "var(--text-dim)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .25s var(--ease-out-soft)",
          }}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

/* ---------------- مفتاح مقطعي ---------------- */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; Icon?: IconCmp; count?: number }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="grid gap-1 rounded-xl p-1"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))`,
        background: "var(--surface-3)",
      }}
      role="group"
    >
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            className="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-[11.5px] font-bold transition"
            style={{
              background: on ? "var(--brand)" : "transparent",
              color: on ? "var(--brand-ink)" : "var(--text-muted)",
              boxShadow: on ? "var(--shadow-sm)" : "none",
            }}
          >
            {o.Icon && <o.Icon size={17} />}
            <span>{o.label}</span>
            {o.count !== undefined && (
              <span className="num text-[9.5px] opacity-65">{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- شبكة بلاطات بأيقونات ---------------- */
export function IconTiles({
  value,
  options,
  onChange,
  columns = 3,
}: {
  value: string;
  options: { value: string; label: string; fr?: string; render: (on: boolean) => ReactNode; count: number }[];
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {options.map((o) => {
        const on = value === o.value;
        const disabled = o.count === 0 && !on;
        return (
          <button
            key={o.value}
            onClick={() => onChange(on ? "" : o.value)}
            aria-pressed={on}
            disabled={disabled}
            className="flex flex-col items-center gap-1.5 rounded-lg border py-2.5 transition disabled:opacity-25"
            style={{
              borderColor: on ? "var(--brand)" : "var(--line)",
              background: on ? "var(--brand-soft)" : "var(--surface-1)",
              color: on ? "var(--brand)" : "var(--text)",
            }}
          >
            {o.render(on)}
            <span className="text-[10.5px] font-bold leading-none">{o.label}</span>
            {o.fr && (
              <span className="text-[8.5px] leading-none opacity-50" dir="ltr">{o.fr}</span>
            )}
            <span className="num text-[9px] leading-none opacity-60">{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- رقاقات قابلة للتبديل ---------------- */
export function ChipToggles({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string; fr?: string; Icon?: IconCmp; count?: number }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value === o.value;
        const disabled = o.count === 0 && !on;
        return (
          <button
            key={o.value}
            onClick={() => onChange(on ? "" : o.value)}
            aria-pressed={on}
            disabled={disabled}
            className="chip transition disabled:opacity-30"
            style={{
              borderColor: on ? "var(--brand)" : "var(--line-soft)",
              background: on ? "var(--brand-soft)" : "var(--surface-3)",
              color: on ? "var(--brand)" : "var(--text-muted)",
            }}
          >
            {o.Icon && <o.Icon size={13} />}
            {o.label}
            {o.fr && (
              <span className="opacity-45" dir="ltr" style={{ fontSize: "0.85em" }}>
                {o.fr}
              </span>
            )}
            {o.count !== undefined && <span className="num opacity-55">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- منزلق مزدوج مع مدرّج توزيع ---------------- */
export function DualRange({
  min,
  max,
  step,
  low,
  high,
  onChange,
  histogram,
  format,
}: {
  min: number;
  max: number;
  step: number;
  low?: number;
  high?: number;
  onChange: (low?: number, high?: number) => void;
  histogram?: number[];
  format: (n: number) => string;
}) {
  const t = useDict();
  const lo = low ?? min;
  const hi = high ?? max;
  const span = max - min || 1;
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;
  const peak = histogram?.length ? Math.max(...histogram, 1) : 1;

  return (
    <div>
      {histogram && histogram.length > 0 && (
        <div className="mb-1 flex h-10 items-end gap-[2px]" aria-hidden="true">
          {histogram.map((n, i) => {
            const center = ((i + 0.5) / histogram.length) * 100;
            const inRange = center >= loPct && center <= hiPct;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-colors"
                style={{
                  height: `${Math.max(6, (n / peak) * 100)}%`,
                  background: inRange ? "var(--brand)" : "var(--line)",
                  opacity: inRange ? 0.85 : 0.55,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="relative h-5">
        <div
          className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full"
          style={{ background: "var(--line)" }}
        />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{ right: `${loPct}%`, width: `${Math.max(0, hiPct - loPct)}%`, background: "var(--brand)" }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), hi - step);
            onChange(v <= min ? undefined : v, high);
          }}
          aria-label={t.rangeSlider.min}
          className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-track]:bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), lo + step);
            onChange(low, v >= max ? undefined : v);
          }}
          aria-label={t.rangeSlider.max}
          className="pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-track]:bg-transparent"
        />
      </div>

      <div className="mt-1.5 flex justify-between text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
        <span>{format(lo)}</span>
        <span>{format(hi)}{hi >= max ? "+" : ""}</span>
      </div>
    </div>
  );
}

/* ---------------- صف مفتاح ---------------- */
export function SwitchRow({
  checked,
  onChange,
  label,
  hint,
  Icon,
  count,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  Icon: IconCmp;
  count?: number;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-start transition"
      style={{
        borderColor: checked ? "var(--brand)" : "var(--line-soft)",
        background: checked ? "var(--brand-soft)" : "var(--surface-3)",
      }}
    >
      <Icon size={16} style={{ color: checked ? "var(--brand)" : "var(--text-dim)" }} />
      <span className="min-w-0 flex-1">
        <span className="block text-[11.5px] font-bold" style={{ color: "var(--text)" }}>
          {label}
        </span>
        {hint && (
          <span className="block text-[10px]" style={{ color: "var(--text-dim)" }}>{hint}</span>
        )}
      </span>
      {count !== undefined && (
        <span className="num text-[10px]" style={{ color: "var(--text-dim)" }}>{count}</span>
      )}
      <span
        className="relative h-4.5 w-8 shrink-0 rounded-full transition"
        style={{ height: 18, background: checked ? "var(--brand)" : "var(--line-strong)" }}
      >
        <span
          className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all"
          style={{ right: checked ? 2 : 16, transitionTimingFunction: "var(--ease-spring)" }}
        />
      </span>
    </button>
  );
}
