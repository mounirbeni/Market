"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { Logo } from "./Logo";
import { UnitToggle } from "./Price";
import {
  Calculator, Car, Close, Heart, Menu, Moon, Moto, Scale,
  ShieldCheck, Sun, Wallet, Wrench,
} from "./icons";

const NAV = [
  { href: "/vehicles?kind=car", label: "سيارات", Icon: Car },
  { href: "/vehicles?kind=moto", label: "دراجات نارية", Icon: Moto },
  { href: "/estimate", label: "قيّم مركبتك", Icon: Wallet },
  { href: "/cost", label: "التكلفة الحقيقية", Icon: Calculator },
  { href: "/inspection", label: "الفحص المستقل", Icon: Wrench },
  { href: "/safety", label: "البيع الآمن", Icon: ShieldCheck },
];

function IconButton({
  onClick, label, children, active, count, href,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  count?: number;
  href?: string;
}) {
  const cls = "relative grid h-9 w-9 place-items-center rounded-lg border transition";
  const style = {
    borderColor: active ? "var(--brand)" : "var(--line)",
    color: active ? "var(--brand)" : "var(--text-muted)",
    background: active ? "var(--brand-soft)" : "transparent",
  };
  const badge = count && count > 0 ? (
    <span
      className="num absolute -top-1.5 -left-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9.5px] font-bold"
      style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
    >
      {count}
    </span>
  ) : null;

  if (href) {
    return (
      <Link href={href} aria-label={label} className={cls} style={style}>
        {children}{badge}
      </Link>
    );
  }
  return (
    <button onClick={onClick} aria-label={label} className={cls} style={style}>
      {children}{badge}
    </button>
  );
}

export function Header() {
  const { favorites, compare, theme, toggleTheme } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "color-mix(in oklab, var(--bg) 82%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--line-soft)" : "transparent"}`,
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-3 px-4">
        <Link href="/" aria-label="الصفحة الرئيسية" className="shrink-0">
          <Logo />
        </Link>

        <nav className="mr-5 hidden items-center gap-0.5 lg:flex">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href.split("?")[0] && href.includes(pathname);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition"
                style={{ color: active ? "var(--text)" : "var(--text-muted)" }}
              >
                <Icon size={15} style={{ opacity: 0.75 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mr-auto flex items-center gap-2">
          <div className="hidden sm:block"><UnitToggle compact /></div>

          <IconButton onClick={toggleTheme} label="تبديل الوضع الليلي">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </IconButton>

          <IconButton href="/favorites" label="المفضلة" count={favorites.length} active={favorites.length > 0}>
            <Heart size={17} filled={favorites.length > 0} />
          </IconButton>

          {compare.length > 0 && (
            <div className="hidden sm:block">
              <IconButton href="/compare" label="المقارنة" count={compare.length} active>
                <Scale size={17} />
              </IconButton>
            </div>
          )}

          <Link href="/sell" className="btn btn-primary btn-sm hidden md:inline-flex">
            بيع مركبتك
          </Link>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="القائمة"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-lg border lg:hidden"
            style={{ borderColor: "var(--line)", color: "var(--text-muted)" }}
          >
            {open ? <Close size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="border-t lg:hidden animate-fade"
          style={{ background: "var(--surface-1)", borderColor: "var(--line-soft)" }}
        >
          <div className="mx-auto max-w-[1400px] px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {NAV.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-bold"
                  style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
                >
                  <Icon size={16} style={{ color: "var(--brand)" }} />
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <UnitToggle />
              <Link href="/sell" className="btn btn-primary btn-sm">بيع مركبتك</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
