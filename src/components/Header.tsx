"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { useSession } from "@/store/session";
import { Logo } from "./Logo";
import { UnitToggle } from "./Price";
import {
  Bell, Car, Close, Coins, FileText, Heart, Menu, Moon, Moto, Plus, Scale,
  Search, ShieldCheck, Sun, Users, Wallet,
} from "./icons";

const NAV = [
  { href: "/cars", label: "سيارات", Icon: Car },
  { href: "/motorcycles", label: "دراجات نارية", Icon: Moto },
  { href: "/search", label: "البحث المتقدم", Icon: Search },
  { href: "/dealers", label: "الوكلاء", Icon: Users },
  { href: "/valuation", label: "قيّم مركبتك", Icon: Wallet },
  { href: "/guides", label: "نصائح", Icon: FileText },
];

const MORE = [
  { href: "/assistant", label: "مساعد الاختيار" },
  { href: "/promote", label: "روّج إعلانك" },
  { href: "/cost", label: "حاسبة التكلفة" },
  { href: "/inspection", label: "الفحص المستقل" },
  { href: "/safety", label: "البيع الآمن" },
  { href: "/compare", label: "المقارنة" },
];

function NavIconButton({
  href, label, children, active, count, onClick,
}: {
  href?: string;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}) {
  const cls = "relative grid h-9 w-9 place-items-center rounded-lg border transition hover:bg-white/10";
  const style = {
    borderColor: active ? "rgba(255,255,255,0.35)" : "var(--nav-line)",
    color: "var(--nav-text)",
    background: active ? "rgba(255,255,255,0.12)" : "transparent",
  };
  const badge =
    count && count > 0 ? (
      <span
        className="num absolute -top-1.5 -left-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9.5px] font-bold"
        style={{ background: "var(--brand)", color: "#fff" }}
      >
        {count}
      </span>
    ) : null;
  return href ? (
    <Link href={href} aria-label={label} className={cls} style={style}>{children}{badge}</Link>
  ) : (
    <button onClick={onClick} aria-label={label} className={cls} style={style}>{children}{badge}</button>
  );
}

export function Header() {
  const { favorites, compare, theme, toggleTheme } = useApp();
  const { user } = useSession();
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

  /* عدد الإشعارات غير المقروءة — من قاعدة البيانات */
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    let alive = true;
    fetch("/api/me/notifications")
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok)
          setUnread((j.data.items as { read_at: string | null }[]).filter((n) => !n.read_at).length);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);

  return (
    <header
      className="navbar sticky top-0 z-50 transition-shadow duration-300"
      style={{ boxShadow: scrolled ? "0 8px 26px -18px rgba(3,8,18,0.95)" : "none" }}
    >
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-3 px-4">
        <Link href="/" aria-label="الصفحة الرئيسية" className="shrink-0">
          <Logo />
        </Link>

        <nav className="mr-4 hidden items-center gap-0.5 xl:flex">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition hover:bg-white/10"
                style={{ color: active ? "var(--nav-text)" : "var(--nav-muted)" }}
              >
                <Icon size={15} style={{ opacity: 0.8 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mr-auto flex items-center gap-2">
          <div className="hidden lg:block"><UnitToggle compact onNav /></div>

          <NavIconButton onClick={toggleTheme} label="تبديل الوضع الليلي">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </NavIconButton>

          <div className="hidden sm:block">
            <NavIconButton href="/notifications" label="الإشعارات" count={unread} active={unread > 0}>
              <Bell size={17} />
            </NavIconButton>
          </div>

          <NavIconButton href="/favorites" label="المفضلة" count={favorites.length} active={favorites.length > 0}>
            <Heart size={17} filled={favorites.length > 0} />
          </NavIconButton>

          {compare.length > 0 && (
            <div className="hidden sm:block">
              <NavIconButton href="/compare" label="المقارنة" count={compare.length} active>
                <Scale size={17} />
              </NavIconButton>
            </div>
          )}

          <Link
            href={user ? "/dashboard" : "/login"}
            className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] font-bold transition hover:bg-white/10 sm:flex"
            style={{ borderColor: "var(--nav-line)", color: "var(--nav-text)" }}
          >
            <Users size={15} />
            {user ? user.name.split(" ")[0] : "تسجيل الدخول"}
          </Link>

          <Link href="/sell" className="btn btn-primary btn-sm hidden md:inline-flex">
            <Plus size={15} /> بيع مركبتك
          </Link>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="القائمة"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-lg border xl:hidden"
            style={{ borderColor: "var(--nav-line)", color: "var(--nav-text)" }}
          >
            {open ? <Close size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="animate-fade border-t xl:hidden"
          style={{ background: "rgba(255,255,255,0.06)", borderColor: "var(--nav-line)" }}
        >
          <div className="mx-auto max-w-[1400px] px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {NAV.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-bold"
                  style={{ background: "rgba(255,255,255,0.08)", color: "var(--nav-text)" }}
                >
                  <Icon size={16} style={{ color: "var(--color-blue-300)" }} />
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MORE.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--nav-muted)" }}
                >
                  {m.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <UnitToggle onNav />
              <div className="flex gap-2">
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="btn btn-sm"
                  style={{ border: "1px solid var(--nav-line)", color: "var(--nav-text)" }}
                >
                  <Users size={14} /> {user ? "حسابي" : "دخول"}
                </Link>
                <Link href="/sell" className="btn btn-primary btn-sm"><Plus size={14} /> بيع</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/** شريط تنقّل سفلي للهاتف */
export function MobileNav() {
  const pathname = usePathname();
  const { favorites } = useApp();
  const { user } = useSession();

  const items = [
    { href: "/", label: "الرئيسية", Icon: ShieldCheck },
    { href: "/search", label: "بحث", Icon: Search },
    { href: "/sell", label: "بيع", Icon: Plus, primary: true },
    { href: "/favorites", label: "المفضلة", Icon: Heart, count: favorites.length },
    { href: user ? "/dashboard" : "/login", label: "حسابي", Icon: Users },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t sm:hidden"
      style={{ background: "var(--surface-1)", borderColor: "var(--line-soft)" }}
      aria-label="التنقل السريع"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ href, label, Icon, primary, count }) => {
          const active = pathname === href;
          if (primary) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 py-2">
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{ background: "var(--brand)", color: "#fff" }}
                >
                  <Icon size={19} />
                </span>
                <span className="text-[9.5px] font-bold" style={{ color: "var(--brand)" }}>{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 py-2.5"
              style={{ color: active ? "var(--brand)" : "var(--text-dim)" }}
            >
              <Icon size={19} filled={active && href === "/favorites"} />
              <span className="text-[9.5px] font-bold">{label}</span>
              {count ? (
                <span
                  className="num absolute right-1/2 top-1 translate-x-4 rounded-full px-1 text-[8.5px] font-bold"
                  style={{ background: "var(--bad)", color: "#fff" }}
                >
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
