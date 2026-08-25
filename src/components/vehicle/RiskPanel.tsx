import type { Vehicle } from "@/lib/types";
import { suspicionFlags, riskLevel } from "@/lib/flags";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "@/components/icons";

const STYLE = {
  danger: { color: "var(--bad)", Icon: ShieldAlert, title: "انتبه — علامات خطر" },
  warn: { color: "var(--warn)", Icon: AlertTriangle, title: "نقاط خاصك تتأكد منها" },
} as const;

/** كشف الإعلانات المشبوهة — كيبان غير إلا كانت شي إشارة */
export function RiskPanel({ v }: { v: Vehicle }) {
  const flags = suspicionFlags(v);
  const level = riskLevel(flags);

  if (!level) {
    return (
      <section
        className="flex items-start gap-3 rounded-2xl border p-4"
        style={{ borderColor: "var(--line-soft)", background: "var(--good-soft)" }}
      >
        <ShieldCheck size={19} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} />
        <div>
          <h3 className="text-[13px] font-extrabold" style={{ color: "var(--good)" }}>
            ماكشفنا حتى إشارة خطر
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            الثمن، الكيلومتراج، الوثائق والصور كلهم متسقين. هادشي ماكيعوّضش المعاينة —
            ولكن الإعلان نظيف من العلامات المعروفة ديال النصب.
          </p>
        </div>
      </section>
    );
  }

  const st = STYLE[level];
  return (
    <section
      className="rounded-2xl border p-4"
      style={{
        borderColor: `color-mix(in oklab, ${st.color} 32%, transparent)`,
        background: `color-mix(in oklab, ${st.color} 7%, transparent)`,
      }}
    >
      <h3 className="flex items-center gap-2 text-[13px] font-extrabold" style={{ color: st.color }}>
        <st.Icon size={17} /> {st.title}
        <span className="chip chip-plain mr-auto">
          <span className="num">{flags.length}</span>
        </span>
      </h3>
      <ul className="mt-3 space-y-2.5">
        {flags.map((f) => (
          <li key={f.label} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: f.level === "danger" ? "var(--bad)" : "var(--warn)" }}
            />
            <span className="min-w-0">
              <span className="block text-[12.5px] font-bold">{f.label}</span>
              <span className="block text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {f.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
