"use client";

import { useMemo, useState } from "react";
import type { Vehicle } from "@/lib/types";
import { computeTco, FUEL_PRICES } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import { Price } from "@/components/Price";
import { useDict } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/labels";
import {
  Calculator, Clock, Coins, Diagnostic, Droplet, Fuel, Gauge, Info, OilCan,
  Shield, Tire, TrendingDown,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";

const LINE_META: Record<string, { color: string; Icon: (p: IconProps) => React.JSX.Element }> = {
  fuel: { color: "#1f5fe0", Icon: Fuel },
  insurance: { color: "#4f46e5", Icon: Shield },
  vignette: { color: "#d97706", Icon: Coins },
  maintenance: { color: "#16a34a", Icon: OilCan },
  tyres: { color: "#0d9488", Icon: Tire },
  control: { color: "#6b7f9c", Icon: Diagnostic },
  depreciation: { color: "#dc2626", Icon: TrendingDown },
};

/** حلقة توزيع التكاليف */
function Donut({ lines, total }: { lines: { key: string; perYear: number }[]; total: number }) {
  const size = 148;
  const stroke = 20;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
      {lines.map((l) => {
        const frac = l.perYear / total;
        const dash = c * frac;
        const el = (
          <circle
            key={l.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={LINE_META[l.key]?.color ?? "var(--line)"}
            strokeWidth={stroke}
            strokeDasharray={`${Math.max(0, dash - 2)} ${c}`}
            strokeDashoffset={-offset}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

export function TcoCalculator({ v, compact = false }: { v: Vehicle; compact?: boolean }) {
  const t = useDict();
  const [kmPerYear, setKmPerYear] = useState(v.kind === "moto" ? 8000 : 15000);
  const [years, setYears] = useState(3);
  const [coverage, setCoverage] = useState<"tiers" | "tous-risques">("tiers");
  const [withDep, setWithDep] = useState(true);
  const [dieselPrice, setDieselPrice] = useState(FUEL_PRICES.diesel);
  const [essencePrice, setEssencePrice] = useState(FUEL_PRICES.essence);

  const tco = useMemo(
    () =>
      computeTco(v, {
        kmPerYear,
        years,
        coverage,
        includeDepreciation: withDep,
        fuelPrices: { ...FUEL_PRICES, diesel: dieselPrice, essence: essencePrice, hybride: essencePrice },
      }),
    [v, kmPerYear, years, coverage, withDep, dieselPrice, essencePrice],
  );

  return (
    <section className="card overflow-hidden">
      <header
        className="flex flex-wrap items-start justify-between gap-3 border-b p-5"
        style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
      >
        <div className="flex items-start gap-2.5">
          <Calculator size={18} style={{ color: "var(--brand)" }} className="mt-0.5 shrink-0" />
          <div>
            <h2 className="text-[15px] font-bold">{t.tco.title}</h2>
            <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
              {t.tco.lead}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <Price value={tco.perMonth} className="text-2xl font-extrabold tracking-tight" />
          <span className="mt-0.5 flex items-center gap-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
            <Clock size={12} /> {t.tco.perMonth} · <span className="num">{tco.perKm.toFixed(2)}</span> {t.tco.perKm}
          </span>
        </div>
      </header>

      <div className="p-5">
        {/* التحكم */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor={`km-${v.id}`}>
              <Gauge size={13} /> {t.tco.kmPerYear}
              <span className="num me-auto" style={{ color: "var(--brand)" }}>{formatNumber(kmPerYear)}</span>
            </label>
            <input
              id={`km-${v.id}`}
              type="range"
              min={v.kind === "moto" ? 1000 : 5000}
              max={v.kind === "moto" ? 25000 : 45000}
              step={1000}
              value={kmPerYear}
              onChange={(e) => setKmPerYear(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor={`yr-${v.id}`}>
              <Clock size={13} /> {t.tco.duration}
              <span className="num me-auto" style={{ color: "var(--brand)" }}>{years} {t.tco.years}</span>
            </label>
            <input
              id={`yr-${v.id}`}
              type="range"
              min={1}
              max={8}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {([["tiers", t.tco.insuranceTiers], ["tous-risques", t.tco.insuranceAllRisk]] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setCoverage(k)}
              aria-pressed={coverage === k}
              className="chip transition"
              style={{
                background: coverage === k ? "var(--brand-soft)" : "var(--surface-3)",
                color: coverage === k ? "var(--brand)" : "var(--text-muted)",
                borderColor: coverage === k ? "var(--brand)" : "var(--line-soft)",
              }}
            >
              <Shield size={12} /> {l}
            </button>
          ))}
          <button
            onClick={() => setWithDep((d) => !d)}
            aria-pressed={withDep}
            className="chip transition"
            style={{
              background: withDep ? "var(--data-soft)" : "var(--surface-3)",
              color: withDep ? "var(--data)" : "var(--text-muted)",
              borderColor: withDep ? "var(--data)" : "var(--line-soft)",
            }}
          >
            <TrendingDown size={12} /> {t.tco.depreciation}
          </button>
        </div>

        {!compact && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor={`pd-${v.id}`}><Droplet size={13} /> {t.tco.dieselPrice}</label>
              <input id={`pd-${v.id}`} type="number" step="0.1" className="field num"
                value={dieselPrice} onChange={(e) => setDieselPrice(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label" htmlFor={`pe-${v.id}`}><Fuel size={13} /> {t.tco.petrolPrice}</label>
              <input id={`pe-${v.id}`} type="number" step="0.1" className="field num"
                value={essencePrice} onChange={(e) => setEssencePrice(Number(e.target.value) || 0)} />
            </div>
          </div>
        )}

        {/* التوزيع */}
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative">
            <Donut lines={tco.lines} total={tco.perYear} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="num text-lg font-extrabold" style={{ color: "var(--text)" }}>
                {formatNumber(tco.perYear)}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>{t.tco.perYearUnit}</span>
            </div>
          </div>

          <ul className="w-full flex-1 space-y-2">
            {tco.lines.map((l) => {
              const meta = LINE_META[l.key];
              const pct = Math.round((l.perYear / tco.perYear) * 100);
              return (
                <li key={l.key} className="flex items-center gap-2.5">
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                    style={{ background: `color-mix(in oklab, ${meta?.color} 15%, transparent)`, color: meta?.color }}
                  >
                    {meta && <meta.Icon size={14} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold">
                      {t.tco.line[l.labelKey as keyof typeof t.tco.line]}
                    </span>
                    {l.hintKey && (
                      <span className="block truncate text-[10px]" style={{ color: "var(--text-dim)" }}>
                        {fill(t.tco.hint[l.hintKey as keyof typeof t.tco.hint], l.hintVars ?? {})}
                      </span>
                    )}
                  </span>
                  <span className="num shrink-0 text-[12px] font-bold">{formatNumber(l.perYear)}</span>
                  <span className="num w-8 shrink-0 text-end text-[10px]" style={{ color: "var(--text-dim)" }}>
                    {pct}{t.fairPrice.percent}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* الخلاصة */}
        <div
          className="mt-6 grid grid-cols-3 gap-3 border-t pt-4"
          style={{ borderColor: "var(--line-soft)" }}
        >
          {[
            { label: t.tco.perYear, value: formatNumber(tco.perYear), color: "var(--brand)" },
            { label: fill(t.tco.totalOver, { years: String(years) }), value: formatNumber(tco.total), color: "var(--text)" },
            { label: t.tco.resaleValue, value: formatNumber(tco.resaleValue), color: "var(--good)" },
          ].map((s) => (
            <div key={s.label} className="stat text-center">
              <span className="stat-value text-[15px]" style={{ color: s.color }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 flex gap-2 text-[10.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          <Info size={13} className="mt-px shrink-0" />
          {t.tco.disclaimer}
        </p>
      </div>
    </section>
  );
}
