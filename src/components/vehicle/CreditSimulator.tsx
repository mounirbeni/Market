"use client";

import { useMemo, useState } from "react";
import { computeCredit } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import { Calendar, Coins, Info, Percent, Wallet } from "@/components/icons";

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
    effort > 0.4 ? "var(--bad)" : effort > 0.3 ? "var(--brand)" : "var(--good)";

  return (
    <section className="card p-5" id="credit">
      <header className="mb-4 flex items-start gap-2.5">
        <Wallet size={18} style={{ color: "var(--brand)" }} className="mt-0.5 shrink-0" />
        <div>
          <h2 className="text-[15px] font-bold">محاكي التمويل</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
            قارن بين القرض الكلاسيكي والمرابحة، وشوف واش القسط الشهري مناسب لدخلك.
          </p>
        </div>
      </header>

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
              background: type === k ? "var(--brand)" : "var(--surface-3)",
              color: type === k ? "var(--brand-ink)" : "var(--text-muted)",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="label" htmlFor="cs-down">
            <Coins size={13} /> الدفعة الأولى
            <span className="num mr-auto" style={{ color: "var(--brand)" }}>
              {formatNumber(down)} د.م ({Math.round((down / price) * 100)}٪)
            </span>
          </label>
          <input
            id="cs-down"
            type="range"
            min={0}
            max={Math.round(price * 0.8)}
            step={1000}
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
            
          />
        </div>
        <div>
          <label className="label" htmlFor="cs-months">
            <Calendar size={13} /> المدة
            <span className="num mr-auto" style={{ color: "var(--brand)" }}>{months} شهراً</span>
          </label>
          <input
            id="cs-months"
            type="range"
            min={12}
            max={84}
            step={6}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="cs-rate">
              <Percent size={13} /> {type === "mourabaha" ? "هامش الربح السنوي" : "نسبة الفائدة السنوية"}
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
            <label className="label" htmlFor="cs-income"><Wallet size={13} /> دخلك الشهري (د.م)</label>
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

      <div className="mt-5 rounded-xl p-4" style={{ background: "var(--surface-3)" }}>
        <div className="flex items-end justify-between">
          <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>القسط الشهري</span>
          <span className="num text-2xl font-extrabold" style={{ color: "var(--brand)" }}>
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
            <p className="mt-2 flex gap-1.5 text-[10px]" style={{ color: "var(--text-dim)" }}>
              <Info size={12} className="mt-px shrink-0" />
              البنوك فالمغرب عادةً كتقبل نسبة جهد تحت <span className="num">40٪</span> من الدخل الصافي.
              {effort > 0.4 && " هاد القسط غادي يكون صعيب باش يتقبل."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
