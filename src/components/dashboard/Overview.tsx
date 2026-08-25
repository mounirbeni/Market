"use client";

import Link from "next/link";
import { useMemo } from "react";
import { VEHICLES } from "@/lib/data/vehicles";
import { THREADS } from "@/lib/data/threads";
import { trustOf, fairPriceOf } from "@/lib/market";
import { formatNumber, timeAgo } from "@/lib/format";
import { NOW } from "@/lib/data/seed";
import { vehicleHref } from "@/lib/slug";
import { artShape } from "@/lib/artshape";
import { VehicleArt } from "@/components/VehicleArt";
import { useApp } from "@/store/app";
import {
  ArrowLeft, BadgeCheck, Calendar, Car, Eye, Heart, Message, ShieldCheck,
  Sparkle, TrendingDown, Users,
} from "@/components/icons";

/** إعلانات البائع التجريبي */
export const MY_LISTINGS = VEHICLES.filter((v) => v.sellerId === "s01").slice(0, 6);

export function DashboardOverview() {
  const { favorites } = useApp();
  const unread = THREADS.reduce((s, t) => s + t.unread, 0);

  const stats = useMemo(() => {
    const views = MY_LISTINGS.reduce((s, v) => s + v.views, 0);
    const saves = MY_LISTINGS.reduce((s, v) => s + v.saves, 0);
    const avgTrust = MY_LISTINGS.length
      ? Math.round(MY_LISTINGS.reduce((s, v) => s + trustOf(v).score, 0) / MY_LISTINGS.length)
      : 0;
    return { views, saves, avgTrust };
  }, []);

  const cards = [
    { Icon: Car, v: formatNumber(MY_LISTINGS.length), l: "إعلان نشيط", c: "var(--brand)", href: "/dashboard/listings" },
    { Icon: Eye, v: formatNumber(stats.views), l: "مشاهدة", c: "var(--data)", href: "/dashboard/listings" },
    { Icon: Heart, v: formatNumber(stats.saves), l: "حفظ", c: "var(--bad)", href: "/dashboard/listings" },
    { Icon: Message, v: formatNumber(unread), l: "رسالة غير مقروءة", c: "var(--good)", href: "/dashboard/messages" },
    { Icon: ShieldCheck, v: `${stats.avgTrust}/100`, l: "متوسط الثقة", c: "var(--warn)", href: "/dashboard/listings" },
    { Icon: Users, v: formatNumber(favorites.length), l: "مركبة محفوظة", c: "var(--text-dim)", href: "/dashboard/favorites" },
  ];

  const weakest = [...MY_LISTINGS].sort((a, b) => trustOf(a).score - trustOf(b).score)[0];
  const weakTrust = weakest ? trustOf(weakest) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Link key={c.l} href={c.href} className="card card-hover p-4">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg"
              style={{ background: `color-mix(in oklab, ${c.c} 12%, transparent)`, color: c.c }}
            >
              <c.Icon size={17} />
            </span>
            <div className="num mt-3 text-xl font-extrabold">{c.v}</div>
            <div className="mt-0.5 text-[10.5px]" style={{ color: "var(--text-dim)" }}>{c.l}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* أحدث الإعلانات */}
        <section className="card overflow-hidden">
          <header
            className="flex items-center justify-between border-b p-4"
            style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
          >
            <h2 className="text-[14px] font-bold">إعلاناتك</h2>
            <Link href="/dashboard/listings" className="flex items-center gap-1 text-[12px] font-bold" style={{ color: "var(--brand)" }}>
              الكل <ArrowLeft size={13} />
            </Link>
          </header>
          <ul className="divide-y" style={{ borderColor: "var(--line-soft)" }}>
            {MY_LISTINGS.slice(0, 4).map((v) => {
              const fp = fairPriceOf(v);
              return (
                <li key={v.id}>
                  <Link href={vehicleHref(v)} className="flex items-center gap-3 p-3 transition hover:bg-[var(--surface-3)]">
                    <span className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                      <VehicleArt id={v.id} kind={v.kind} body={artShape(v)} color={v.color} className="h-full w-full" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-bold">{v.make} {v.model}</span>
                      <span className="num block text-[11px]" style={{ color: "var(--brand)" }}>
                        {formatNumber(v.price)} د.م
                      </span>
                    </span>
                    <span className="hidden shrink-0 gap-3 text-[10.5px] sm:flex" style={{ color: "var(--text-dim)" }}>
                      <span className="flex items-center gap-1"><Eye size={11} /> <span className="num">{formatNumber(v.views)}</span></span>
                      <span className="flex items-center gap-1"><Heart size={11} /> <span className="num">{v.saves}</span></span>
                    </span>
                    <span className="tag tag-mute shrink-0">{fp.weak ? "مراجع محدودة" : fp.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-5">
          {/* نصيحة تحسين */}
          {weakest && weakTrust && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 text-[13px] font-bold">
                <Sparkle size={15} style={{ color: "var(--brand)" }} /> حسّن إعلاناتك
              </h2>
              <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                أضعف إعلان عندك هو <b>{weakest.make} {weakest.model}</b> بنقطة{" "}
                <span className="num">{weakTrust.score}</span>/100.
              </p>
              <ul className="mt-3 space-y-2">
                {weakTrust.parts
                  .filter((p) => p.score < p.max * 0.7)
                  .slice(0, 3)
                  .map((p) => (
                    <li key={p.key} className="text-[11px]">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-muted)" }}>{p.label}</span>
                        <span className="num" style={{ color: "var(--bad)" }}>{p.score}/{p.max}</span>
                      </div>
                      <div className="meter mt-1" style={{ height: 4 }}>
                        <i style={{ width: `${(p.score / p.max) * 100}%`, background: "var(--bad)" }} />
                      </div>
                    </li>
                  ))}
              </ul>
              <Link href={vehicleHref(weakest)} className="btn btn-solid btn-sm mt-4 w-full">
                شوف الإعلان
              </Link>
            </section>
          )}

          {/* آخر الرسائل */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-bold">
              <Message size={15} style={{ color: "var(--brand)" }} /> آخر الرسائل
            </h2>
            <ul className="mt-3 space-y-3">
              {THREADS.slice(0, 3).map((t) => {
                const last = t.messages[t.messages.length - 1];
                return (
                  <li key={t.id}>
                    <Link href="/dashboard/messages" className="block">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12px] font-bold">{t.person}</span>
                        <span className="shrink-0 text-[10px]" style={{ color: "var(--text-dim)" }}>
                          {timeAgo(last.at, NOW)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {last.text}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* إجراءات */}
          <section className="card p-5">
            <h2 className="text-[13px] font-bold">إجراءات سريعة</h2>
            <div className="mt-3 grid gap-2">
              {[
                { href: "/sell", label: "انشر إعلاناً جديداً", Icon: Car },
                { href: "/valuation", label: "قيّم مركبة", Icon: TrendingDown },
                { href: "/dashboard/appointments", label: "شوف المواعيد", Icon: Calendar },
                { href: "/inspection", label: "اطلب فحصاً", Icon: BadgeCheck },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="btn btn-solid btn-sm w-full justify-start">
                  <a.Icon size={14} /> {a.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
