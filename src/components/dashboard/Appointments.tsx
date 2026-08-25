"use client";

import Link from "next/link";
import { useState } from "react";
import { vehicleById } from "@/lib/data/vehicles";
import { vehicleHref } from "@/lib/slug";
import { formatDate, formatNumber } from "@/lib/format";
import { artShape } from "@/lib/artshape";
import { VehicleArt } from "@/components/VehicleArt";
import { Calendar, Check, Clock, Close, MapPin, Phone, Users } from "@/components/icons";

interface Appt {
  id: string;
  person: string;
  vehicleId: string;
  date: string;
  time: string;
  place: string;
  state: "pending" | "confirmed" | "done";
}

const APPTS: Appt[] = [
  { id: "a1", person: "سناء م.", vehicleId: "c017", date: "2026-08-29", time: "11:00", place: "الدار البيضاء — المعرض", state: "pending" },
  { id: "a2", person: "يوسف الإدريسي", vehicleId: "c003", date: "2026-08-26", time: "16:30", place: "مراكش — محطة الشحن", state: "confirmed" },
  { id: "a3", person: "حمزة ر.", vehicleId: "c026", date: "2026-08-18", time: "10:00", place: "الدار البيضاء — المعرض", state: "done" },
];

const STATE = {
  pending: { label: "في انتظار تأكيدك", color: "var(--warn)" },
  confirmed: { label: "مؤكّد", color: "var(--good)" },
  done: { label: "منتهي", color: "var(--text-dim)" },
} as const;

export function DashboardAppointments() {
  const [states, setStates] = useState<Record<string, Appt["state"]>>({});

  return (
    <div className="space-y-3">
      {APPTS.map((a) => {
        const v = vehicleById(a.vehicleId);
        const state = states[a.id] ?? a.state;
        const st = STATE[state];
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
                    style={{ background: `color-mix(in oklab, ${st.color} 14%, transparent)`, color: st.color }}
                  >
                    {st.label}
                  </span>
                </div>
                {v && (
                  <p className="mt-1 text-[11.5px]" style={{ color: "var(--text-muted)" }}>
                    {v.make} {v.model} · <span className="num">{formatNumber(v.price)}</span> د.م
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(a.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> <span className="num">{a.time}</span></span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {a.place}</span>
                </div>
              </div>
            </div>

            {state === "pending" && (
              <div
                className="flex flex-wrap gap-1.5 border-t px-4 py-2.5"
                style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
              >
                <button
                  onClick={() => setStates((s) => ({ ...s, [a.id]: "confirmed" }))}
                  className="btn btn-primary btn-sm"
                >
                  <Check size={13} /> أكّد الموعد
                </button>
                <button className="btn btn-solid btn-sm"><Phone size={13} /> اتصل</button>
                <button
                  onClick={() => setStates((s) => ({ ...s, [a.id]: "done" }))}
                  className="btn btn-ghost btn-sm mr-auto"
                  style={{ color: "var(--bad)", borderColor: "var(--line)" }}
                >
                  <Close size={13} /> رفض
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
