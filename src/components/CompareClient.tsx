"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/store/app";
import { vehicleById } from "@/lib/data/vehicles";
import { fairPriceOf, trustOf } from "@/lib/market";
import { computeTco } from "@/lib/tco";
import { AR, formatNumber } from "@/lib/format";
import { cityName } from "@/lib/cities";
import { VehicleArt } from "@/components/VehicleArt";
import { TrustRing } from "@/components/TrustBadge";
import { Price } from "@/components/Price";
import type { Vehicle } from "@/lib/types";

interface Row {
  label: string;
  values: (string | number)[];
  /** أي اتجاه هو الأفضل */
  best?: "min" | "max";
  raw?: number[];
  emphasis?: boolean;
}

export function CompareClient() {
  const { compare, toggleCompare, clearCompare, ready } = useApp();

  const items = useMemo(
    () => compare.map((id) => vehicleById(id)).filter(Boolean) as Vehicle[],
    [compare],
  );

  const rows = useMemo<Row[]>(() => {
    if (!items.length) return [];
    const tcos = items.map((v) =>
      computeTco(v, {
        kmPerYear: v.kind === "moto" ? 8000 : 15000,
        years: 3,
        coverage: "tiers",
        includeDepreciation: false,
      }),
    );
    const trusts = items.map((v) => trustOf(v));
    const fps = items.map((v) => fairPriceOf(v));

    return [
      { label: "الثمن", values: items.map((v) => `${formatNumber(v.price)} د.م`), raw: items.map((v) => v.price), best: "min", emphasis: true },
      { label: "مؤشر الثقة", values: trusts.map((t) => `${t.score}/100`), raw: trusts.map((t) => t.score), best: "max", emphasis: true },
      { label: "الفرق عن ثمن السوق", values: fps.map((f) => `${f.delta > 0 ? "+" : "−"}${Math.abs(Math.round(f.delta * 100))}٪`), raw: fps.map((f) => f.delta), best: "min", emphasis: true },
      { label: "تكلفة الاستعمال", values: tcos.map((t) => `${formatNumber(t.perYear)} د.م/سنة`), raw: tcos.map((t) => t.perYear), best: "min", emphasis: true },
      { label: "التكلفة لكل كيلومتر", values: tcos.map((t) => `${t.perKm.toFixed(2)} د.م`), raw: tcos.map((t) => t.perKm), best: "min" },
      { label: "السنة", values: items.map((v) => v.year), raw: items.map((v) => v.year), best: "max" },
      { label: "الكيلومتراج", values: items.map((v) => `${formatNumber(v.km)} كم`), raw: items.map((v) => v.km), best: "min" },
      { label: "الوقود", values: items.map((v) => AR.fuel[v.fuel]) },
      { label: "ناقل السرعة", values: items.map((v) => AR.gearbox[v.gearbox]) },
      { label: "الهيكل", values: items.map((v) => AR.body[v.body]) },
      { label: "الاستهلاك", values: items.map((v) => `${v.consumption} ل/100كم`), raw: items.map((v) => v.consumption), best: "min" },
      { label: "القوة الجبائية", values: items.map((v) => `${v.fiscalPower} حصان`), raw: items.map((v) => v.fiscalPower), best: "min" },
      { label: "الفينيات", values: tcos.map((t) => { const l = t.lines.find((x) => x.key === "vignette"); return l ? `${formatNumber(l.perYear)} د.م` : "معفية"; }) },
      { label: "التأمين (ضد الغير)", values: tcos.map((t) => { const l = t.lines.find((x) => x.key === "insurance"); return l ? `${formatNumber(l.perYear)} د.م` : "-"; }), raw: tcos.map((t) => t.lines.find((x) => x.key === "insurance")?.perYear ?? 0), best: "min" },
      { label: "عدد الملاّك", values: items.map((v) => v.owners), raw: items.map((v) => v.owners), best: "min" },
      { label: "الحالة", values: items.map((v) => AR.condition[v.condition]) },
      { label: "المدينة", values: items.map((v) => cityName(v.city)) },
      { label: "دفتر الصيانة", values: items.map((v) => (v.serviceBook ? "✓ متوفر" : "✗ غير متوفر")) },
      { label: "فحص مستقل", values: items.map((v) => (v.inspected ? "✓ تم" : "✗ لم يتم")) },
      { label: "قيمة إعادة البيع بعد 3 سنوات", values: tcos.map((t) => `${formatNumber(t.resaleValue)} د.م`), raw: tcos.map((t) => t.resaleValue), best: "max" },
    ];
  }, [items]);

  if (!ready) return null;

  if (!items.length) {
    return (
      <div className="card p-12 text-center">
        <p className="text-4xl">⚖️</p>
        <h2 className="mt-4 text-lg font-extrabold">ما زال ما زدتي حتى مركبة للمقارنة</h2>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--text-muted)" }}>
          من أي إعلان، كليكي على زر المقارنة (الخطوط الثلاثة) باش تزيد حتى ثلاث مركبات
          وتشوفهم جنب بعضياتهم: الثمن، الثقة، التكلفة والمواصفات.
        </p>
        <Link href="/vehicles" className="btn btn-primary mt-6">تصفح المركبات</Link>
      </div>
    );
  }

  function bestIndex(row: Row): number | null {
    if (!row.raw || !row.best || row.raw.length < 2) return null;
    const target = row.best === "min" ? Math.min(...row.raw) : Math.max(...row.raw);
    const idx = row.raw.indexOf(target);
    // لا نبرز شيئاً إذا كانت كل القيم متساوية
    return row.raw.every((x) => x === target) ? null : idx;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          <span className="num">{items.length}</span> من <span className="num">3</span> مركبات
        </p>
        <button onClick={clearCompare} className="btn btn-ghost btn-sm">مسح الكل</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-right">
          <thead>
            <tr>
              <th className="w-32 p-2 align-bottom text-xs" style={{ color: "var(--text-dim)" }} />
              {items.map((v) => (
                <th key={v.id} className="p-2 align-bottom" style={{ width: `${70 / items.length}%` }}>
                  <div className="card overflow-hidden">
                    <div className="relative aspect-[16/10]">
                      <VehicleArt id={v.id} kind={v.kind} body={v.body} className="h-full w-full" />
                      <button
                        onClick={() => toggleCompare(v.id)}
                        aria-label={`إزالة ${v.make} ${v.model}`}
                        className="absolute top-2 left-2 grid h-6 w-6 place-items-center rounded-full text-xs font-bold text-white"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="p-3 text-center">
                      <Link href={`/vehicles/${v.id}`} className="block truncate text-sm font-extrabold hover:text-[var(--accent)]">
                        {v.make} {v.model}
                      </Link>
                      <p className="truncate text-[10px]" style={{ color: "var(--text-dim)" }}>{v.version}</p>
                      <div className="mt-2 flex justify-center">
                        <TrustRing score={trustOf(v).score} grade={trustOf(v).grade} size={46} stroke={4} showLabel={false} />
                      </div>
                      <div className="mt-2">
                        <Price value={v.price} className="text-sm font-black" />
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const best = bestIndex(row);
              return (
                <tr key={row.label} className="border-b" style={{ borderColor: "var(--line-soft)" }}>
                  <th
                    className="p-2.5 text-xs font-bold"
                    style={{ color: row.emphasis ? "var(--text)" : "var(--text-muted)" }}
                    scope="row"
                  >
                    {row.label}
                  </th>
                  {row.values.map((val, i) => (
                    <td
                      key={i}
                      className="p-2.5 text-center text-xs"
                      style={{
                        background:
                          best === i ? "color-mix(in oklab, var(--color-atlas-500) 14%, transparent)" : undefined,
                        color: best === i ? "var(--color-atlas-400)" : "var(--text-muted)",
                        fontWeight: best === i || row.emphasis ? 800 : 400,
                      }}
                    >
                      {/\d/.test(String(val)) ? <span className="num">{val}</span> : val}
                      {best === i && <span className="mr-1" aria-label="الأفضل">★</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px]" style={{ color: "var(--text-dim)" }}>
        ★ كتشير للقيمة الأحسن فكل سطر. تكلفة الاستعمال محسوبة على{" "}
        <span className="num">15 000</span> كم/سنة للسيارات و<span className="num">8 000</span> كم/سنة
        للدراجات، بتأمين ضد الغير وبدون خسارة القيمة.
      </p>
    </div>
  );
}
