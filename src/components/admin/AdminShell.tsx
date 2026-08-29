"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BadgeCheck, Car, Chart, FileText, IdCard, ShieldAlert, Sliders, Star, Users,
} from "@/components/icons";

const NAV = [
  { href: "/admin", label: "نظرة عامة", Icon: Chart },
  { href: "/admin/reports", label: "التبليغات", Icon: ShieldAlert },
  { href: "/admin/listings", label: "الإعلانات", Icon: Car },
  { href: "/admin/users", label: "الحسابات", Icon: Users },
  { href: "/admin/verifications", label: "التوثيق", Icon: IdCard },
  { href: "/admin/dealers", label: "المعارض", Icon: BadgeCheck },
  { href: "/admin/promos", label: "الترويج", Icon: Star },
  { href: "/admin/catalog", label: "الكتالوج", Icon: Sliders },
  { href: "/admin/log", label: "السجل", Icon: FileText },
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow"><ShieldAlert size={13} /> إشراف</span>
          <h1 className="h-section mt-2">لوحة التحكّم</h1>
        </div>
        <div className="flex items-center gap-2">
          <bdi dir="ltr" className="text-[11.5px]" style={{ color: "var(--text-dim)" }}>
            {email}
          </bdi>
          <button onClick={logout} className="btn btn-solid btn-sm">خروج</button>
        </div>
      </header>

      <nav className="mb-6 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {NAV.map(({ href, label, Icon }) => {
          const on = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
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
