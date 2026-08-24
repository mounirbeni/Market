import type { HistoryEvent } from "@/lib/types";
import { formatMonthYear, formatNumber } from "@/lib/format";

const STYLE: Record<HistoryEvent["type"], { color: string; icon: string; label: string }> = {
  "mise-en-circulation": { color: "var(--color-majorelle-400)", icon: "★", label: "أول تسجيل" },
  proprietaire: { color: "var(--color-saffron-500)", icon: "◆", label: "مالك" },
  entretien: { color: "var(--color-atlas-400)", icon: "✚", label: "صيانة" },
  visite: { color: "var(--color-atlas-500)", icon: "✓", label: "فحص تقني" },
  accident: { color: "var(--color-clay-500)", icon: "⚠", label: "حادث" },
  km: { color: "var(--color-ink-400)", icon: "•", label: "قراءة العدّاد" },
};

export function HistoryTimeline({ events }: { events: HistoryEvent[] }) {
  return (
    <section className="card p-5">
      <h2 className="text-base font-extrabold">سجل المركبة</h2>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        كل ما صرّح به البائع أو تم التحقق منه: الملاّك، الصيانات، الفحوصات والحوادث.
      </p>

      <ol className="relative mt-5 pr-5">
        <span
          className="absolute bottom-2 right-[7px] top-2 w-px"
          style={{ background: "var(--line)" }}
          aria-hidden="true"
        />
        {events.map((e, i) => {
          const st = STYLE[e.type];
          return (
            <li key={i} className="relative pb-5 last:pb-0">
              <span
                className="absolute -right-5 top-0.5 grid h-[15px] w-[15px] place-items-center rounded-full text-[8px] font-bold text-white"
                style={{ background: st.color }}
                aria-hidden="true"
              >
                {st.icon}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-xs font-extrabold">{e.label}</span>
                <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                  {formatMonthYear(e.date)}
                </span>
                {e.km !== undefined && (
                  <span className="num chip !px-2 !py-0 text-[10px]">
                    {formatNumber(e.km)} كم
                  </span>
                )}
              </div>
              {e.detail && (
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
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
