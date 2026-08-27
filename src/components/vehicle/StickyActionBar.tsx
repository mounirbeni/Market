"use client";

import { useEffect, useState } from "react";
import type { Vehicle } from "@/lib/types";
import { useApp } from "@/store/app";
import { Price } from "@/components/Price";
import { trustColor, trustOf } from "@/lib/market";
import { Heart, Phone, ShieldCheck, Whatsapp } from "@/components/icons";

/* الرقم كان مولّداً من معرّف الإعلان — رقم مغربي حقيقي ديال شي
   واحد آخر. دابا كيجي من حساب البائع، وإلا ماكانش كنخبّيو الأزرار. */
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("212") ? d : `212${d.replace(/^0/, "")}`;
};

export function StickyActionBar({ v }: { v: Vehicle }) {
  const phone = v.seller?.phone ?? null;
  const { isFavorite, toggleFavorite, compare, ready } = useApp();
  const [revealed, setRevealed] = useState(false);
  const [show, setShow] = useState(false);
  const trust = trustOf(v);
  const fav = isFavorite(v.id);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!ready || !show) return null;

  return (
    <div
      className="fixed inset-x-0 z-30 px-3 pb-3 lg:hidden animate-rise"
      style={{
        bottom: `calc(${compare.length > 0 ? 132 : 60}px + env(safe-area-inset-bottom))`,
      }}
    >
      <div
        className="flex items-center gap-2.5 rounded-2xl border p-2.5"
        style={{
          background: "color-mix(in oklab, var(--surface-1) 94%, transparent)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--line)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="min-w-0 flex-1">
          <Price value={v.price} className="text-[17px] font-extrabold" />
          <span
            className="mt-0.5 flex items-center gap-1 text-[10.5px]"
            style={{ color: trustColor(trust.score) }}
          >
            <ShieldCheck size={11} /> ثقة <span className="num">{trust.score}</span>/100
          </span>
        </div>

        <button
          onClick={() => toggleFavorite(v.id)}
          aria-label="المفضلة"
          aria-pressed={fav}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition"
          style={{
            borderColor: fav ? "transparent" : "var(--line)",
            background: fav ? "var(--bad)" : "transparent",
            color: fav ? "#fff" : "var(--text-muted)",
          }}
        >
          <Heart size={17} filled={fav} />
        </button>

        {phone && (
          <a
            href={`https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(
              `سلام، شفت الإعلان ديال ${v.make} ${v.model} ${v.year} فطريق. واش مازال متوفر؟`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="واتساب"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ background: "#25D366", color: "#062d16" }}
          >
            <Whatsapp size={18} />
          </a>
        )}

        {phone &&
          (revealed ? (
            <a href={`tel:${phone}`} className="btn btn-primary shrink-0">
              <Phone size={15} />
              <span className="num text-[12px]">{phone}</span>
            </a>
          ) : (
            <button onClick={() => setRevealed(true)} className="btn btn-primary shrink-0">
              <Phone size={15} /> اتصل
            </button>
          ))}
      </div>
    </div>
  );
}
