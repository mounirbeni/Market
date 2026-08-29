"use client";

import { useState, ViewTransition } from "react";
import { VehicleArt } from "@/components/VehicleArt";
import { SafeImg } from "@/components/SafeImg";
import { artShape } from "@/lib/artshape";
import type { Vehicle } from "@/lib/types";
import { useApp } from "@/store/app";
import {
  BadgeCheck, Camera, ChevronLeft, ChevronRight, Heart, Key, Scale, Video,
} from "@/components/icons";

export function Gallery({ v }: { v: Vehicle }) {
  const [active, setActive] = useState(0);
  const { isFavorite, toggleFavorite, inCompare, toggleCompare } = useApp();
  const fav = isFavorite(v.id);
  const cmp = inCompare(v.id);
  const shape = artShape(v);

  /* الصور الحقيقية إلا كانو مرفوعين — وإلا كنرسمو المركبة.

     اللائحة كتبقى ثابتة حتى ملي شي صورة ماتحمّلاتش — كنعلّموها
     وكنرسمو بلاصتها. لو حيّدناها من اللائحة، الأرقام كيتزاحو
     والمصغّرات كيتخلّطو. */
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const markBroken = (url: string) => setBroken((b) => (b.has(url) ? b : new Set(b).add(url)));

  const photos = (v.media ?? []).filter((m) => m.kind === "photo");
  const usable = photos.filter((m) => !broken.has(m.url)).length;
  const shots = usable > 0 ? photos.length : Math.min(v.photos, 8) || 1;

  /* الفيديو كيجي كآخر بلاصة فالمعرض — بعد كل الصور */
  const clip = (v.media ?? []).find((m) => m.kind === "video") ?? null;
  const slides = shots + (clip ? 1 : 0);
  const onClip = Boolean(clip) && active === shots;

  /** الصورة ديال هاد البلاصة، إلا كانت مازال صالحة */
  const shotAt = (i: number) => {
    const m = photos[i];
    return m && !broken.has(m.url) ? m : null;
  };

  const go = (d: number) => setActive((a) => (a + d + slides) % slides);

  return (
    <div className="min-w-0">
      <div className="card relative overflow-hidden">
        <div className="aspect-[16/10]">
          <ViewTransition name={`vehicle-${v.id}`} share="morph" default="none">
            {onClip ? (
              /* preload="metadata" باش ماننزّلوش الفيديو كامل بلا داعي.
                 playsInline ضروري: بلاه iPhone كيفتح الفيديو فوق الصفحة. */
              <video
                src={clip!.url}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full bg-black object-contain"
              />
            ) : shotAt(active) ? (
              <SafeImg
                src={shotAt(active)!.url}
                alt={`${v.make} ${v.model} — صورة ${active + 1}`}
                className="h-full w-full object-cover"
                loading={active === 0 ? "eager" : "lazy"}
                onBroken={markBroken}
              />
            ) : (
              <VehicleArt
                id={v.id}
                kind={v.kind}
                body={shape}
                color={v.color}
                variant={active}
                className="h-full w-full"
                label={`${v.make} ${v.model} — صورة ${active + 1}`}
              />
            )}
          </ViewTransition>
        </div>

        <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-1.5">
          {v.inspected && (
            <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
              <BadgeCheck size={12} /> مفحوصة من طريق
            </span>
          )}
          {v.firstHand && (
            <span className="tag" style={{ background: "var(--brand)", color: "#fff" }}>
              <Key size={12} /> يد أولى
            </span>
          )}
          {v.hasVideo && (
            <span className="tag" style={{ background: "rgba(10,30,61,0.75)", color: "#fff" }}>
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
              background: fav ? "var(--bad)" : "var(--surface-1)",
              borderColor: fav ? "transparent" : "var(--line)",
              color: fav ? "#fff" : "var(--text-muted)",
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
              background: cmp ? "var(--data)" : "var(--surface-1)",
              borderColor: cmp ? "transparent" : "var(--line)",
              color: cmp ? "#fff" : "var(--text-muted)",
            }}
          >
            <Scale size={16} />
          </button>
        </div>

        {slides > 1 && (
          <>
            <button
              onClick={() => go(1)}
              aria-label="الصورة السابقة"
              className="absolute top-1/2 right-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border shadow-md transition hover:scale-105"
              style={{ background: "var(--surface-1)", borderColor: "var(--line)", color: "var(--text)" }}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => go(-1)}
              aria-label="الصورة التالية"
              className="absolute top-1/2 left-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border shadow-md transition hover:scale-105"
              style={{ background: "var(--surface-1)", borderColor: "var(--line)", color: "var(--text)" }}
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}

        <span
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] backdrop-blur-md"
          style={{ background: "rgba(10,30,61,0.72)", color: "#fff" }}
        >
          {onClip ? <Video size={12} /> : <Camera size={12} />}
          <span className="num">{active + 1} / {slides}</span>
        </span>
      </div>

      <div className="mt-3 flex min-w-0 gap-2 overflow-x-auto no-scrollbar pb-1">
        {Array.from({ length: slides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={clip && i === shots ? "الفيديو" : `صورة ${i + 1}`}
            aria-current={active === i}
            className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition"
            style={{ borderColor: active === i ? "var(--brand)" : "transparent", opacity: active === i ? 1 : 0.6 }}
          >
            {clip && i === shots ? (
              <span className="grid h-full w-full place-items-center bg-black text-white">
                <Video size={18} />
              </span>
            ) : shotAt(i) ? (
              <SafeImg
                src={shotAt(i)!.thumbUrl ?? shotAt(i)!.url}
                alt=""
                className="h-full w-full object-cover"
                onBroken={() => markBroken(shotAt(i)!.url)}
              />
            ) : (
              <VehicleArt id={v.id} kind={v.kind} body={shape} color={v.color} variant={i} className="h-full w-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
