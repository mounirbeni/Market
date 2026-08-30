"use client";

import type { Vehicle } from "@/lib/types";
import { suspicionFlags, riskLevel } from "@/lib/flags";
import { useDict } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/labels";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "@/components/icons";

const STYLE = {
  danger: { color: "var(--bad)", Icon: ShieldAlert, titleKey: "dangerTitle" },
  warn: { color: "var(--warn)", Icon: AlertTriangle, titleKey: "warnTitle" },
} as const;

/** كشف الإعلانات المشبوهة — كيبان غير إلا كانت شي إشارة */
export function RiskPanel({ v, duplicates = 0 }: { v: Vehicle; duplicates?: number }) {
  const t = useDict();
  const flags = suspicionFlags(v, duplicates);
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
            {t.risk.cleanTitle}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t.risk.cleanLead}
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
        <st.Icon size={17} /> {t.risk[st.titleKey]}
        <span className="chip chip-plain me-auto">
          <span className="num">{flags.length}</span>
        </span>
      </h3>
      <ul className="mt-3 space-y-2.5">
        {flags.map((f) => {
          const fl = t.risk.flag[f.key as keyof typeof t.risk.flag];
          return (
          <li key={f.key} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: f.level === "danger" ? "var(--bad)" : "var(--warn)" }}
            />
            <span className="min-w-0">
              <span className="block text-[12.5px] font-bold">{fl.label}</span>
              <span className="block text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {fill(fl.detail, f.vars ?? {})}
              </span>
            </span>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
