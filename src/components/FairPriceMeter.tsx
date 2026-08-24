"use client";

import type { FairPrice } from "@/lib/market";
import { Price } from "./Price";
import { formatNumber } from "@/lib/format";

const TONES: Record<string, { color: string; icon: string }> = {
  "tres-bas": { color: "var(--color-atlas-400)", icon: "▼▼" },
  bas: { color: "var(--color-atlas-400)", icon: "▼" },
  juste: { color: "var(--color-saffron-400)", icon: "=" },
  haut: { color: "var(--color-clay-400)", icon: "▲" },
  "tres-haut": { color: "var(--color-clay-500)", icon: "▲▲" },
};

export function FairPriceTag({ fp }: { fp: FairPrice }) {
  const tone = TONES[fp.verdict];
  const pct = Math.round(Math.abs(fp.delta) * 100);

  if (fp.weak) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
        style={{ background: "var(--bg-inset)", color: "var(--text-dim)" }}
        title="عدد الإعلانات المشابهة غير كافٍ لحساب ثمن مرجعي دقيق"
      >
        مراجع محدودة
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{
        background: `color-mix(in oklab, ${tone.color} 15%, transparent)`,
        color: tone.color,
      }}
      title={`الثمن المرجعي: ${formatNumber(fp.estimate.mid)} د.م`}
    >
      <span className="num text-[9px]">{tone.icon}</span>
      {fp.verdict === "juste" ? "ثمن عادل" : `${pct}٪ ${fp.delta < 0 ? "تحت" : "فوق"} السوق`}
    </span>
  );
}

export function FairPriceMeter({ fp, price }: { fp: FairPrice; price: number }) {
  const tone = TONES[fp.verdict];
  const pos = Math.max(14, Math.min(86, fp.position * 100));
  return (
    <div className="card p-5" style={{ background: "var(--bg-inset)" }}>
      {fp.weak && (
        <p
          className="mb-4 rounded-lg p-2.5 text-[11px] leading-relaxed"
          style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}
        >
          ⓘ ماكايناش بزاف ديال الإعلانات المشابهة لهاد المركبة، لهذا هاد الثمن المرجعي
          تقريبي — خدو كمؤشر أولي فقط.
        </p>
      )}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold">مؤشر الثمن العادل</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
            محسوب من <span className="num">{fp.estimate.sampleSize}</span> إعلاناً مشابهاً
            بعد تعديل السنة والكيلومتراج والحالة
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-extrabold whitespace-nowrap"
          style={{
            background: `color-mix(in oklab, ${tone.color} 16%, transparent)`,
            color: tone.color,
          }}
        >
          {fp.label}
        </span>
      </div>

      <div className="relative mt-8 mb-2 h-3 rounded-full"
        style={{
          background:
            "linear-gradient(to left, color-mix(in oklab, var(--color-clay-500) 70%, transparent), color-mix(in oklab, var(--color-saffron-500) 70%, transparent), color-mix(in oklab, var(--color-atlas-400) 70%, transparent))",
        }}
      >
        <div
          className="absolute -top-7 flex flex-col items-center"
          style={{ right: `${pos}%`, transform: "translateX(50%)" }}
        >
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-extrabold whitespace-nowrap"
            style={{ background: tone.color, color: "#0b0f16" }}
          >
            هذا الإعلان
          </span>
          <span
            className="mt-0.5 h-3 w-0.5"
            style={{ background: tone.color }}
          />
        </div>
      </div>

      <div className="flex justify-between text-[11px]" style={{ color: "var(--text-dim)" }}>
        <span><Price value={fp.estimate.high} /> ↑</span>
        <span className="font-bold" style={{ color: "var(--text-muted)" }}>
          المرجع <Price value={fp.estimate.mid} />
        </span>
        <span>↓ <Price value={fp.estimate.low} /></span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs"
        style={{ borderColor: "var(--line-soft)" }}>
        <span style={{ color: "var(--text-muted)" }}>الفرق عن المرجع</span>
        <span className="font-extrabold" style={{ color: tone.color }}>
          <Price value={fp.deltaDh} sign />
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 rounded-full" style={{ background: "var(--line)" }}>
          <div
            className="h-1 rounded-full"
            style={{
              width: `${Math.round(fp.estimate.confidence * 100)}%`,
              background: "var(--color-majorelle-400)",
            }}
          />
        </div>
        <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
          دقة التقدير <span className="num">{Math.round(fp.estimate.confidence * 100)}٪</span>
        </span>
      </div>
    </div>
  );
}
