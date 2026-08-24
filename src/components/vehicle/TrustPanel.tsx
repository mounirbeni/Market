import type { TrustResult } from "@/lib/market";
import { trustColor } from "@/lib/market";
import { TrustRing } from "@/components/TrustBadge";

const FLAG_STYLE = {
  danger: { bg: "var(--color-clay-500)", icon: "⚠" },
  warn: { bg: "var(--color-saffron-600)", icon: "!" },
  info: { bg: "var(--color-majorelle-500)", icon: "i" },
} as const;

export function TrustPanel({ trust }: { trust: TrustResult }) {
  const color = trustColor(trust.score);
  return (
    <section className="card p-5">
      <div className="flex items-start gap-4">
        <TrustRing score={trust.score} grade={trust.grade} size={78} stroke={6} />
        <div className="min-w-0">
          <h2 className="text-base font-extrabold">مؤشر الثقة</h2>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            تنقيط مستقل على <span className="num">100</span> نقطة، محسوب من معطيات الإعلان
            والبائع وسجل المركبة. ماشي تقييم للمركبة، بل لمستوى الشفافية والتحقق.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {trust.parts.map((p) => (
          <div key={p.key}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-bold">{p.label}</span>
              <span className="num shrink-0" style={{ color: "var(--text-dim)" }}>
                {p.score}/{p.max}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-inset)" }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${(p.score / p.max) * 100}%`, background: color }}
              />
            </div>
            <p className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>{p.detail}</p>
          </div>
        ))}
      </div>

      {trust.strengths.length > 0 && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line-soft)" }}>
          <h3 className="mb-2 text-xs font-extrabold" style={{ color: "var(--color-atlas-400)" }}>
            نقط القوة
          </h3>
          <ul className="space-y-1.5">
            {trust.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--color-atlas-400)" }}>✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {trust.flags.length > 0 && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line-soft)" }}>
          <h3 className="mb-2 text-xs font-extrabold" style={{ color: "var(--color-clay-400)" }}>
            نقط تستاهل انتباهك
          </h3>
          <ul className="space-y-2">
            {trust.flags.map((f, i) => {
              const st = FLAG_STYLE[f.level];
              return (
                <li key={i} className="flex gap-2 text-xs leading-relaxed">
                  <span
                    className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: st.bg }}
                    aria-hidden="true"
                  >
                    {st.icon}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
