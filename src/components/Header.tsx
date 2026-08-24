"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { Logo } from "./Logo";
import { UnitToggle } from "./Price";

const NAV = [
  { href: "/vehicles?kind=car", label: "سيارات" },
  { href: "/vehicles?kind=moto", label: "دراجات نارية" },
  { href: "/estimate", label: "قيّم مركبتك" },
  { href: "/cost", label: "التكلفة الحقيقية" },
  { href: "/inspection", label: "الفحص المستقل" },
  { href: "/safety", label: "البيع الآمن" },
];

export function Header() {
  const { favorites, compare, theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all"
      style={{
        background: scrolled ? "color-mix(in oklab, var(--bg) 88%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--line-soft)" : "transparent"}`,
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link href="/" aria-label="الصفحة الرئيسية">
          <Logo />
        </Link>

        <nav className="mr-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-2 text-[13px] font-bold transition hover:bg-[var(--bg-inset)]"
              style={{ color: "var(--text-muted)" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mr-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <UnitToggle compact />
          </div>

          <button
            onClick={toggleTheme}
            aria-label="تبديل الوضع الليلي"
            className="grid h-9 w-9 place-items-center rounded-full border transition hover:border-[var(--accent)]"
            style={{ borderColor: "var(--line)" }}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>

          <Link
            href="/favorites"
            className="relative grid h-9 w-9 place-items-center rounded-full border transition hover:border-[var(--accent)]"
            style={{ borderColor: "var(--line)" }}
            aria-label="المفضلة"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            {favorites.length > 0 && (
              <span className="num absolute -top-1 -left-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold"
                style={{ background: "var(--color-clay-500)", color: "#fff" }}>
                {favorites.length}
              </span>
            )}
          </Link>

          {compare.length > 0 && (
            <Link
              href="/compare"
              className="relative hidden h-9 w-9 place-items-center rounded-full border sm:grid"
              style={{ borderColor: "var(--color-majorelle-400)", color: "var(--color-majorelle-400)" }}
              aria-label="المقارنة"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h10M4 17h6" />
              </svg>
              <span className="num absolute -top-1 -left-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
                style={{ background: "var(--color-majorelle-500)", color: "#fff" }}>
                {compare.length}
              </span>
            </Link>
          )}

          <Link href="/sell" className="btn btn-primary btn-sm hidden md:inline-flex">
            بيع مركبتك
          </Link>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="القائمة"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border lg:hidden"
            style={{ borderColor: "var(--line)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          className="border-t lg:hidden"
          style={{ background: "var(--bg-raised)", borderColor: "var(--line-soft)" }}
        >
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-bold"
                  style={{ background: "var(--bg-inset)" }}
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <UnitToggle />
              <Link href="/sell" className="btn btn-primary btn-sm">
                بيع مركبتك
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
