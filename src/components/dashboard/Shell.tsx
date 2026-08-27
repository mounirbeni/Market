"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useApp } from "@/store/app";
import { useSession } from "@/store/session";
import {
  BadgeCheck, Calendar, Car, Chart, Heart, Message, Plus, Sliders, Users,
} from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "لوحة القيادة", Icon: Chart },
  { href: "/dashboard/listings", label: "إعلاناتي", Icon: Car },
  { href: "/dashboard/messages", label: "الرسائل", Icon: Message },
  { href: "/dashboard/appointments", label: "المواعيد", Icon: Calendar },
  { href: "/dashboard/favorites", label: "المفضلة", Icon: Heart },
  { href: "/dashboard/dealer", label: "المعرض ديالي", Icon: Users },
  { href: "/dashboard/settings", label: "الإعدادات", Icon: Sliders },
];

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const { favorites, ready } = useApp();
  const { user, signOut, unread } = useSession();

  if (!ready) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-20">
        <div className="card flex flex-col items-center p-12 text-center">
          <span
            className="grid h-16 w-16 place-items-center rounded-2xl"
            style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
          >
            <Users size={30} />
          </span>
          <h1 className="mt-5 text-lg font-bold">خاصك تسجّل الدخول</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            لوحة البائع فيها إعلاناتك ورسائلك ومواعيدك. دخل لحسابك باش توصل ليها.
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/login" className="btn btn-primary">تسجيل الدخول</Link>
            <Link href="/register" className="btn btn-ghost">إنشاء حساب</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="lg:sticky lg:top-[84px] lg:h-fit">
          <div className="card overflow-hidden">
            <div
              className="flex items-center gap-3 border-b p-4"
              style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-extrabold"
                style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
              >
                {user.name.trim().slice(0, 1)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-bold">{user.name}</span>
                  {user.email_verified && (
                    <BadgeCheck size={13} style={{ color: "var(--good)" }} aria-label="إيميل موثّق" />
                  )}
                </div>
                <span className="text-[10.5px]" style={{ color: "var(--text-dim)" }}>
                  {user.type === "professionnel" ? "محترف" : "خاص"} ·{" "}
                  <bdi dir="ltr">{user.email}</bdi>
                </span>
              </div>
            </div>

            <nav className="p-2">
              {NAV.map(({ href, label, Icon }) => {
                const active = pathname === href;
                const badge =
                  href === "/dashboard/messages" ? unread
                    : href === "/dashboard/favorites" ? favorites.length : 0;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12.5px] font-semibold transition"
                    style={{
                      background: active ? "var(--brand-soft)" : "transparent",
                      color: active ? "var(--brand)" : "var(--text-muted)",
                    }}
                  >
                    <Icon size={16} />
                    <span className="flex-1">{label}</span>
                    {badge > 0 && (
                      <span
                        className="num grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold"
                        style={{ background: "var(--brand)", color: "#fff" }}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t p-3" style={{ borderColor: "var(--line-soft)" }}>
              <Link href="/sell" className="btn btn-primary btn-sm w-full"><Plus size={14} /> إعلان جديد</Link>
              <button onClick={() => void signOut()} className="btn btn-ghost btn-sm mt-2 w-full">تسجيل الخروج</button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <h1 className="mb-6 text-2xl font-extrabold tracking-tight">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
