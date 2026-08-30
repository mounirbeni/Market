"use client";

import { Link } from "@/components/Link";
import { vehicleHref } from "@/lib/slug";
import { useMemo } from "react";
import { useApp } from "@/store/app";
import { useVehiclesByIds } from "@/lib/useVehicles";
import { fairPriceOf, trustOf } from "@/lib/market";
import { computeTco } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import { useDict, useLocale } from "@/lib/i18n/client";
import { cityLabel, dhUnit, fill, kmUnit, specs } from "@/lib/i18n/labels";
import { artShape } from "@/lib/artshape";
import { VehicleArt } from "@/components/VehicleArt";
import { TrustRing } from "@/components/TrustBadge";
import { Price } from "@/components/Price";
import { Mixed } from "@/components/Mixed";
import type { Vehicle } from "@/lib/types";
import {
  Award, BadgeCheck, Calculator, Calendar, Car, Check, Close, Coins, Engine,
  Fuel, Gauge, Gearbox, MapPin, Road, Scale, Shield, ShieldCheck, Trash,
  TrendingDown, Users, Wrench,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";

interface Row {
  label: string;
  Icon: (p: IconProps) => React.JSX.Element;
  values: (string | number)[];
  best?: "min" | "max";
  raw?: number[];
  emphasis?: boolean;
}

interface Group {
  title: string;
  Icon: (p: IconProps) => React.JSX.Element;
  rows: Row[];
}

export function CompareClient() {
  const { compare, toggleCompare, clearCompare, ready } = useApp();
  const t = useDict();
  const locale = useLocale();
  const L = specs(locale);
  const dh = dhUnit(locale);
  const km_ = kmUnit(locale);
  const pct = t.fairPrice.percent;

  /* التفاصيل كتجي من قاعدة البيانات — المتصفح كيخزّن غير المعرّفات */
  const { items } = useVehiclesByIds(compare);

  const groups = useMemo<Group[]>(() => {
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
    const line = (i: number, key: string) => tcos[i].lines.find((l) => l.key === key)?.perYear ?? 0;

    const c = t.compareClient;
    return [
      {
        title: c.groupSummary,
        Icon: Award,
        rows: [
          { label: c.price, Icon: Coins, values: items.map((v) => `${formatNumber(v.price)} ${dh}`), raw: items.map((v) => v.price), best: "min", emphasis: true },
          { label: c.trustScore, Icon: ShieldCheck, values: trusts.map((tr) => `${tr.score}/100`), raw: trusts.map((tr) => tr.score), best: "max", emphasis: true },
          { label: c.vsMarket, Icon: Scale, values: fps.map((f) => (f.weak ? c.weakRef : `${f.delta > 0 ? "+" : "−"}${Math.abs(Math.round(f.delta * 100))}${pct}`)), raw: fps.map((f) => (f.weak ? 0 : f.delta)), best: "min", emphasis: true },
          { label: c.usageCost, Icon: Calculator, values: tcos.map((tc) => `${formatNumber(tc.perYear)} ${dh}/${locale === "fr" ? "an" : "سنة"}`), raw: tcos.map((tc) => tc.perYear), best: "min", emphasis: true },
          { label: c.costPerKm, Icon: Road, values: tcos.map((tc) => `${tc.perKm.toFixed(2)} ${dh}`), raw: tcos.map((tc) => tc.perKm), best: "min" },
          { label: c.resale3y, Icon: TrendingDown, values: tcos.map((tc) => `${formatNumber(tc.resaleValue)} ${dh}`), raw: tcos.map((tc) => tc.resaleValue), best: "max" },
        ],
      },
      {
        title: c.groupSpecs,
        Icon: Car,
        rows: [
          { label: c.year, Icon: Calendar, values: items.map((v) => v.year), raw: items.map((v) => v.year), best: "max" },
          { label: c.km, Icon: Gauge, values: items.map((v) => `${formatNumber(v.km)} ${km_}`), raw: items.map((v) => v.km), best: "min" },
          { label: c.fuel, Icon: Fuel, values: items.map((v) => L.fuel[v.fuel]) },
          { label: c.gearbox, Icon: Gearbox, values: items.map((v) => L.gearbox[v.gearbox]) },
          { label: c.body, Icon: Car, values: items.map((v) => L.body[v.body]) },
          { label: c.consumption, Icon: Fuel, values: items.map((v) => `${v.consumption} ${locale === "fr" ? "L" : "ل"}/100${km_}`), raw: items.map((v) => v.consumption), best: "min" },
          { label: c.fiscalPower, Icon: Engine, values: items.map((v) => `${v.fiscalPower} ${locale === "fr" ? "CV" : "حصان"}`), raw: items.map((v) => v.fiscalPower), best: "min" },
          { label: c.city, Icon: MapPin, values: items.map((v) => cityLabel(v.city, locale)) },
        ],
      },
      {
        title: c.groupExpenses,
        Icon: Coins,
        rows: [
          { label: c.fuelExpense, Icon: Fuel, values: items.map((_, i) => `${formatNumber(line(i, "fuel"))} ${dh}`), raw: items.map((_, i) => line(i, "fuel")), best: "min" },
          { label: c.insurance, Icon: Shield, values: items.map((_, i) => `${formatNumber(line(i, "insurance"))} ${dh}`), raw: items.map((_, i) => line(i, "insurance")), best: "min" },
          { label: c.vignette, Icon: Coins, values: items.map((_, i) => (line(i, "vignette") ? `${formatNumber(line(i, "vignette"))} ${dh}` : c.exempt)), raw: items.map((_, i) => line(i, "vignette")), best: "min" },
          { label: c.maintenance, Icon: Wrench, values: items.map((_, i) => `${formatNumber(line(i, "maintenance"))} ${dh}`), raw: items.map((_, i) => line(i, "maintenance")), best: "min" },
        ],
      },
      {
        title: c.groupTrust,
        Icon: ShieldCheck,
        rows: [
          { label: c.owners, Icon: Users, values: items.map((v) => v.owners), raw: items.map((v) => v.owners), best: "min" },
          { label: c.condition, Icon: BadgeCheck, values: items.map((v) => L.condition[v.condition]) },
          { label: c.serviceBook, Icon: Wrench, values: items.map((v) => (v.serviceBook ? c.available : c.notAvailable)), raw: items.map((v) => (v.serviceBook ? 1 : 0)), best: "max" },
          { label: c.inspection, Icon: BadgeCheck, values: items.map((v) => (v.inspected ? c.done : c.notDone)), raw: items.map((v) => (v.inspected ? 1 : 0)), best: "max" },
        ],
      },
    ];
  }, [items, t, locale, dh, km_, pct, L]);

  if (!ready) return null;

  if (!items.length) {
    return (
      <div className="card flex flex-col items-center p-14 text-center">
        <span
          className="grid h-16 w-16 place-items-center rounded-2xl"
          style={{ background: "var(--data-soft)", color: "var(--data)" }}
        >
          <Scale size={30} />
        </span>
        <h2 className="mt-5 text-lg font-bold">{t.compareClient.emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {t.compareClient.emptyLead}
        </p>
        <Link href="/vehicles" className="btn btn-primary mt-6"><Car size={16} /> {t.compareClient.browse}</Link>
      </div>
    );
  }

  function bestIndex(row: Row): number | null {
    if (!row.raw || !row.best || row.raw.length < 2) return null;
    const target = row.best === "min" ? Math.min(...row.raw) : Math.max(...row.raw);
    if (row.raw.every((x) => x === target)) return null;
    return row.raw.indexOf(target);
  }

  const wins = items.map((_, i) =>
    groups.flatMap((g) => g.rows).filter((r) => bestIndex(r) === i).length,
  );
  const champion = wins.indexOf(Math.max(...wins));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          <span className="num">{items.length}</span> {t.compareClient.of3} <span className="num">3</span> {t.compareClient.vehicles3}
        </p>
        <button onClick={clearCompare} className="btn btn-ghost btn-sm"><Trash size={13} /> {t.compareClient.clearAll}</button>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-start">
          <thead>
            <tr>
              <th className="w-40 p-2 align-bottom" />
              {items.map((v, i) => (
                <th key={v.id} className="p-2 align-bottom" style={{ width: `${72 / items.length}%` }}>
                  <div className="card relative overflow-hidden" style={{ borderColor: i === champion && items.length > 1 ? "var(--brand)" : undefined }}>
                    {i === champion && items.length > 1 && (
                      <span
                        className="tag absolute top-2 start-2 z-10"
                        style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
                      >
                        <Award size={11} /> {t.compareClient.bestOverall}
                      </span>
                    )}
                    <div className="relative aspect-[16/10]">
                      <VehicleArt id={v.id} kind={v.kind} body={artShape(v)} color={v.color} className="h-full w-full" />
                      <button
                        onClick={() => toggleCompare(v.id)}
                        aria-label={`${t.compareClient.remove} ${v.make} ${v.model}`}
                        className="absolute top-2 end-2 grid h-7 w-7 place-items-center rounded-lg backdrop-blur-md"
                        style={{ background: "rgba(10,30,61,0.6)", color: "#fff" }}
                      >
                        <Close size={13} />
                      </button>
                    </div>
                    <div className="p-3 text-center">
                      <Link href={vehicleHref(v)} className="block truncate text-[13px] font-bold hover:text-[var(--brand)]">
                        {v.make} {v.model}
                      </Link>
                      <p className="truncate text-[10px]" style={{ color: "var(--text-dim)" }}>{v.version}</p>
                      <div className="mt-2 flex justify-center">
                        <TrustRing score={trustOf(v).score} grade={trustOf(v).grade} size={44} stroke={4} showLabel={false} />
                      </div>
                      <div className="mt-2">
                        <Price value={v.price} className="text-[14px] font-extrabold" />
                      </div>
                      <p className="num mt-1.5 text-[10px]" style={{ color: "var(--text-dim)" }}>
                        {wins[i]} {t.compareClient.wins}
                      </p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {groups.map((g) => (
            <tbody key={g.title}>
              <tr>
                <td colSpan={items.length + 1} className="pt-6 pb-2">
                  <h3 className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--brand)" }}>
                    <g.Icon size={14} /> {g.title}
                  </h3>
                </td>
              </tr>
              {g.rows.map((row) => {
                const best = bestIndex(row);
                return (
                  <tr key={row.label}>
                    <th
                      className="border-t p-2.5 text-[11.5px] font-semibold"
                      style={{ borderColor: "var(--line-soft)", color: row.emphasis ? "var(--text)" : "var(--text-muted)" }}
                      scope="row"
                    >
                      <span className="flex items-center gap-1.5">
                        <row.Icon size={13} style={{ color: "var(--text-dim)" }} />
                        {row.label}
                      </span>
                    </th>
                    {row.values.map((val, i) => (
                      <td
                        key={i}
                        className="border-t p-2.5 text-center text-[12px]"
                        style={{
                          borderColor: "var(--line-soft)",
                          background: best === i ? "var(--good-soft)" : undefined,
                          color: best === i ? "var(--good)" : "var(--text-muted)",
                          fontWeight: best === i || row.emphasis ? 700 : 400,
                        }}
                      >
                        <span className="inline-flex items-center gap-1">
                          {best === i && <Check size={12} />}
                          <Mixed text={val} />
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>

      <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        <Check size={13} className="mt-px shrink-0" style={{ color: "var(--good)" }} />
        {t.compareClient.legendA}{" "}
        <span className="num">15 000</span> {t.compareClient.legendB}<span className="num">8 000</span>{" "}
        {t.compareClient.legendC}
      </p>
    </div>
  );
}
