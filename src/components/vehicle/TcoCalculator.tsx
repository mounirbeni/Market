"use client";

import { useMemo, useState } from "react";
import type { Vehicle } from "@/lib/types";
import { computeTco, FUEL_PRICES } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import { Price } from "@/components/Price";

const COLORS = [
  "var(--color-saffron-500)",
  "var(--color-atlas-500)",
  "var(--color-clay-500)",
  "var(--color-majorelle-500)",
  "var(--color-saffron-600)",
  "var(--color-atlas-400)",
  "var(--color-ink-500)",
];

export function TcoCalculator({ v, compact = false }: { v: Vehicle; compact?: boolean }) {
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
        fuelPrices: {
          ...FUEL_PRICES,
          diesel: dieselPrice,
          essence: essencePrice,
          hybride: essencePrice,
        },
      }),
    [v, kmPerYear, years, coverage, withDep, dieselPrice, essencePrice],
  );

  const max = Math.max(...tco.lines.map((l) => l.perYear));

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold">التكلفة الحقيقية ديال الاستعمال</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            كلشي محسوب: الفينيات، التأمين، المحروقات، الصيانة، الإطارات والفحص التقني.
          </p>
        </div>
        <div className="flex flex-col items-start gap-0.5 sm:items-end">
          <Price value={tco.perMonth} className="text-2xl font-black" />
          <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
            في الشهر · <span className="num">{tco.perKm.toFixed(2)}</span> د.م لكل كيلومتر
          </span>
        </div>
      </div>

      {/* عناصر التحكم */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`km-${v.id}`}>
            الكيلومترات في السنة: <span className="num" style={{ color: "var(--accent)" }}>{formatNumber(kmPerYear)}</span>
          </label>
          <input
            id={`km-${v.id}`}
            type="range"
            min={v.kind === "moto" ? 1000 : 5000}
            max={v.kind === "moto" ? 25000 : 45000}
            step={1000}
            value={kmPerYear}
            onChange={(e) => setKmPerYear(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <div>
          <label className="label" htmlFor={`yr-${v.id}`}>
            مدة الاحتفاظ: <span className="num" style={{ color: "var(--accent)" }}>{years}</span> سنوات
          </label>
          <input
            id={`yr-${v.id}`}
            type="range"
            min={1}
            max={8}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {([
          ["tiers", "تأمين ضد الغير"],
          ["tous-risques", "جميع الأخطار"],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setCoverage(k)}
            aria-pressed={coverage === k}
            className="chip transition"
            style={{
              background: coverage === k ? "var(--accent)" : "var(--bg-inset)",
              color: coverage === k ? "var(--accent-ink)" : "var(--text-muted)",
              borderColor: "transparent",
            }}
          >
            {l}
          </button>
        ))}
        <button
          onClick={() => setWithDep((d) => !d)}
          aria-pressed={withDep}
          className="chip transition"
          style={{
            background: withDep ? "var(--color-majorelle-500)" : "var(--bg-inset)",
            color: withDep ? "#fff" : "var(--text-muted)",
            borderColor: "transparent",
          }}
        >
          {withDep ? "✓ " : ""}احتساب خسارة القيمة
        </button>
      </div>

      {!compact && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor={`pd-${v.id}`}>ثمن الگازوال (د.م/ل)</label>
            <input
              id={`pd-${v.id}`}
              type="number"
              step="0.1"
              className="field num"
              value={dieselPrice}
              onChange={(e) => setDieselPrice(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label" htmlFor={`pe-${v.id}`}>ثمن البنزين (د.م/ل)</label>
            <input
              id={`pe-${v.id}`}
              type="number"
              step="0.1"
              className="field num"
              value={essencePrice}
              onChange={(e) => setEssencePrice(Number(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {/* التفصيل */}
      <div className="mt-6 space-y-2.5">
        {tco.lines.map((l, i) => (
          <div key={l.key}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-bold">
                {l.label}
                {l.hint && (
                  <span className="mr-1.5 font-normal" style={{ color: "var(--text-dim)" }}>
                    ({l.hint})
                  </span>
                )}
              </span>
              <span className="num shrink-0 font-bold">{formatNumber(l.perYear)} د.م</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full" style={{ background: "var(--bg-inset)" }}>
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${(l.perYear / max) * 100}%`, background: COLORS[i % COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4 text-center" style={{ borderColor: "var(--line-soft)" }}>
        <div>
          <div className="num text-sm font-black" style={{ color: "var(--accent)" }}>
            {formatNumber(tco.perYear)}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-dim)" }}>د.م في السنة</div>
        </div>
        <div>
          <div className="num text-sm font-black" style={{ color: "var(--accent)" }}>
            {formatNumber(tco.total)}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-dim)" }}>
            المجموع على <span className="num">{years}</span> سنوات
          </div>
        </div>
        <div>
          <div className="num text-sm font-black" style={{ color: "var(--color-atlas-400)" }}>
            {formatNumber(tco.resaleValue)}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-dim)" }}>قيمة إعادة البيع المتوقعة</div>
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        تقديرات إرشادية مبنية على معدلات السوق المغربي (أثمنة المحروقات، تعريفة الضريبة
        الخصوصية السنوية، متوسط أقساط التأمين). النتائج تختلف حسب شركة التأمين والاستعمال الفعلي.
      </p>
    </section>
  );
}
