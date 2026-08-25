"use client";

import { useState } from "react";
import Link from "next/link";
import type { Seller, Vehicle } from "@/lib/types";
import { cityName } from "@/lib/cities";
import { AR } from "@/lib/format";
import { hashCode } from "@/lib/data/seed";
import { BadgeCheck, Clock, MapPin, Message, Phone, ShieldAlert, Star, Wrench } from "@/components/icons";

function phoneFor(id: string) {
  const h = hashCode(id);
  const prefix = ["06", "07"][h % 2];
  const rest = String(h % 100000000).padStart(8, "0");
  return `${prefix} ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6, 8)}`;
}

export function SellerCard({ seller, v }: { seller: Seller; v: Vehicle }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-extrabold"
            style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
            aria-hidden="true"
          >
            {seller.name.trim().slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-bold">{seller.name}</h3>
              {seller.idVerified && (
                <BadgeCheck size={15} style={{ color: "var(--good)" }} aria-label="هوية موثقة" />
              )}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
              <span>{AR.seller[seller.type]}</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> {cityName(seller.city)}</span>
              <span>عضو منذ <span className="num">{seller.since}</span></span>
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="chip chip-plain">
                <Star size={11} filled style={{ color: "var(--warn)" }} />
                <span className="num">{seller.rating.toFixed(1)}</span>
              </span>
              <span className="chip chip-plain">
                <span className="num">{seller.salesCount}</span> عملية بيع
              </span>
              <span className="chip chip-plain">
                <Clock size={11} /> ~<span className="num">{seller.responseMinutes}</span> دقيقة
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <button onClick={() => setRevealed(true)} className="btn btn-primary w-full" aria-live="polite">
            <Phone size={16} />
            {revealed ? <span className="num tracking-wider">{phoneFor(v.id)}</span> : "أظهر رقم الهاتف"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-solid btn-sm"><Message size={14} /> راسل البائع</button>
            <Link href="/inspection" className="btn btn-solid btn-sm"><Wrench size={14} /> اطلب فحصاً</Link>
          </div>
        </div>
      </div>

      <div
        className="flex gap-2.5 border-t p-4 text-[11px] leading-relaxed"
        style={{ borderColor: "var(--line-soft)", background: "var(--bad-soft)", color: "var(--text-muted)" }}
      >
        <ShieldAlert size={16} className="mt-px shrink-0" style={{ color: "var(--bad)" }} />
        <span>
          <b style={{ color: "var(--bad)" }}>ماتخلّصش قبل ما تشوف:</b> حتى بائع جدي ماغاديش
          يطلب منك عربوناً قبل المعاينة. تلاقاو فبلاصة عامة ونهاراً، وتأكد من البطاقة
          الرمادية ورقم الهيكل.{" "}
          <Link href="/safety" className="font-bold underline">دليل البيع الآمن</Link>
        </span>
      </div>
    </section>
  );
}
