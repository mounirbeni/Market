"use client";

import { Link } from "@/components/Link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useVehiclesByIds } from "@/lib/useVehicles";
import { vehicleHref } from "@/lib/slug";
import { formatNumber } from "@/lib/format";
import { artShape } from "@/lib/artshape";
import { VehicleArt } from "@/components/VehicleArt";
import { useDict, useLocale } from "@/lib/i18n/client";
import { dhUnit, fmtDate } from "@/lib/i18n/labels";
import { HTML_LANG } from "@/lib/i18n/config";
import { Calendar, Check, Clock, Close, MapPin, Phone, Users } from "@/components/icons";

/** نفس قيم appt_status فقاعدة البيانات */
type ApptState = "pending" | "confirmed" | "done" | "cancelled";

interface Appt {
  id: string;
  ref: string;
  person: string;
  scheduled_at: string;
  place: string | null;
  status: ApptState;
  role: "buyer" | "seller";
}

const STATE_COLOR: Record<ApptState, string> = {
  pending: "var(--warn)",
  confirmed: "var(--good)",
  done: "var(--text-dim)",
  cancelled: "var(--bad)",
};

export function DashboardAppointments() {
  const t = useDict();
  const locale = useLocale();
  const dh = dhUnit(locale);
  const p = t.appointmentsPage;
  /* المواعيد الحقيقية من قاعدة البيانات */
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok) setAppts(j.data.items as Appt[]);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const setStatus = useCallback((id: string, status: ApptState) => {
    setAppts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    fetch("/api/appointments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  }, []);

  const { items } = useVehiclesByIds(appts.map((a) => a.ref));
  const byId = useMemo(() => new Map(items.map((v) => [v.id, v])), [items]);

  if (!loading && appts.length === 0) {
    return (
      <div className="card p-10 text-center">
        <span
          className="mx-auto grid h-12 w-12 place-items-center rounded-xl"
          style={{ background: "var(--surface-3)", color: "var(--text-dim)" }}
        >
          <Calendar size={22} />
        </span>
        <h2 className="mt-4 text-[15px] font-bold">{p.emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {p.emptyText}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appts.map((a) => {
        const v = byId.get(a.ref);
        const state = a.status;
        const stColor = STATE_COLOR[state];
        const when = new Date(a.scheduled_at);
        return (
          <article key={a.id} className="card overflow-hidden">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              {v && (
                <Link href={vehicleHref(v)} className="h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                  <VehicleArt id={v.id} kind={v.kind} body={artShape(v)} color={v.color} className="h-full w-full" />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-bold">
                    <Users size={14} style={{ color: "var(--text-dim)" }} /> {a.person}
                  </span>
                  <span
                    className="tag"
                    style={{ background: `color-mix(in oklab, ${stColor} 14%, transparent)`, color: stColor }}
                  >
                    {p.status[state]}
                  </span>
                </div>
                {v && (
                  <p className="mt-1 text-[11.5px]" style={{ color: "var(--text-muted)" }}>
                    {v.make} {v.model} · <span className="num">{formatNumber(v.price)}</span> {dh}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {fmtDate(a.scheduled_at, locale)}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />{" "}
                    <span className="num">
                      {when.toLocaleTimeString(HTML_LANG[locale], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                  {a.place && <span className="flex items-center gap-1"><MapPin size={12} /> {a.place}</span>}
                </div>
              </div>
            </div>

            {state === "pending" && (
              <div
                className="flex flex-wrap gap-1.5 border-t px-4 py-2.5"
                style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
              >
                <button onClick={() => setStatus(a.id, "confirmed")} className="btn btn-primary btn-sm">
                  <Check size={13} /> {p.confirm}
                </button>
                {v && (
                  <Link href={`/messages?listing=${v.id}`} className="btn btn-solid btn-sm">
                    <Phone size={13} /> {p.contact}
                  </Link>
                )}
                <button
                  onClick={() => setStatus(a.id, "cancelled")}
                  className="btn btn-ghost btn-sm me-auto"
                  style={{ color: "var(--bad)", borderColor: "var(--line)" }}
                >
                  <Close size={13} /> {p.decline}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
