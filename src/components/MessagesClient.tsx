"use client";

import Link from "next/link";
import { useState } from "react";
import { THREADS } from "@/lib/data/threads";
import { vehicleById } from "@/lib/data/vehicles";
import { vehicleHref } from "@/lib/slug";
import { formatNumber, timeAgo } from "@/lib/format";
import { NOW } from "@/lib/data/seed";
import { artShape } from "@/lib/artshape";
import { VehicleArt } from "@/components/VehicleArt";
import {
  ArrowLeft, Calendar, Info, Message, Phone, Search, Users,
} from "@/components/icons";

export function MessagesClient() {
  const [activeId, setActiveId] = useState(THREADS[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Record<string, string[]>>({});

  const thread = THREADS.find((t) => t.id === activeId) ?? THREADS[0];
  const vehicle = thread ? vehicleById(thread.vehicleId) : undefined;
  const extra = sent[thread?.id ?? ""] ?? [];

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !thread) return;
    setSent((s) => ({ ...s, [thread.id]: [...(s[thread.id] ?? []), text] }));
    setDraft("");
  }

  if (!thread) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* اللائحة */}
      <aside className="card h-fit overflow-hidden">
        <div className="border-b p-3" style={{ borderColor: "var(--line-soft)" }}>
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-dim)" }} />
            <input className="field !pr-9 text-[12px]" placeholder="بحث فالمحادثات" aria-label="بحث في المحادثات" />
          </div>
        </div>
        <ul>
          {THREADS.map((t) => {
            const v = vehicleById(t.vehicleId);
            const on = t.id === activeId;
            const last = t.messages[t.messages.length - 1];
            return (
              <li key={t.id}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className="flex w-full gap-3 border-b p-3 text-right transition"
                  style={{
                    borderColor: "var(--line-soft)",
                    background: on ? "var(--brand-soft)" : "transparent",
                  }}
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[13px] font-extrabold"
                    style={{ background: "var(--surface-3)", color: "var(--brand)" }}
                  >
                    {t.person.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12.5px] font-bold">{t.person}</span>
                      {t.unread > 0 && (
                        <span
                          className="num grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold"
                          style={{ background: "var(--brand)", color: "#fff" }}
                        >
                          {t.unread}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {last.text}
                    </span>
                    <span className="mt-1 block truncate text-[10px]" style={{ color: "var(--text-dim)" }}>
                      {v ? `${v.make} ${v.model}` : ""} · {timeAgo(last.at, NOW)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* المحادثة */}
      <section className="card flex min-h-[520px] flex-col overflow-hidden">
        <header
          className="flex flex-wrap items-center gap-3 border-b p-4"
          style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[14px] font-extrabold"
            style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
          >
            {thread.person.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[14px] font-bold">{thread.person}</h2>
              <span className="tag tag-mute"><Users size={10} /> {thread.role}</span>
            </div>
            {vehicle && (
              <Link
                href={vehicleHref(vehicle)}
                className="mt-0.5 flex items-center gap-1 text-[11px] transition hover:text-[var(--brand)]"
                style={{ color: "var(--text-dim)" }}
              >
                {vehicle.make} {vehicle.model} · <span className="num">{formatNumber(vehicle.price)}</span> د.م
                <ArrowLeft size={11} />
              </Link>
            )}
          </div>
          <div className="flex gap-1.5">
            <button className="btn btn-solid btn-sm"><Phone size={13} /> اتصال</button>
            <button className="btn btn-solid btn-sm"><Calendar size={13} /> موعد</button>
          </div>
        </header>

        {vehicle && (
          <Link
            href={vehicleHref(vehicle)}
            className="flex items-center gap-3 border-b p-3 transition hover:bg-[var(--surface-3)]"
            style={{ borderColor: "var(--line-soft)" }}
          >
            <span className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
              <VehicleArt id={vehicle.id} kind={vehicle.kind} body={artShape(vehicle)} color={vehicle.color} className="h-full w-full" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-bold">{vehicle.make} {vehicle.model}</span>
              <span className="num block text-[12px] font-bold" style={{ color: "var(--brand)" }}>
                {formatNumber(vehicle.price)} د.م
              </span>
            </span>
          </Link>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {thread.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-start" : "justify-end"}`}>
              <div
                className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed"
                style={{
                  background: m.from === "me" ? "var(--brand)" : "var(--surface-3)",
                  color: m.from === "me" ? "#fff" : "var(--text)",
                }}
              >
                {m.text}
                <span className="mt-1 block text-[9.5px] opacity-65">{timeAgo(m.at, NOW)}</span>
              </div>
            </div>
          ))}
          {extra.map((t, i) => (
            <div key={`x${i}`} className="flex justify-start">
              <div
                className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                {t}
                <span className="mt-1 block text-[9.5px] opacity-65">دابا</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={send} className="flex gap-2 border-t p-3" style={{ borderColor: "var(--line-soft)" }}>
          <input
            className="field flex-1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اكتب رسالتك…"
            aria-label="نص الرسالة"
          />
          <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
            <Message size={15} /> صيفط
          </button>
        </form>

        <p
          className="flex gap-2 border-t p-3 text-[10.5px] leading-relaxed"
          style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)", color: "var(--text-muted)" }}
        >
          <Info size={13} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
          خلّي التواصل داخل المنصة: كيحميك من النصب وكيخلّي عندك دليل مكتوب على كل اتفاق.
          هادي نسخة تجريبية — الرسائل كتبقى فمتصفحك فقط.
        </p>
      </section>
    </div>
  );
}
