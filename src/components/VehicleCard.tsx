"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Vehicle } from "@/lib/types";
import { AR, formatNumber, timeAgo } from "@/lib/format";
import { NOW } from "@/lib/data/seed";
import { cityName } from "@/lib/cities";
import { fairPriceOf, trustOf } from "@/lib/market";
import { artShape } from "@/lib/artshape";
import { useApp } from "@/store/app";
import { VehicleArt } from "./VehicleArt";
import { TrustDot } from "./TrustBadge";
import { FairPriceTag } from "./FairPriceMeter";
import { Price } from "./Price";
import { Mixed } from "./Mixed";
import {
  BadgeCheck, Calendar, Camera, Clock, FUEL_ICONS, Gauge, Gearbox,
  Heart, MapPin, Scale, Sparkle, Video,
} from "./icons";

function SpecRow({ v }: { v: Vehicle }) {
  const FuelIcon = FUEL_ICONS[v.fuel];
  const items = [
    { Icon: Calendar, text: String(v.year) },
    { Icon: Gauge, text: `${formatNumber(v.km)} كم` },
    { Icon: FuelIcon, text: AR.fuel[v.fuel] },
    { Icon: Gearbox, text: v.gearbox === "automatique" ? "أوتوماتيك" : "يدوية" },
  ];
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      {items.map(({ Icon, text }, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--text-muted)" }}>
          <Icon size={14} style={{ color: "var(--text-dim)" }} />
          <Mixed text={text} className="font-medium" />
        </div>
      ))}
    </div>
  );
}

function ActionButtons({ v, side = "left" }: { v: Vehicle; side?: "left" | "right" }) {
  const { isFavorite, toggleFavorite, inCompare, toggleCompare } = useApp();
  const fav = isFavorite(v.id);
  const cmp = inCompare(v.id);
  return (
    <div className={`absolute top-3 z-10 flex flex-col gap-1.5 ${side === "left" ? "left-3" : "right-3"}`}>
      <button
        onClick={(e) => { e.preventDefault(); toggleFavorite(v.id); }}
        aria-label={fav ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
        aria-pressed={fav}
        className="grid h-8 w-8 place-items-center rounded-lg border backdrop-blur-md transition"
        style={{
          background: fav ? "var(--bad)" : "rgba(8,11,16,0.55)",
          borderColor: fav ? "transparent" : "rgba(255,255,255,0.12)",
          color: "#fff",
        }}
      >
        <Heart size={15} filled={fav} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); toggleCompare(v.id); }}
        aria-label={cmp ? "إزالة من المقارنة" : "أضف إلى المقارنة"}
        aria-pressed={cmp}
        className="grid h-8 w-8 place-items-center rounded-lg border backdrop-blur-md transition"
        style={{
          background: cmp ? "var(--data)" : "rgba(8,11,16,0.55)",
          borderColor: cmp ? "transparent" : "rgba(255,255,255,0.12)",
          color: "#fff",
        }}
      >
        <Scale size={15} />
      </button>
    </div>
  );
}

function Badges({ v }: { v: Vehicle }) {
  return (
    <div className="absolute top-3 right-3 z-10 flex flex-wrap justify-end gap-1.5">
      {v.boosted && (
        <span className="tag border backdrop-blur-md" style={{ background: "rgba(227,165,47,0.16)", borderColor: "rgba(227,165,47,0.35)", color: "var(--color-gold-300)" }}>
          <Sparkle size={11} /> مميّز
        </span>
      )}
      {v.inspected && (
        <span className="tag border backdrop-blur-md" style={{ background: "rgba(18,169,124,0.18)", borderColor: "rgba(52,211,153,0.35)", color: "var(--color-atlas-300)" }}>
          <BadgeCheck size={11} /> مفحوصة
        </span>
      )}
    </div>
  );
}

function MediaCount({ v }: { v: Vehicle }) {
  return (
    <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
      <span className="tag backdrop-blur-md" style={{ background: "rgba(8,11,16,0.6)", color: "#e8edf5" }}>
        <Camera size={11} /> <span className="num">{v.photos}</span>
      </span>
      {v.hasVideo && (
        <span className="tag backdrop-blur-md" style={{ background: "rgba(8,11,16,0.6)", color: "#e8edf5" }}>
          <Video size={11} />
        </span>
      )}
    </div>
  );
}

