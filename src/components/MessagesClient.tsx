"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { timeAgo } from "@/lib/format";
import { VehicleArt } from "@/components/VehicleArt";
import {
  AlertTriangle, ArrowRight, Check, Message, Phone, Search, Send, ShieldAlert,
} from "@/components/icons";

/* ============================================================
   الدردشة — كتقرا وكتكتب من قاعدة البيانات عبر /api/threads

   الاستقصاء (polling) كل 4 ثوان بمؤشر id، ماشي WebSocket:
   كيخدم على أي استضافة بلا اتصال دائم، وكيوقف ملي التبويب مخبّي.
   ============================================================ */

interface Thread {
  id: string;
  listing_slug: string;
  listing_ref: string;
  make: string;
  model: string;
  year: number;
  price_mad: number;
  color: string | null;
  kind: "car" | "moto";
  body: string;
  other_name: string;
  my_role: "buyer" | "seller";
  last_body: string | null;
  last_at: string;
  unread: number;
}

interface Msg {
  id: string;
  body: string;
  created_at: string;
  mine: boolean;
  pending?: boolean;
}

const POLL_MS = 4000;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error ?? "وقع مشكل.");
  return j.data as T;
}

export function MessagesClient() {
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState("");
  const [needLogin, setNeedLogin] = useState(false);
  const [q, setQ] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const lastId = useRef<string>("");

  /* ---- تحميل المحادثات ---- */
  const loadThreads = useCallback(async () => {
    try {
      const d = await api<{ threads: Thread[] }>("/api/threads");
      setThreads(d.threads);
      setActiveId((cur) => cur || d.threads[0]?.id || "");
    } catch (e) {
      setErr((e as Error).message);
      setThreads([]);
    }
  }, []);

  /**
   * كنتحققو من الهوية أولاً عبر /api/auth/me (كيرجع 200 مع user: null).
   * بهاد الطريقة الزائر غير المسجّل ماكيولّدش 401 فالـconsole.
   */
  useEffect(() => {
    (async () => {
      try {
        const d = await api<{ user: unknown | null }>("/api/auth/me");
        if (!d.user) { setNeedLogin(true); setThreads([]); return; }
        await loadThreads();
      } catch {
        setNeedLogin(true);
        setThreads([]);
      }
    })();
  }, [loadThreads]);

  /* ---- تحميل رسائل المحادثة المختارة ---- */
  useEffect(() => {
    if (!activeId) return;
    lastId.current = "";
    setMessages([]);
    let alive = true;
    (async () => {
      try {
        const d = await api<{ messages: Msg[] }>(`/api/threads/${activeId}/messages`);
        if (!alive) return;
        setMessages(d.messages);
        lastId.current = d.messages.at(-1)?.id ?? "";
        await fetch(`/api/threads/${activeId}/read`, { method: "POST" });
        setThreads((ts) => ts?.map((t) => (t.id === activeId ? { ...t, unread: 0 } : t)) ?? ts);
      } catch (e) {
        if (alive) setErr((e as Error).message);
      }
    })();
    return () => { alive = false; };
  }, [activeId]);

  /* ---- الاستقصاء ---- */
  useEffect(() => {
    if (!activeId) return;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const d = await api<{ messages: Msg[] }>(
          `/api/threads/${activeId}/messages${lastId.current ? `?after=${lastId.current}` : ""}`,
        );
        if (d.messages.length === 0) return;
        setMessages((m) => [...m.filter((x) => !x.pending), ...d.messages]);
        lastId.current = d.messages.at(-1)!.id;
        await fetch(`/api/threads/${activeId}/read`, { method: "POST" });
        void loadThreads();
      } catch {
        /* الشبكة كتقطع — الدورة الجاية تعاود */
      }
    };
    const t = setInterval(tick, POLL_MS);
    return () => clearInterval(t);
  }, [activeId, loadThreads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    setDraft("");
    setErr("");
    const temp: Msg = {
      id: `tmp-${Date.now()}`, body: text,
      created_at: new Date().toISOString(), mine: true, pending: true,
    };
    setMessages((m) => [...m, temp]);
    try {
      const d = await api<{ message: Msg }>(`/api/threads/${activeId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setMessages((m) => m.map((x) => (x.id === temp.id ? { ...d.message, pending: false } : x)));
      lastId.current = d.message.id;
      void loadThreads();
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== temp.id));
      setDraft(text);
      setErr((e as Error).message);
    }
  }

  /* ---- الحالات ---- */
  if (needLogin) {
    return (
      <div className="card p-12 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl"
          style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
          <Message size={30} />
        </span>
        <h2 className="mt-5 text-lg font-bold">سجّل الدخول باش تشوف رسائلك</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
          الدردشة داخل الموقع كتخلّيك تتواصل مع البائع بلا ما تعطي رقمك.
        </p>
        <Link href="/login" className="btn btn-primary mt-6">تسجيل الدخول</Link>
      </div>
    );
  }

  if (threads === null) {
    return <div className="card p-12 text-center text-sm" style={{ color: "var(--text-dim)" }}>كنحمّلو…</div>;
  }

  if (threads.length === 0) {
    return (
      <div className="card p-12 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl"
          style={{ background: "var(--surface-3)", color: "var(--text-dim)" }}>
          <Message size={30} />
        </span>
        <h2 className="mt-5 text-lg font-bold">ماعندك حتى محادثة</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
          من أي إعلان، كليكي على «راسل البائع» وغادي تبدا المحادثة هنا.
        </p>
        <Link href="/cars" className="btn btn-primary mt-6">تصفح المركبات</Link>
      </div>
    );
  }

  const active = threads.find((t) => t.id === activeId);
  const shown = q.trim()
    ? threads.filter((t) =>
        `${t.make} ${t.model} ${t.other_name}`.toLowerCase().includes(q.trim().toLowerCase()))
    : threads;

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* اللائحة */}
      <aside className={`card h-fit overflow-hidden ${active ? "hidden lg:block" : ""}`}>
        <div className="border-b p-3" style={{ borderColor: "var(--line-soft)" }}>
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-dim)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="قلّب فالمحادثات"
              className="field w-full pr-9 text-[12.5px]" aria-label="بحث فالمحادثات" />
          </div>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto">
          {shown.map((t) => (
            <li key={t.id}>
              <button onClick={() => setActiveId(t.id)}
                className="flex w-full items-start gap-2.5 border-b p-3 text-right transition-colors"
                style={{
                  borderColor: "var(--line-soft)",
                  background: t.id === activeId ? "var(--brand-soft)" : "transparent",
                }}>
                <span className="h-11 w-14 shrink-0 overflow-hidden rounded-lg">
                  <VehicleArt id={t.listing_ref} kind={t.kind} body={t.body as never}
                    color={t.color ?? "أبيض"} className="h-full w-full" label={`${t.make} ${t.model}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-bold">{t.other_name}</span>
                    {t.unread > 0 && (
                      <span className="num shrink-0 rounded-full px-1.5 text-[9.5px] font-extrabold"
                        style={{ background: "var(--brand)", color: "#fff" }}>{t.unread}</span>
                    )}
                  </span>
                  <bdi dir="ltr" className="block truncate text-[10.5px]" style={{ color: "var(--text-dim)" }}>
                    {t.make} {t.model} {t.year}
                  </bdi>
                  <span className="mt-0.5 block truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {t.last_body ?? "—"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* المحادثة */}
      {active && (
        <section className="card flex min-h-[62vh] flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b p-3.5" style={{ borderColor: "var(--line-soft)" }}>
            <button onClick={() => setActiveId("")} className="btn btn-icon btn-sm lg:hidden" aria-label="رجع">
              <ArrowRight size={16} />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[13.5px] font-bold">{active.other_name}</h2>
              <Link href={`/vehicle/${active.listing_slug}`}
                className="block truncate text-[11px] hover:underline" style={{ color: "var(--brand)" }}>
                <bdi dir="ltr">{active.make} {active.model} {active.year}</bdi>
              </Link>
            </div>
            <span className="chip chip-plain shrink-0 text-[10px]">
              {active.my_role === "buyer" ? "نتا المشتري" : "نتا البائع"}
            </span>
          </header>

          <div className="flex-1 space-y-2.5 overflow-y-auto p-4" style={{ background: "var(--surface-2)" }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? "justify-start" : "justify-end"}`}>
                <div className="max-w-[78%] rounded-2xl px-3.5 py-2.5"
                  style={{
                    background: m.mine ? "var(--brand)" : "var(--surface-1)",
                    color: m.mine ? "#fff" : "var(--text)",
                    border: m.mine ? "none" : "1px solid var(--line-soft)",
                    opacity: m.pending ? 0.6 : 1,
                  }}>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{m.body}</p>
                  <span className="mt-1 flex items-center gap-1 text-[9.5px]"
                    style={{ color: m.mine ? "rgba(255,255,255,0.7)" : "var(--text-dim)" }}>
                    {timeAgo(m.created_at)}
                    {m.mine && !m.pending && <Check size={10} />}
                  </span>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {err && (
            <p className="flex items-center gap-2 px-4 py-2 text-[11.5px]"
              style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
              <AlertTriangle size={13} /> {err}
            </p>
          )}

          <form onSubmit={send} className="flex items-end gap-2 border-t p-3" style={{ borderColor: "var(--line-soft)" }}>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(e); } }}
              rows={1} maxLength={2000} placeholder="كتب رسالتك…" aria-label="رسالة"
              className="field max-h-32 min-h-[42px] flex-1 resize-none py-2.5 text-[13px]" />
            <button type="submit" disabled={!draft.trim()} className="btn btn-primary shrink-0 disabled:opacity-40">
              <Send size={16} />
            </button>
          </form>

          <p className="flex items-start gap-2 border-t px-4 py-2.5 text-[10.5px] leading-relaxed"
            style={{ borderColor: "var(--line-soft)", color: "var(--text-muted)" }}>
            <ShieldAlert size={13} className="mt-px shrink-0" style={{ color: "var(--bad)" }} />
            ماتصيفطش عربوناً ولا معطياتك البنكية هنا. تلاقاو نهاراً وفبلاصة عامة.
            <Link href="/safety" className="font-bold underline" style={{ color: "var(--brand)" }}>دليل البيع الآمن</Link>
          </p>
        </section>
      )}
    </div>
  );
}
