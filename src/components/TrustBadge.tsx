import { trustColor, type TrustResult } from "@/lib/market";
import { ShieldCheck } from "./icons";

/** حلقة مؤشر الثقة */
export function TrustRing({
  score,
  grade,
  size = 56,
  stroke = 5,
  showLabel = true,
}: {
  score: number;
  grade?: string;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = trustColor(score);
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`مؤشر الثقة: ${score} من 100`}
    >
      <svg width={size} height={size} className="-rotate-90 block">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(c * score) / 100} ${c}`}
          style={{ transition: "stroke-dasharray .6s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="num font-extrabold" style={{ fontSize: size * 0.31, color }}>
          {score}
        </span>
        {showLabel && grade && (
          <span className="num mt-0.5 font-bold opacity-60" style={{ fontSize: size * 0.155 }}>
            {grade}
          </span>
        )}
      </div>
    </div>
  );
}

/** مؤشر مصغّر للبطاقات */
export function TrustDot({ trust }: { trust: TrustResult }) {
  const color = trustColor(trust.score);
  return (
    <div
      className="flex shrink-0 items-center gap-1.5 rounded-lg py-1 pl-2 pr-1.5"
      style={{
        background: `color-mix(in oklab, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 28%, transparent)`,
      }}
      title={`مؤشر الثقة ${trust.score} من 100 · تصنيف ${trust.grade}`}
    >
      <ShieldCheck size={13} style={{ color }} />
      <span className="num text-[13px] font-extrabold leading-none" style={{ color }}>
        {trust.score}
      </span>
    </div>
  );
}

/** شارة كاملة بالنص */
export function TrustPill({ trust }: { trust: TrustResult }) {
  const color = trustColor(trust.score);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
      style={{
        background: `color-mix(in oklab, ${color} 13%, transparent)`,
        color,
        border: `1px solid color-mix(in oklab, ${color} 32%, transparent)`,
      }}
    >
      <ShieldCheck size={12} />
      ثقة <span className="num">{trust.score}</span>
      <span className="opacity-60">· {trust.grade}</span>
    </span>
  );
}
