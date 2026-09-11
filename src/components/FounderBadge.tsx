"use client";

import { useDict } from "@/lib/i18n/client";
import { Star } from "./icons";

/* ============================================================
   شارة «مؤسس طريق»

   شارة هوية، ماشي شارة ثقة: كتقول «هاد الحساب ديال صاحب
   المنصة» وصافي. علاش هادا مهم: شارات الثقة الأخرى (هوية موثقة،
   فحص مستقل) كتوعد المشتري بشي حاجة تّحققات؛ هادي كتوضّح غير
   مَن هو البائع، باش الزائر يفهم علاش الإعلان مميّز.

   تدرّج الشعار نفسو — الشارة كتبان جزء من الهوية البصرية ماشي
   لون جديد طايح فالوسط.
   ============================================================ */

const GRADIENT = "linear-gradient(135deg, #5a8ef7 0%, #1f5fe0 55%, #103fa3 100%)";

export function FounderBadge({
  size = "md",
  className = "",
}: {
  /** sm للبطاقات الصغيرة، md للبروفايل */
  size?: "sm" | "md";
  className?: string;
}) {
  const t = useDict();
  const sm = size === "sm";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-bold ${
        sm ? "px-1.5 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-[11px]"
      } ${className}`}
      style={{ background: GRADIENT, color: "#fff" }}
      title={t.founder.title}
    >
      <Star size={sm ? 9 : 11} filled />
      {t.founder.badge}
    </span>
  );
}
