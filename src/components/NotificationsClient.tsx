"use client";

import Link from "next/link";
import { useApp } from "@/store/app";
import { NOTIFICATIONS } from "@/lib/data/notifications";
import { timeAgo } from "@/lib/format";
import { NOW } from "@/lib/data/seed";
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

export function NotificationsClient() {
  const { readNotifications, markRead, markAllRead, ready } = useApp();
  if (!ready) return null;

  const unread = NOTIFICATIONS.filter((n) => !readNotifications.includes(n.id));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          <span className="num font-bold" style={{ color: "var(--brand)" }}>{unread.length}</span> إشعار غير مقروء
        </p>
        {unread.length > 0 && (
          <button
            onClick={() => markAllRead(NOTIFICATIONS.map((n) => n.id))}
            className="btn btn-ghost btn-sm"
          >
            <Check size={13} /> علّم الكل كمقروء
          </button>
        )}
      </div>

      <ul className="space-y-2.5">
        {NOTIFICATIONS.map((n) => {
          const isRead = readNotifications.includes(n.id);
          const m = META[n.type];
          return (
            <li key={n.id}>
              <Link
                href={n.href}
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
                    <span>{timeAgo(n.at, NOW)}</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {NOTIFICATIONS.length === 0 && (
        <div className="card flex flex-col items-center p-12 text-center">
          <Bell size={30} style={{ color: "var(--text-dim)" }} />
          <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>ماكاين حتى إشعار.</p>
        </div>
      )}
    </div>
  );
}
