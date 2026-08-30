"use client";

import { useState } from "react";
import type { Dealer } from "@/lib/dealers";
import { Calendar, Message, Phone, Share } from "./icons";
import { useDict } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/labels";

/* الرقم كان مولّداً من معرّف المعرض — رقم ماكيوصل لحتى حد.
   دابا كيجي من الحساب ديال صاحب المعرض، وإلا ماكانش كنخبّيو
   الزر بدل ما نعطيو الزائر رقماً غالطاً. */

export function DealerContact({ dealer }: { dealer: Dealer }) {
  const t = useDict();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: dealer.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* المستخدم ألغى المشاركة */
    }
  }

  return (
    <section className="card p-5">
      <h2 className="text-[13px] font-bold">{t.dealerContact.title}</h2>
      <div className="mt-4 grid gap-2">
        {dealer.phone ? (
          revealed ? (
            <a href={`tel:${dealer.phone}`} className="btn btn-primary w-full">
              <Phone size={16} />
              <span className="num tracking-wider">{dealer.phone}</span>
            </a>
          ) : (
            <button onClick={() => setRevealed(true)} className="btn btn-primary w-full" aria-live="polite">
              <Phone size={16} /> {t.dealerContact.revealPhone}
            </button>
          )
        ) : null}
        {dealer.phone && (
          <a
            href={`https://wa.me/${dealer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(fill(t.dealerContact.whatsappText, { name: dealer.name }))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn w-full"
            style={{ background: "#25D366", color: "#fff" }}
          >
            <Message size={16} /> {t.dealerContact.whatsapp}
          </a>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-solid btn-sm"><Calendar size={14} /> {t.dealerContact.bookVisit}</button>
          <button onClick={share} className="btn btn-solid btn-sm">
            <Share size={14} /> {copied ? t.dealerContact.copied : t.dealerContact.share}
          </button>
        </div>
      </div>
    </section>
  );
}
