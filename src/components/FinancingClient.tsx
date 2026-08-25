"use client";

import { useMemo, useState } from "react";
import { VEHICLES } from "@/lib/data/vehicles";
import { computeCredit } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import { Calendar, Car, Coins, Info, Percent, Wallet } from "@/components/icons";

const BANKS = [
  { name: "قرض كلاسيكي", rate: 6.5, type: "classique" as const, note: "نسبة فائدة سنوية متغيرة حسب البنك والملف" },
  { name: "مرابحة تشاركية", rate: 7.2, type: "mourabaha" as const, note: "هامش ربح ثابت متفق عليه من البداية" },
];

export function FinancingClient() {
  const [id, setId] = useState("c003");
  const v = useMemo(() => VEHICLES.find((x) => x.id === id) ?? VEHICLES[0], [id]);
  const [price, setPrice] = useState(v.price);
  const [down, setDown] = useState(Math.round((v.price * 0.2) / 1000) * 1000);
  const [months, setMonths] = useState(48);
  const [income, setIncome] = useState(8000);

  function pickVehicle(nid: string) {
    const nv = VEHICLES.find((x) => x.id === nid);
    setId(nid);
    if (nv) {
      setPrice(nv.price);
      setDown(Math.round((nv.price * 0.2) / 1000) * 1000);
    }
  }

  const results = BANKS.map((b) => ({
    ...b,
    res: computeCredit({ price, downPayment: down, months, rate: b.rate, type: b.type }, income),
  }));

  const best = results.reduce((a, b) => (a.res.monthly <= b.res.monthly ? a : b));
  const effortColor = (e: number) =>
    e > 0.4 ? "var(--bad)" : e > 0.3 ? "var(--warn)" : "var(--good)";

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="card h-fit p-5">
        <h2 className="flex items-center gap-2 text-[13px] font-bold">
          <Wallet size={15} style={{ color: "var(--brand)" }} /> معطيات التمويل
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="fin-veh"><Car size={13} /> اختر مركبة (اختياري)</label>
            <select id="fin-veh" className="field" value={id} onChange={(e) => pickVehicle(e.target.value)}>
              {VEHICLES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.make} {x.model} — {x.year} ({formatNumber(x.price)} د.م)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="fin-price"><Coins size={13} /> ثمن المركبة (د.م)</label>
            <input id="fin-price" type="number" step="1000" className="field num"
              value={price} onChange={(e) => setPrice(Math.max(0, +e.target.value || 0))} />
          </div>

          <div>
            <label className="label" htmlFor="fin-down">
              <Coins size={13} /> الدفعة الأولى
              <span className="num mr-auto" style={{ color: "var(--brand)" }}>
                {formatNumber(down)} د.م ({price ? Math.round((down / price) * 100) : 0}٪)
              </span>
            </label>
            <input id="fin-down" type="range" min={0} max={Math.max(1000, Math.round(price * 0.8))}
              step={1000} value={Math.min(down, Math.round(price * 0.8))}
              onChange={(e) => setDown(+e.target.value)} />
          </div>

          <div>
            <label className="label" htmlFor="fin-months">
              <Calendar size={13} /> المدة
              <span className="num mr-auto" style={{ color: "var(--brand)" }}>{months} شهراً</span>
            </label>
            <input id="fin-months" type="range" min={12} max={84} step={6}
              value={months} onChange={(e) => setMonths(+e.target.value)} />
          </div>

          <div>
            <label className="label" htmlFor="fin-income"><Wallet size={13} /> دخلك الشهري الصافي (د.م)</label>
            <input id="fin-income" type="number" step="500" className="field num"
              value={income} onChange={(e) => setIncome(Math.max(0, +e.target.value || 0))} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((r) => {
            const isBest = r.name === best.name;
            const effort = r.res.effort ?? 0;
            return (
              <div
                key={r.name}
                className={isBest ? "card-raised p-5" : "card p-5"}
                style={isBest ? { borderColor: "var(--brand)" } : undefined}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[14px] font-bold">{r.name}</h3>
                    <p className="mt-0.5 text-[10.5px]" style={{ color: "var(--text-dim)" }}>{r.note}</p>
                  </div>
                  {isBest && (
                    <span className="tag" style={{ background: "var(--brand)", color: "#fff" }}>الأقل قسطاً</span>
                  )}
                </div>

                <div className="mt-5 text-center">
                  <div className="num text-3xl font-extrabold" style={{ color: "var(--brand)" }}>
                    {formatNumber(r.res.monthly)}
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>درهم / شهر</div>
                </div>

                <dl className="mt-5 space-y-2 text-[11.5px]">
                  {[
                    ["المبلغ الممول", formatNumber(r.res.financed)],
                    [r.type === "mourabaha" ? "هامش الربح" : "كلفة القرض", formatNumber(r.res.cost)],
                    ["المجموع المدفوع", formatNumber(r.res.totalPaid + down)],
                    ["النسبة", `${r.rate}٪`],
                  ].map(([k, val]) => (
                    <div key={k} className="flex justify-between">
                      <dt style={{ color: "var(--text-muted)" }}>{k}</dt>
                      <dd className="num font-bold">{val}</dd>
                    </div>
                  ))}
                </dl>

                {income > 0 && (
                  <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--line-soft)" }}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span style={{ color: "var(--text-muted)" }}>نسبة الجهد</span>
                      <span className="num font-bold" style={{ color: effortColor(effort) }}>
                        {Math.round(effort * 100)}٪
                      </span>
                    </div>
                    <div className="meter mt-1.5" style={{ height: 5 }}>
                      <i style={{ width: `${Math.min(100, effort * 100)}%`, background: effortColor(effort) }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold">
            <Percent size={16} style={{ color: "var(--brand)" }} /> كيفاش كتقرا النتيجة
          </h2>
          <ul className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            <li>
              <b style={{ color: "var(--text)" }}>نسبة الجهد</b>: البنوك فالمغرب عادةً كتقبل قسطاً
              تحت <span className="num">40٪</span> من الدخل الصافي. فوق هادشي، الملف كيتصعّب.
            </li>
            <li>
              <b style={{ color: "var(--text)" }}>الدفعة الأولى</b>: كل ما زدتيها، نقص القسط ونقصات
              كلفة القرض. أغلب البنوك كتطلب على الأقل <span className="num">20٪</span> للمركبات المستعملة.
            </li>
            <li>
              <b style={{ color: "var(--text)" }}>المدة</b>: تمديد المدة كينقص القسط ولكن كيزيد المجموع
              المدفوع. قارن العمودين قبل ما تقرر.
            </li>
            <li>
              <b style={{ color: "var(--text)" }}>ماشي غير القسط</b>: زيد التأمين والفينيات والصيانة —
              شوف حاسبة التكلفة الحقيقية.
            </li>
          </ul>

          <p
            className="mt-5 flex gap-2 rounded-lg p-3 text-[11.5px] leading-relaxed"
            style={{ background: "var(--warn-soft)", color: "var(--text-muted)" }}
          >
            <Info size={15} className="mt-px shrink-0" style={{ color: "var(--warn)" }} />
            هاد الحساب تقديري وليس عرضاً ائتمانياً ملزماً. النسب الحقيقية كتحدد من طرف البنك
            حسب ملفك، ومعها مصاريف الملف والتأمين على القرض.
          </p>
        </div>
      </div>
    </div>
  );
}
