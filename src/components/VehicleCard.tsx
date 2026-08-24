"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Vehicle } from "@/lib/types";
import { AR, formatKm, timeAgo } from "@/lib/format";
import { NOW } from "@/lib/data/seed";
import { cityName } from "@/lib/cities";
import { fairPriceOf, trustOf } from "@/lib/market";
import { useApp } from "@/store/app";
import { VehicleArt } from "./VehicleArt";
import { TrustPill } from "./TrustBadge";
import { FairPriceTag } from "./FairPriceMeter";
import { Price } from "./Price";

export function VehicleCard({ v, compact = false }: { v: Vehicle; compact?: boolean }) {
  const { isFavorite, toggleFavorite, inCompare, toggleCompare } = useApp();
  const trust = useMemo(() => trustOf(v), [v]);
  const fp = useMemo(() => fairPriceOf(v), [v]);
  const fav = isFavorite(v.id);
  const cmp = inCompare(v.id);

  return (
    <article className="card card-hover group relative overflow-hidden">
      <Link href={`/vehicles/${v.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <VehicleArt
            id={v.id}
            kind={v.kind}
            body={v.body}
            className="h-full w-full transition-transform duration-700 group-hover:scale-105"
            label={`${v.make} ${v.model} ${v.year}`}
          />
          <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1.5">
            {v.boosted && (
              <span className="chip !bg-[color-mix(in_oklab,var(--color-saffron-500)_22%,black)] !text-[var(--color-saffron-400)] !border-transparent font-bold">
                ★ مميّز
              </span>
            )}
            {v.inspected && (
              <span className="chip !bg-[color-mix(in_oklab,var(--color-atlas-500)_25%,black)] !text-[var(--color-atlas-400)] !border-transparent font-bold">
                ✓ مفحوصة
              </span>
            )}
          </div>
          <div className="absolute bottom-2.5 right-2.5 flex gap-1.5">
            <span className="chip !bg-black/55 !text-white !border-white/15 backdrop-blur">
              <span className="num">{v.photos}</span> صور
            </span>
            {v.hasVideo && (
              <span className="chip !bg-black/55 !text-white !border-white/15 backdrop-blur">
                ▶ فيديو
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
        <button
          onClick={() => toggleFavorite(v.id)}
          aria-label={fav ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
          aria-pressed={fav}
          className="grid h-8 w-8 place-items-center rounded-full backdrop-blur transition"
          style={{
            background: fav ? "var(--color-clay-500)" : "rgba(0,0,0,0.5)",
            color: "#fff",
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
        <button
          onClick={() => toggleCompare(v.id)}
          aria-label={cmp ? "إزالة من المقارنة" : "أضف إلى المقارنة"}
          aria-pressed={cmp}
          className="grid h-8 w-8 place-items-center rounded-full backdrop-blur transition"
          style={{
            background: cmp ? "var(--color-majorelle-500)" : "rgba(0,0,0,0.5)",
            color: "#fff",
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h10M4 17h6" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/vehicles/${v.id}`}>
              <h3 className="truncate text-[15px] font-extrabold leading-tight hover:text-[var(--accent)]">
                {v.make} {v.model}
              </h3>
            </Link>
            <p className="truncate text-xs" style={{ color: "var(--text-dim)" }}>
              {v.version}
            </p>
          </div>
          <TrustPill trust={trust} />
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
          <span className="chip"><span className="num">{v.year}</span></span>
          <span className="chip"><span className="num">{formatKm(v.km).replace(" كم", "")}</span> كم</span>
          <span className="chip">{AR.fuel[v.fuel]}</span>
          {!compact && <span className="chip">{AR.gearbox[v.gearbox]}</span>}
        </div>

        <div className="flex items-end justify-between gap-2 border-t pt-3" style={{ borderColor: "var(--line-soft)" }}>
          <div>
            <Price value={v.price} className="text-lg font-extrabold" />
            <div className="mt-1"><FairPriceTag fp={fp} /></div>
          </div>
          <div className="text-left text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            <div>📍 {cityName(v.city)}</div>
            <div>{timeAgo(v.publishedAt, NOW)}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
