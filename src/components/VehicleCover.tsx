"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { artShape } from "@/lib/artshape";
import { VehicleArt } from "./VehicleArt";
import { SafeImg } from "./SafeImg";

/**
 * صورة الغلاف ديال مركبة.
 *
 * إلا كان البائع رفع صور حقيقية كنوريو أول وحدة، وإلا كنرسمو المركبة
 * بالرسم المولّد. هكا الإعلانات القديمة والجديدة كيبانو بنفس الشكل.
 *
 * كنستعملو <img> عادي ماشي next/image حيت الصور كتجي من Vercel Blob
 * وهي أصلاً على CDN — تحسين إضافي غير كيزيد استدعاءات بلا فايدة.
 *
 * إلا فشلات الصورة (تمسحات من الخزّان، ولا الشبكة قاطعة) كنرجعو
 * للرسم — خير من أيقونة مكسّرة فوسط البطاقة.
 */
export function VehicleCover({
  v,
  className = "",
  variant,
  eager = false,
}: {
  v: Vehicle;
  className?: string;
  /** رقم الصورة — كيخدم غير مع الرسم المولّد */
  variant?: number;
  eager?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const photo = v.cover ?? v.media?.find((m) => m.kind === "photo")?.url;

  if (photo && !broken) {
    return (
      <SafeImg
        src={photo}
        alt={`${v.make} ${v.model} ${v.year}`}
        className={`object-cover ${className}`}
        loading={eager ? "eager" : "lazy"}
        onBroken={() => setBroken(true)}
      />
    );
  }

  return (
    <VehicleArt
      id={v.id}
      kind={v.kind}
      body={artShape(v)}
      color={v.color}
      variant={variant}
      className={className}
      label={`${v.make} ${v.model} ${v.year}`}
    />
  );
}
