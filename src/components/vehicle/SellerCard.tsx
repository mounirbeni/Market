"use client";

import { useState } from "react";
import Link from "next/link";
import type { Seller, Vehicle } from "@/lib/types";
import { cityName } from "@/lib/cities";
import { AR } from "@/lib/format";
import { hashCode } from "@/lib/data/seed";

function phoneFor(id: string) {
  const h = hashCode(id);
  const prefix = ["06", "07"][h % 2];
  const rest = String(h % 100000000).padStart(8, "0");
  return `${prefix} ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6, 8)}`;
}

export function SellerCard({ seller, v }: { seller: Seller; v: Vehicle }) {
  const [revealed, setRevealed] = useState(false);
  const initials = seller.name.trim().slice(0, 1);

  return (
    <section className="card p-5">
      <div className="flex items-start gap-3">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-black"
          style={{ background: "var(--bg-inset)", color: "var(--accent)" }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-extrabold">{seller.name}</h3>
            {seller.idVerified && (
              <span title="هوية موثقة" style={{ color: "var(--color-atlas-400)" }} aria-label="هوية موثقة">✓</span>
            )}
          </div>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
            {AR.seller[seller.type]} · {cityName(seller.city)} · عضو منذ <span className="num">{seller.since}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
            <span className="chip">
              ★ <span className="num">{seller.rating.toFixed(1)}</span>
            </span>
            <span className="chip">
              <span className="num">{seller.salesCount}</span> عملية بيع
            </span>
            <span className="chip">
              يجاوب في ~<span className="num">{seller.responseMinutes}</span> دقيقة
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          onClick={() => setRevealed(true)}
          className="btn btn-primary w-full"
          aria-live="polite"
        >
          {revealed ? (
            <span className="num tracking-wider">{phoneFor(v.id)}</span>
          ) : (
            "📞 أظهر رقم الهاتف"
          )}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-ghost btn-sm">💬 راسل البائع</button>
          <Link href="/inspection" className="btn btn-ghost btn-sm">🔧 اطلب فحصاً</Link>
        </div>
      </div>

      <div
        className="mt-4 rounded-lg p-3 text-[11px] leading-relaxed"
        style={{ background: "color-mix(in oklab, var(--color-clay-500) 12%, transparent)", color: "var(--text-muted)" }}
      >
        <b style={{ color: "var(--color-clay-400)" }}>ماتخلّصش قبل ما تشوف:</b> حتى بائع جدي
        ماغاديش يطلب منك عربوناً قبل المعاينة. تلاقاو فبلاصة عامة ونهاراً، وتأكد من
        البطاقة الرمادية ورقم الهيكل.{" "}
        <Link href="/safety" className="underline">دليل البيع الآمن</Link>
      </div>
    </section>
  );
}
