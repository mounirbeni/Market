"use client";

import { useState } from "react";
import { VehicleArt } from "@/components/VehicleArt";
import { artShape } from "@/lib/artshape";
import type { Vehicle } from "@/lib/types";
import { useApp } from "@/store/app";
import {
  BadgeCheck, Camera, ChevronLeft, ChevronRight, Heart, Key, Scale, Video,
} from "@/components/icons";

export function Gallery({ v }: { v: Vehicle }) {
  const [active, setActive] = useState(0);
  const { isFavorite, toggleFavorite, inCompare, toggleCompare } = useApp();
  const shots = Math.min(v.photos, 8);
  const fav = isFavorite(v.id);
  const cmp = inCompare(v.id);
  const shape = artShape(v);

  const go = (d: number) => setActive((a) => (a + d + shots) % shots);

  return (
    <div className="min-w-0">
      <div className="card relative overflow-hidden">
        <div className="aspect-[16/10]">
          <VehicleArt
            id={v.id}
            kind={v.kind}
            body={shape}
            color={v.color}
            variant={active}
            className="h-full w-full"
            label={`${v.make} ${v.model} — صورة ${active + 1}`}
          />
        </div>

        <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-1.5">
          {v.inspected && (
            <span className="tag border backdrop-blur-md" style={{ background: "rgba(18,169,124,0.2)", borderColor: "rgba(52,211,153,0.4)", color: "var(--color-atlas-300)" }}>
              <BadgeCheck size={12} /> مفحوصة من طريق
            </span>
          )}
          {v.firstHand && (
            <span className="tag border backdrop-blur-md" style={{ background: "rgba(8,11,16,0.6)", borderColor: "rgba(255,255,255,0.12)", color: "#e8edf5" }}>
              <Key size={12} /> يد أولى
            </span>
          )}
          {v.hasVideo && (
            <span className="tag border backdrop-blur-md" style={{ background: "rgba(8,11,16,0.6)", borderColor: "rgba(255,255,255,0.12)", color: "#e8edf5" }}>
              <Video size={12} /> فيديو
            </span>
          )}
        </div>

        <div className="absolute top-3 left-3 flex gap-1.5">
          <button
            onClick={() => toggleFavorite(v.id)}
            aria-pressed={fav}
            aria-label="المفضلة"
            className="grid h-9 w-9 place-items-center rounded-lg border backdrop-blur-md transition"
            style={{
              background: fav ? "var(--bad)" : "rgba(8,11,16,0.55)",
              borderColor: fav ? "transparent" : "rgba(255,255,255,0.12)",
              color: "#fff",
            }}
          >
            <Heart size={16} filled={fav} />
          </button>
          <button
            onClick={() => toggleCompare(v.id)}
            aria-pressed={cmp}
            aria-label="المقارنة"
            className="grid h-9 w-9 place-items-center rounded-lg border backdrop-blur-md transition"
            style={{
              background: cmp ? "var(--data)" : "rgba(8,11,16,0.55)",
              borderColor: cmp ? "transparent" : "rgba(255,255,255,0.12)",
              color: "#fff",
            }}
          >
            <Scale size={16} />
          </button>
        </div>

        {shots > 1 && (
          <>
            <button
              onClick={() => go(1)}
              aria-label="الصورة السابقة"
              className="absolute top-1/2 right-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition hover:scale-105"
              style={{ background: "rgba(8,11,16,0.55)", borderColor: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => go(-1)}
              aria-label="الصورة التالية"
              className="absolute top-1/2 left-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-md transition hover:scale-105"
              style={{ background: "rgba(8,11,16,0.55)", borderColor: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}

        <span
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] backdrop-blur-md"
          style={{ background: "rgba(8,11,16,0.6)", color: "#e8edf5" }}
        >
          <Camera size={12} />
          <span className="num">{active + 1} / {shots}</span>
        </span>
      </div>

      <div className="mt-3 flex min-w-0 gap-2 overflow-x-auto no-scrollbar pb-1">
        {Array.from({ length: shots }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`صورة ${i + 1}`}
            aria-current={active === i}
            className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition"
            style={{ borderColor: active === i ? "var(--brand)" : "transparent", opacity: active === i ? 1 : 0.6 }}
          >
            <VehicleArt id={v.id} kind={v.kind} body={shape} color={v.color} variant={i} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
