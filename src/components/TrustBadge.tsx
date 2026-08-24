import { trustColor, type TrustResult } from "@/lib/market";

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
      title={`مؤشر الثقة: ${score}/100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(c * score) / 100} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className="num font-extrabold"
          style={{ fontSize: size * 0.32, color }}
        >
          {score}
        </span>
        {showLabel && grade && (
          <span
            className="mt-0.5 font-bold opacity-70"
            style={{ fontSize: size * 0.16 }}
          >
            {grade}
          </span>
        )}
      </div>
    </div>
  );
}

export function TrustPill({ trust }: { trust: TrustResult }) {
  const color = trustColor(trust.score);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
      style={{
        background: `color-mix(in oklab, ${color} 16%, transparent)`,
        color,
        border: `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      ثقة <span className="num">{trust.score}</span>
      <span className="opacity-70">/ {trust.grade}</span>
    </span>
  );
}