/* ============================================================
   بطاقة شبكية
   ============================================================ */
export function VehicleCard({ v, compact = false }: { v: Vehicle; compact?: boolean }) {
  const trust = useMemo(() => trustOf(v), [v]);
  const fp = useMemo(() => fairPriceOf(v), [v]);

  return (
    <article className="card card-hover group relative overflow-hidden">
      <ActionButtons v={v} />
      <Link href={`/vehicles/${v.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <VehicleArt
            id={v.id}
            kind={v.kind}
            body={artShape(v)}
            color={v.color}
            className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            label={`${v.make} ${v.model} ${v.year}`}
          />
          <Badges v={v} />
          <MediaCount v={v} />
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold leading-snug transition-colors group-hover:text-[var(--brand)]">
                {v.make} {v.model}
              </h3>
              <p className="mt-0.5 truncate text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                {v.version}
              </p>
            </div>
            <TrustDot trust={trust} />
          </div>

          <SpecRow v={v} />

          <div
            className="mt-3.5 flex items-end justify-between gap-2 border-t pt-3"
            style={{ borderColor: "var(--line-soft)" }}
          >
            <div className="min-w-0">
              <Price value={v.price} className="text-[19px] font-extrabold tracking-tight" />
              <div className="mt-1.5"><FairPriceTag fp={fp} /></div>
            </div>
            <div
              className="flex shrink-0 flex-col items-end gap-1 text-[11px]"
              style={{ color: "var(--text-dim)" }}
            >
              <span className="flex items-center gap-1"><MapPin size={12} /> {cityName(v.city)}</span>
              {!compact && (
                <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(v.publishedAt, NOW)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ============================================================
   بطاقة أفقية (عرض القائمة)
   ============================================================ */
export function VehicleRow({ v }: { v: Vehicle }) {
  const trust = useMemo(() => trustOf(v), [v]);
  const fp = useMemo(() => fairPriceOf(v), [v]);
  const FuelIcon = FUEL_ICONS[v.fuel];

  return (
    <article className="card card-hover group relative overflow-hidden">
      <ActionButtons v={v} side="right" />
      <Link href={`/vehicles/${v.id}`} className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-auto sm:w-[280px] sm:shrink-0">
          <VehicleArt
            id={v.id}
            kind={v.kind}
            body={artShape(v)}
            color={v.color}
            className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            label={`${v.make} ${v.model} ${v.year}`}
          />
          <MediaCount v={v} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-bold transition-colors group-hover:text-[var(--brand)]">
                    {v.make} {v.model}
                  </h3>
                  {v.boosted && <span className="tag tag-warn"><Sparkle size={11} /> مميّز</span>}
                  {v.inspected && <span className="tag tag-good"><BadgeCheck size={11} /> مفحوصة</span>}
                </div>
                <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-dim)" }}>
                  {v.version}
                </p>
              </div>
              <TrustDot trust={trust} />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="chip chip-plain"><Calendar size={12} /><span className="num">{v.year}</span></span>
              <span className="chip chip-plain"><Gauge size={12} /><span className="num">{formatNumber(v.km)}</span> كم</span>
              <span className="chip chip-plain"><FuelIcon size={12} />{AR.fuel[v.fuel]}</span>
              <span className="chip chip-plain"><Gearbox size={12} />{AR.gearbox[v.gearbox]}</span>
              <span className="chip chip-plain"><MapPin size={12} />{cityName(v.city)}</span>
            </div>

            <p className="mt-3 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {v.description}
            </p>
          </div>

          <div
            className="flex flex-wrap items-end justify-between gap-2 border-t pt-3"
            style={{ borderColor: "var(--line-soft)" }}
          >
            <div className="flex items-center gap-3">
              <Price value={v.price} className="text-xl font-extrabold tracking-tight" />
              <FairPriceTag fp={fp} />
            </div>
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
              <Clock size={12} /> {timeAgo(v.publishedAt, NOW)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
