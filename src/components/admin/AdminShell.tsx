"use client";

import { Link } from "@/components/Link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useDict, useHref } from "@/lib/i18n/client";
import {
  BadgeCheck, Car, Chart, FileText, IdCard, ShieldAlert, Sliders, Star, Users,
} from "@/components/icons";

const NAV_META = [
  { href: "/admin", key: "overview", Icon: Chart },
  { href: "/admin/reports", key: "reports", Icon: ShieldAlert },
  { href: "/admin/listings", key: "listings", Icon: Car },
  { href: "/admin/users", key: "users", Icon: Users },
  { href: "/admin/verifications", key: "verifications", Icon: IdCard },
  { href: "/admin/dealers", key: "dealers", Icon: BadgeCheck },
  { href: "/admin/promos", key: "promos", Icon: Star },
  { href: "/admin/catalog", key: "catalog", Icon: Sliders },
  { href: "/admin/log", key: "log", Icon: FileText },
] as const;

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const t = useDict();
  const s = t.adminShell;
  const href = useHref();
  const NAV = NAV_META.map((n) => ({ ...n, label: s.nav[n.key] }));
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = href("/");
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow"><ShieldAlert size={13} /> {s.eyebrow}</span>
          <h1 className="h-section mt-2">{s.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <bdi dir="ltr" className="text-[11.5px]" style={{ color: "var(--text-dim)" }}>
            {email}
          </bdi>
          <button onClick={logout} className="btn btn-solid btn-sm">{s.signOut}</button>
        </div>
      </header>

      <nav className="mb-6 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {NAV.map(({ href: navHref, label, Icon }) => {
          const on = navHref === "/admin" ? pathname === navHref : pathname.startsWith(navHref);
          return (
            <Link
              key={navHref}
              href={navHref}
              className="chip shrink-0 transition"
              style={{
                borderColor: on ? "var(--brand)" : "var(--line)",
                background: on ? "var(--brand-soft)" : "var(--surface-1)",
                color: on ? "var(--brand)" : "var(--text-muted)",
              }}
            >
              <Icon size={13} /> {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
