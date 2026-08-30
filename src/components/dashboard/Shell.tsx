"use client";

import { Link } from "@/components/Link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useApp } from "@/store/app";
import { useSession } from "@/store/session";
import { useDict } from "@/lib/i18n/client";
import { Avatar } from "@/components/Avatar";
import { ProfileCompletionBanner } from "./ProfileCompletionBanner";
import {
  BadgeCheck, Calendar, Car, Chart, Heart, Message, Plus, ShieldCheck, Sliders, Users,
} from "@/components/icons";

const NAV_META = [
  { href: "/dashboard", key: "overview", Icon: Chart },
  { href: "/dashboard/listings", key: "listings", Icon: Car },
  { href: "/dashboard/messages", key: "messages", Icon: Message },
  { href: "/dashboard/appointments", key: "appointments", Icon: Calendar },
  { href: "/dashboard/favorites", key: "favorites", Icon: Heart },
  { href: "/dashboard/dealer", key: "dealer", Icon: Users },
  { href: "/dashboard/trust", key: "trust", Icon: ShieldCheck },
  { href: "/dashboard/settings", key: "settings", Icon: Sliders },
] as const;

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const t = useDict();
  const s = t.dashShell;
  const NAV = NAV_META.map((n) => ({ ...n, label: s.nav[n.key] }));
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
          <h1 className="mt-5 text-lg font-bold">{s.loginRequiredTitle}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {s.loginRequiredText}
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/login" className="btn btn-primary">{s.login}</Link>
            <Link href="/register" className="btn btn-ghost">{s.register}</Link>
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
              <Avatar
                src={user.avatar_url}
                name={user.name}
                className="h-11 w-11 rounded-xl text-lg"
                style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-bold">{user.name}</span>
                  {user.email_verified && (
                    <BadgeCheck size={13} style={{ color: "var(--good)" }} aria-label={s.emailVerifiedAria} />
                  )}
                </div>
                <span className="text-[10.5px]" style={{ color: "var(--text-dim)" }}>
                  {user.type === "professionnel" ? s.pro : s.individual} ·{" "}
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
              <Link href="/sell" className="btn btn-primary btn-sm w-full"><Plus size={14} /> {s.newListing}</Link>
              <button onClick={() => void signOut()} className="btn btn-ghost btn-sm mt-2 w-full">{s.signOut}</button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <h1 className="mb-6 text-2xl font-extrabold tracking-tight">{title}</h1>
          <ProfileCompletionBanner user={user} />
          {children}
        </div>
      </div>
    </div>
  );
}
