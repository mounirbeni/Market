"use client";

import { useState } from "react";
import { VehicleArt } from "@/components/VehicleArt";
import { artShape } from "@/lib/artshape";
import type { Vehicle } from "@/lib/types";
import { useApp } from "@/store/app";

export function Gallery({ v }: { v: Vehicle }) {
  const [active, setActive] = useState(0);
  const { isFavorite, toggleFavorite, inCompare, toggleCompare } = useApp();
  const shots = Math.min(v.photos, 8);
  const fav = isFavorite(v.id);
  const cmp = inCompare(v.id);

  return (
    <div>
      <div className="card relative overflow-hidden">
        <div className="aspect-[16/10]">
          <VehicleArt
            id={v.id}
            kind={v.kind}
            body={artShape(v)}
            variant={active}
            className="h-full w-full"
            label={`${v.make} ${v.model} — صورة ${active + 1}`}
          />
        </div>

        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
          {v.inspected && (
            <span className="chip !border-transparent font-bold"
              style={{ background: "color-mix(in oklab, var(--color-atlas-500) 30%, black)", color: "var(--color-atlas-400)" }}>
              ✓ مفحوصة من طريق
            </span>
          )}
          {v.firstHand && (
            <span className="chip !border-transparent !bg-black/55 !text-white backdrop-blur">يد أولى</span>
          )}
          {v.hasVideo && (
            <span className="chip !border-transparent !bg-black/55 !text-white backdrop-blur">▶ فيديو</span>
          )}
        </div>

        <div className="absolute top-3 left-3 flex gap-1.5">
          <button
            onClick={() => toggleFavorite(v.id)}
            aria-pressed={fav}
            className="grid h-9 w-9 place-items-center rounded-full backdrop-blur"
            style={{ background: fav ? "var(--color-clay-500)" : "rgba(0,0,0,0.5)", color: "#fff" }}
            aria-label="المفضلة"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </button>
          <button
            onClick={() => toggleCompare(v.id)}
            aria-pressed={cmp}
            className="grid h-9 w-9 place-items-center rounded-full backdrop-blur"
            style={{ background: cmp ? "var(--color-majorelle-500)" : "rgba(0,0,0,0.5)", color: "#fff" }}
            aria-label="المقارنة"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h10M4 17h6" />
            </svg>
          </button>
        </div>

        <span className="num absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur">
          {active + 1} / {shots}
        </span>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {Array.from({ length: shots }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`صورة ${i + 1}`}
            aria-current={active === i}
            className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition"
            style={{ borderColor: active === i ? "var(--accent)" : "transparent" }}
          >
            <VehicleArt id={v.id} kind={v.kind} body={artShape(v)} variant={i} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
