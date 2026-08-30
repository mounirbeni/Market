"use client";

import { useState } from "react";
import { SafeImg } from "./SafeImg";

/* ============================================================
   الصورة الشخصية — الصورة الحقيقية إلا كانت مرفوعة، وإلا حرف
   أول من الاسم كما كان. className خاصها تجيب القياس والاستدارة
   (بحال h-12 w-12 rounded-xl) باش تبقى مطابقة للبلاصة.
   ============================================================ */
export function Avatar({
  src,
  name,
  className,
  style,
}: {
  src?: string | null;
  name: string;
  className: string;
  style?: React.CSSProperties;
}) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <SafeImg
        src={src}
        alt=""
        className={`${className} shrink-0 object-cover`}
        onBroken={() => setBroken(true)}
      />
    );
  }

  return (
    <span
      className={`${className} grid shrink-0 place-items-center font-extrabold`}
      style={style}
      aria-hidden="true"
    >
      {name.trim().slice(0, 1)}
    </span>
  );
}
