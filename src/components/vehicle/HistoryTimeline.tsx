"use client";

import type { HistoryEvent } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { useDict, useLocale } from "@/lib/i18n/client";
import { fmtMonthYear, kmUnit } from "@/lib/i18n/labels";
import { BadgeCheck, ClipboardCheck, Crash, Flag, Gauge, Odometer, OilCan, Users } from "@/components/icons";
import type { IconProps } from "@/components/icons";

const STYLE: Record<HistoryEvent["type"], { color: string; Icon: (p: IconProps) => React.JSX.Element }> = {
  "mise-en-circulation": { color: "var(--data)", Icon: Flag },
  proprietaire: { color: "var(--warn)", Icon: Users },
  entretien: { color: "var(--good)", Icon: OilCan },
  visite: { color: "var(--good)", Icon: ClipboardCheck },
  accident: { color: "var(--bad)", Icon: Crash },
  km: { color: "var(--text-dim)", Icon: Odometer },
};

export function HistoryTimeline({ events }: { events: HistoryEvent[] }) {
  const t = useDict();
  const locale = useLocale();
  return (
    <section className="card p-5">
      <header className="mb-5 flex items-start gap-2.5">
        <BadgeCheck size={18} style={{ color: "var(--brand)" }} className="mt-0.5 shrink-0" />
        <div>
          <h2 className="text-[15px] font-bold">{t.timeline.title}</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
            {t.timeline.lead}
          </p>
        </div>
      </header>

      <ol className="relative pe-7">
        <span
          className="absolute bottom-3 start-[13px] top-3 w-px"
          style={{ background: "var(--line)" }}
          aria-hidden="true"
        />
        {events.map((e, i) => {
          const { color, Icon } = STYLE[e.type];
          const label = e.type === "accident" ? t.timeline.accidentLabel : e.label;
          return (
            <li key={i} className="relative pb-5 last:pb-0">
              <span
                className="absolute -start-7 top-0 grid h-[27px] w-[27px] place-items-center rounded-full border"
                style={{
                  background: "var(--surface-1)",
                  borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
                  color,
                }}
                aria-hidden="true"
              >
                <Icon size={14} />
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2 pt-1">
                <span className="text-[12.5px] font-bold">{label}</span>
                <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                  {fmtMonthYear(e.date, locale)}
                </span>
                {e.km !== undefined && (
                  <span className="tag tag-mute">
                    <Gauge size={10} /> <span className="num">{formatNumber(e.km)}</span> {kmUnit(locale)}
                  </span>
                )}
              </div>
              {e.detail && (
                <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {e.detail}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
