import { trustColor, type TrustResult } from "@/lib/market";
import { TrustRing } from "@/components/TrustBadge";
import {
  AlertTriangle, BadgeCheck, Camera, Check, FileText, IdCard, Info,
  ShieldAlert, Timer, Wrench,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";

const PART_ICONS: Record<string, (p: IconProps) => React.JSX.Element> = {
  seller: IdCard,
  docs: FileText,
  history: Timer,
  transparency: Camera,
  coherence: BadgeCheck,
  inspection: Wrench,
};

const FLAG_TONE = {
  danger: { color: "var(--bad)", Icon: ShieldAlert },
  warn: { color: "var(--warn)", Icon: AlertTriangle },
  info: { color: "var(--data)", Icon: Info },
} as const;

export function TrustPanel({ trust }: { trust: TrustResult }) {
  const color = trustColor(trust.score);

  return (
    <section className="card overflow-hidden">
      <div
        className="flex items-start gap-4 border-b p-5"
        style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
      >
        <TrustRing score={trust.score} grade={trust.grade} size={74} stroke={6} />
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold">مؤشر الثقة</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            تنقيط مستقل على <span className="num">100</span> نقطة من معطيات الإعلان والبائع
            وسجل المركبة. ماشي تقييم للمركبة، بل لمستوى الشفافية والتحقق.
          </p>
        </div>
      </div>

      <div className="space-y-3.5 p-5">
        {trust.parts.map((p) => {
          const Icon = PART_ICONS[p.key] ?? BadgeCheck;
          const pct = (p.score / p.max) * 100;
          return (
            <div key={p.key}>
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color: "var(--text-dim)" }} />
                <span className="flex-1 text-[12px] font-bold">{p.label}</span>
                <span className="num text-[11px]" style={{ color: "var(--text-dim)" }}>
                  {p.score}/{p.max}
                </span>
              </div>
              <div className="meter mt-1.5" style={{ height: 5 }}>
                <i style={{ width: `${pct}%`, background: color }} />
              </div>
              <p className="mt-1 pe-5 text-[10.5px]" style={{ color: "var(--text-dim)" }}>{p.detail}</p>
            </div>
          );
        })}
      </div>

      {trust.strengths.length > 0 && (
        <div className="border-t px-5 py-4" style={{ borderColor: "var(--line-soft)" }}>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-extrabold" style={{ color: "var(--good)" }}>
            <BadgeCheck size={13} /> نقط القوة
          </h3>
          <ul className="space-y-1.5">
            {trust.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <Check size={13} className="mt-px shrink-0" style={{ color: "var(--good)" }} /> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {trust.flags.length > 0 && (
        <div className="border-t px-5 py-4" style={{ borderColor: "var(--line-soft)" }}>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-extrabold" style={{ color: "var(--bad)" }}>
            <AlertTriangle size={13} /> نقط تستاهل انتباهك
          </h3>
          <ul className="space-y-2">
            {trust.flags.map((f, i) => {
              const { color: c, Icon } = FLAG_TONE[f.level];
              return (
                <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed">
                  <Icon size={13} className="mt-px shrink-0" style={{ color: c }} />
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
