"use client";

import { useMemo, useState } from "react";
import { computeCredit } from "@/lib/tco";
import { formatNumber } from "@/lib/format";

export function CreditSimulator({ price }: { price: number }) {
  const [down, setDown] = useState(Math.round((price * 0.2) / 1000) * 1000);
  const [months, setMonths] = useState(48);
  const [rate, setRate] = useState(6.5);
  const [type, setType] = useState<"classique" | "mourabaha">("classique");
  const [income, setIncome] = useState(8000);

  const res = useMemo(
    () => computeCredit({ price, downPayment: down, months, rate, type }, income),
    [price, down, months, rate, type, income],
  );

  const effort = res.effort ?? 0;
  const effortColor =
    effort > 0.4 ? "var(--color-clay-500)" : effort > 0.3 ? "var(--color-saffron-500)" : "var(--color-atlas-400)";

  return (
    <section className="card p-5" id="credit">
      <h2 className="text-base font-extrabold">محاكي التمويل</h2>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        قارن بين القرض الكلاسيكي والمرابحة، وشوف واش القسط الشهري مناسب لدخلك.
      </p>

      <div className="mt-4 flex gap-2">
        {([
          ["classique", "قرض كلاسيكي"],
          ["mourabaha", "مرابحة (تشاركي)"],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setType(k)}
            aria-pressed={type === k}
            className="flex-1 rounded-lg py-2 text-xs font-bold transition"
            style={{
              background: type === k ? "var(--accent)" : "var(--bg-inset)",
              color: type === k ? "var(--accent-ink)" : "var(--text-muted)",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="label" htmlFor="cs-down">
            الدفعة الأولى: <span className="num" style={{ color: "var(--accent)" }}>{formatNumber(down)} د.م</span>
            <span className="num mr-1 opacity-60">({Math.round((down / price) * 100)}٪)</span>
          </label>
          <input
            id="cs-down"
            type="range"
            min={0}
            max={Math.round(price * 0.8)}
            step={1000}
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <div>
          <label className="label" htmlFor="cs-months">
            المدة: <span className="num" style={{ color: "var(--accent)" }}>{months}</span> شهراً
          </label>
          <input
            id="cs-months"
            type="range"
            min={12}
            max={84}
            step={6}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="cs-rate">
              {type === "mourabaha" ? "هامش الربح السنوي ٪" : "نسبة الفائدة السنوية ٪"}
            </label>
            <input
              id="cs-rate"
              type="number"
              step="0.1"
              className="field num"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label" htmlFor="cs-income">دخلك الشهري (د.م)</label>
            <input
              id="cs-income"
              type="number"
              step="500"
              className="field num"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl p-4" style={{ background: "var(--bg-inset)" }}>
        <div className="flex items-end justify-between">
          <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>القسط الشهري</span>
          <span className="num text-2xl font-black" style={{ color: "var(--accent)" }}>
            {formatNumber(res.monthly)} <span className="text-xs">د.م</span>
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div>
            <div className="num font-bold">{formatNumber(res.financed)}</div>
            <div style={{ color: "var(--text-dim)" }}>المبلغ الممول</div>
          </div>
          <div>
            <div className="num font-bold">{formatNumber(res.cost)}</div>
            <div style={{ color: "var(--text-dim)" }}>{type === "mourabaha" ? "هامش الربح" : "كلفة القرض"}</div>
          </div>
          <div>
            <div className="num font-bold">{formatNumber(res.totalPaid + down)}</div>
            <div style={{ color: "var(--text-dim)" }}>المجموع المدفوع</div>
          </div>
        </div>

        {income > 0 && (
          <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--line-soft)" }}>
            <div className="flex items-center justify-between text-[11px]">
              <span style={{ color: "var(--text-muted)" }}>نسبة الجهد من الدخل</span>
              <span className="num font-bold" style={{ color: effortColor }}>
                {Math.round(effort * 100)}٪
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full" style={{ background: "var(--line)" }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, effort * 100)}%`, background: effortColor }}
              />
            </div>
            <p className="mt-2 text-[10px]" style={{ color: "var(--text-dim)" }}>
              البنوك فالمغرب عادةً كتقبل نسبة جهد تحت <span className="num">40٪</span> من الدخل الصافي.
              {effort > 0.4 && " هاد القسط غادي يكون صعيب باش يتقبل."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
