"use client";

import type { FairPrice } from "@/lib/market";
import { Price } from "./Price";
import { formatNumber } from "@/lib/format";
import { Equal, Info, TrendingDown, TrendingUp } from "./icons";

const TONES = {
  "tres-bas": { color: "var(--good)", Icon: TrendingDown },
  bas: { color: "var(--good)", Icon: TrendingDown },
  juste: { color: "var(--warn)", Icon: Equal },
  haut: { color: "var(--bad)", Icon: TrendingUp },
  "tres-haut": { color: "var(--bad)", Icon: TrendingUp },
} as const;

export function FairPriceTag({ fp }: { fp: FairPrice }) {
  if (fp.weak) {
    return (
      <span className="tag tag-mute" title="عدد الإعلانات المشابهة غير كافٍ لحساب ثمن مرجعي دقيق">
        <Info size={11} /> مراجع محدودة
      </span>
    );
  }
  const { color, Icon } = TONES[fp.verdict];
  const pct = Math.round(Math.abs(fp.delta) * 100);
  return (
    <span
      className="tag"
      style={{ background: `color-mix(in oklab, ${color} 13%, transparent)`, color }}
      title={`الثمن المرجعي: ${formatNumber(fp.estimate.mid)} د.م`}
    >
      <Icon size={11} />
      {fp.verdict === "juste" ? "ثمن عادل" : (
        <><span className="num">{pct}</span>٪ {fp.delta < 0 ? "تحت السوق" : "فوق السوق"}</>
      )}
    </span>
  );
}

export function FairPriceMeter({ fp }: { fp: FairPrice }) {
  const { color, Icon } = TONES[fp.verdict];
  const pos = Math.max(14, Math.min(86, fp.position * 100));
  const conf = Math.round(fp.estimate.confidence * 100);

  return (
    <section className="card p-5">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold">مؤشر الثمن العادل</h2>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
            محسوب من <span className="num">{fp.estimate.sampleSize}</span> إعلاناً مشابهاً بعد
            تعديل السنة والكيلومتراج والحالة
          </p>
        </div>
        <span
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold"
          style={{
            background: fp.weak ? "var(--surface-3)" : `color-mix(in oklab, ${color} 13%, transparent)`,
            color: fp.weak ? "var(--text-dim)" : color,
          }}
        >
          {fp.weak ? <Info size={13} /> : <Icon size={13} />}
          {fp.label}
        </span>
      </header>

      {fp.weak && (
        <p
          className="mb-5 flex gap-2 rounded-lg p-3 text-[11.5px] leading-relaxed"
          style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
        >
          <Info size={14} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
          ماكايناش بزاف ديال الإعلانات المشابهة لهاد المركبة، لهذا الثمن المرجعي تقريبي —
          خدو كمؤشر أولي فقط.
        </p>
      )}

      <div className="relative pt-8">
        <div
          className="h-2.5 rounded-full"
          style={{
            background:
              "linear-gradient(to left, color-mix(in oklab, var(--bad) 65%, transparent), color-mix(in oklab, var(--warn) 65%, transparent), color-mix(in oklab, var(--good) 65%, transparent))",
          }}
        />
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ right: `${pos}%`, transform: "translateX(50%)" }}
        >
          <span
            className="rounded-md px-2 py-1 text-[10.5px] font-extrabold whitespace-nowrap"
            style={{ background: color, color: "#0a1e3d" }}
          >
            هذا الإعلان
          </span>
          <span className="h-2.5 w-0.5" style={{ background: color }} />
        </div>
      </div>

      <div className="mt-3 flex justify-between text-[11px]" style={{ color: "var(--text-dim)" }}>
        <span className="flex items-center gap-1"><TrendingUp size={11} /><Price value={fp.estimate.high} tone="inherit" /></span>
        <span className="font-bold" style={{ color: "var(--text-muted)" }}>
          المرجع <Price value={fp.estimate.mid} tone="inherit" />
        </span>
        <span className="flex items-center gap-1"><Price value={fp.estimate.low} tone="inherit" /><TrendingDown size={11} /></span>
      </div>

      <div
        className="mt-5 grid grid-cols-2 gap-4 border-t pt-4"
        style={{ borderColor: "var(--line-soft)" }}
      >
        <div className="stat">
          <span className="stat-label">الفرق عن المرجع</span>
          <span className="stat-value text-base" style={{ color: fp.weak ? "var(--text-muted)" : color }}>
            <Price value={fp.deltaDh} sign tone="inherit" />
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">دقة التقدير</span>
          <div className="flex items-center gap-2">
            <div className="meter flex-1" style={{ height: 5 }}>
              <i style={{ width: `${conf}%`, background: "var(--data)" }} />
            </div>
            <span className="num text-xs font-bold" style={{ color: "var(--data)" }}>{conf}٪</span>
          </div>
        </div>
      </div>
    </section>
  );
}
