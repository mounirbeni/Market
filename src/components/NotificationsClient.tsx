"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/store/session";
import { timeAgo } from "@/lib/format";
import {
  Bell, BadgeCheck, Calendar, Check, Message, ShieldCheck, TrendingDown,
} from "@/components/icons";

const META = {
  message: { Icon: Message, color: "var(--brand)", label: "رسالة" },
  "price-drop": { Icon: TrendingDown, color: "var(--good)", label: "انخفاض ثمن" },
  listing: { Icon: BadgeCheck, color: "var(--data)", label: "إعلان" },
  appointment: { Icon: Calendar, color: "var(--warn)", label: "موعد" },
  system: { Icon: ShieldCheck, color: "var(--text-dim)", label: "النظام" },
} as const;

interface Notif {
  id: string;
  type: keyof typeof META;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationsClient() {
  const { user } = useSession();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let alive = true;
    fetch("/api/me/notifications")
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok) setItems(j.data.items as Notif[]);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const markRead = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
    );
    fetch("/api/me/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    fetch("/api/me/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="card flex flex-col items-center p-12 text-center">
        <Bell size={30} style={{ color: "var(--text-dim)" }} />
        <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
          سجّل الدخول باش تشوف الإشعارات ديالك.
        </p>
        <Link href="/login?next=%2Fnotifications" className="btn btn-primary mt-5">تسجيل الدخول</Link>
      </div>
    );
  }
  if (loading) return null;

  const unread = items.filter((n) => !n.read_at);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          <span className="num font-bold" style={{ color: "var(--brand)" }}>{unread.length}</span> إشعار غير مقروء
        </p>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="btn btn-ghost btn-sm">
            <Check size={13} /> علّم الكل كمقروء
          </button>
        )}
      </div>

      <ul className="space-y-2.5">
        {items.map((n) => {
          const isRead = Boolean(n.read_at);
          const m = META[n.type] ?? META.system;
          return (
            <li key={n.id}>
              <Link
                href={n.href ?? "#"}
                onClick={() => markRead(n.id)}
                className="card card-hover flex gap-3.5 p-4"
                style={{ borderColor: isRead ? "var(--line-soft)" : "var(--brand)" }}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${m.color} 12%, transparent)`, color: m.color }}
                >
                  <m.Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold">{n.title}</span>
                    {!isRead && (
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand)" }} />
                    )}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {n.body}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
                    <span className="tag tag-mute">{m.label}</span>
                    <span>{timeAgo(n.created_at)}</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {items.length === 0 && (
        <div className="card flex flex-col items-center p-12 text-center">
          <Bell size={30} style={{ color: "var(--text-dim)" }} />
          <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>ماكاين حتى إشعار.</p>
        </div>
      )}
    </div>
  );
}
