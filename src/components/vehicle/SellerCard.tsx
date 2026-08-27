"use client";

import { useState } from "react";
import Link from "next/link";
import type { Seller, Vehicle } from "@/lib/types";
import { cityName } from "@/lib/cities";
import { AR } from "@/lib/format";
import { vehicleHref } from "@/lib/slug";
import { ReportDialog } from "./ReportDialog";
import { ContactSellerButton } from "./ContactSellerButton";
import { AppointmentDialog } from "./AppointmentDialog";
import {
  BadgeCheck, Calendar, Check, Clock, Flag, MapPin, Phone, Share,
  ShieldAlert, Star, Whatsapp, Wrench,
} from "@/components/icons";

/** رقم دولي للواتساب من نفس البذرة ديال الرقم المحلي */
/** رقم واتساب من الرقم المغربي: 0612… ← 212612… */
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("212") ? d : `212${d.replace(/^0/, "")}`;
};

/* الرقم كان مولّداً من معرّف الإعلان — رقم مغربي حقيقي ديال شي
   واحد آخر. دابا كيجي من حساب البائع، وإلا ماكانش كنخبّيو الأزرار. */

export function SellerCard({ seller, v }: { seller: Seller; v: Vehicle }) {
  const [revealed, setRevealed] = useState(false);
  const [shared, setShared] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [booking, setBooking] = useState(false);

  const title = `${v.make} ${v.model} ${v.year}`;
  const waText = encodeURIComponent(
    `سلام، شفت الإعلان ديال ${title} فطريق وبغيت نستفسر. واش مازال متوفر؟`,
  );

  async function share() {
    const url = typeof window === "undefined" ? "" : window.location.origin + vehicleHref(v);
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2200);
      }
    } catch {
      /* المستخدم ألغى المشاركة */
    }
  }

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
          {seller.phone ? (
            revealed ? (
              <a href={`tel:${seller.phone}`} className="btn btn-primary w-full">
                <Phone size={16} />
                <span className="num tracking-wider">{seller.phone}</span>
              </a>
            ) : (
              <button onClick={() => setRevealed(true)} className="btn btn-primary w-full" aria-live="polite">
                <Phone size={16} /> أظهر رقم الهاتف
              </button>
            )
          ) : null}
          {seller.phone && (
            <a
              href={`https://wa.me/${waNumber(seller.phone)}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full font-bold"
              style={{ background: "#25D366", color: "#062d16" }}
            >
              <Whatsapp size={17} /> راسلو على واتساب
            </a>
          )}
          <div className="grid grid-cols-2 gap-2">
            <ContactSellerButton listingRef={v.id} label="رسالة داخلية" />
            <button onClick={() => setBooking(true)} className="btn btn-solid btn-sm">
              <Calendar size={14} /> اطلب موعد
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={share} className="btn btn-solid btn-sm" aria-live="polite">
              {shared ? <Check size={14} style={{ color: "var(--good)" }} /> : <Share size={14} />}
              {shared ? "تنسخ الرابط" : "شارك"}
            </button>
            <Link href="/inspection" className="btn btn-solid btn-sm">
              <Wrench size={14} /> اطلب فحصاً
            </Link>
          </div>
          <button
            onClick={() => setReporting(true)}
            className="mt-1 flex items-center justify-center gap-1.5 text-[11.5px] font-bold transition-colors hover:underline"
            style={{ color: "var(--text-dim)" }}
          >
            <Flag size={12} /> بلّغ على هاد الإعلان
          </button>
        </div>
      </div>

      {reporting && <ReportDialog v={v} onClose={() => setReporting(false)} />}
      {booking && <AppointmentDialog v={v} onClose={() => setBooking(false)} />}

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
