"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/lib/types";
import { computeTco } from "@/lib/tco";
import { TcoCalculator } from "@/components/vehicle/TcoCalculator";
import { formatNumber } from "@/lib/format";
import { vehicleHref } from "@/lib/slug";
import { Car, Chart, Moto, TrendingDown, TrendingUp } from "@/components/icons";

export function CostClient() {
  const [id, setId] = useState("c003");
  const [kind, setKind] = useState<"car" | "moto">("car");

  /* المركبات كيجيو من قاعدة البيانات */
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/listings?limit=200&sort=price-asc")
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok) setFleet(j.data.items as Vehicle[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const v = useMemo<Vehicle | undefined>(() => fleet.find((x) => x.id === id) ?? fleet[0], [fleet, id]);

  const ranking = useMemo(() => {
    const km = kind === "moto" ? 8000 : 15000;
    return fleet
      .filter((x) => x.kind === kind)
      .map((x) => ({
        v: x,
        tco: computeTco(x, {
          kmPerYear: km,
          years: 3,
          coverage: "tiers",
          includeDepreciation: false,
        }),
      }))
      .sort((a, b) => a.tco.perYear - b.tco.perYear);
  }, [fleet, kind]);

  const cheapest = ranking.slice(0, 8);
  const priciest = ranking.slice(-5).reverse();
  const maxYear = ranking[ranking.length - 1]?.tco.perYear || 1;

  return (
    <div className="space-y-10">
      <div className="card p-4">
        <label className="label" htmlFor="cost-pick"><Car size={13} /> اختر مركبة من السوق</label>
        <select
          id="cost-pick"
          className="field"
          value={id}
          onChange={(e) => setId(e.target.value)}
        >
          {fleet.map((x) => (
            <option key={x.id} value={x.id}>
              {x.make} {x.model} {x.version} — {x.year} ({formatNumber(x.price)} د.م)
            </option>
          ))}
        </select>
      </div>

      {v && <TcoCalculator v={v} />}

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-[15px] font-bold"><Chart size={17} style={{ color: "var(--brand)" }} /> ترتيب المركبات حسب تكلفة الاستعمال</h2>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              التكلفة السنوية (بدون خسارة القيمة) على أساس{" "}
              <span className="num">{kind === "moto" ? "8 000" : "15 000"}</span> كم في السنة
              وتأمين ضد الغير.
            </p>
          </div>
          <div className="flex gap-1.5">
            {([["car", "سيارات", Car], ["moto", "دراجات", Moto]] as const).map(([k, l, I]) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className="chip transition"
                style={{
                  background: kind === k ? "var(--brand)" : "var(--surface-3)",
                  color: kind === k ? "var(--brand-ink)" : "var(--text-muted)",
                  borderColor: "transparent",
                }}
              >
                <I size={13} /> {l}
              </button>
            ))}
          </div>
        </div>

        <h3 className="mt-7 mb-4 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: "var(--good)" }}>
          <TrendingDown size={14} /> الأرخص في الاستعمال
        </h3>
        <ul className="space-y-2.5">
          {cheapest.map((r, i) => (
            <li key={r.v.id}>
              <Link href={vehicleHref(r.v)} className="group block">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="truncate font-bold group-hover:text-[var(--brand)]">
                    <span className="num opacity-50">{i + 1}.</span> {r.v.make} {r.v.model}{" "}
                    <span className="num opacity-60">{r.v.year}</span>
                  </span>
                  <span className="num shrink-0 font-extrabold">
                    {formatNumber(r.tco.perYear)} د.م/سنة
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full" style={{ background: "var(--surface-3)" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${(r.tco.perYear / maxYear) * 100}%`,
                      background: "var(--good)",
                    }}
                  />
                </div>
                <span className="num text-[10px]" style={{ color: "var(--text-dim)" }}>
                  {r.tco.perKm.toFixed(2)} د.م/كم · {formatNumber(r.tco.perMonth)} د.م/شهر
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 mb-4 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: "var(--bad)" }}>
          <TrendingUp size={14} /> الأغلى في الاستعمال
        </h3>
        <ul className="space-y-2.5">
          {priciest.map((r) => (
            <li key={r.v.id}>
              <Link href={vehicleHref(r.v)} className="group block">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="truncate font-bold group-hover:text-[var(--brand)]">
                    {r.v.make} {r.v.model} <span className="num opacity-60">{r.v.year}</span>
                  </span>
                  <span className="num shrink-0 font-extrabold">
                    {formatNumber(r.tco.perYear)} د.م/سنة
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full" style={{ background: "var(--surface-3)" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${(r.tco.perYear / maxYear) * 100}%`,
                      background: "var(--bad)",
                    }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
