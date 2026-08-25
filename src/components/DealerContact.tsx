"use client";

import { useState } from "react";
import type { Dealer } from "@/lib/data/dealers";
import { hashCode } from "@/lib/data/seed";
import { Calendar, Message, Phone, Share } from "./icons";

function phoneFor(id: string) {
  const h = hashCode(id);
  const rest = String(h % 100000000).padStart(8, "0");
  return `05 ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6, 8)}`;
}

export function DealerContact({ dealer }: { dealer: Dealer }) {
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
      <h2 className="text-[13px] font-bold">تواصل مع المعرض</h2>
      <div className="mt-4 grid gap-2">
        <button onClick={() => setRevealed(true)} className="btn btn-primary w-full" aria-live="polite">
          <Phone size={16} />
          {revealed ? <span className="num tracking-wider">{phoneFor(dealer.id)}</span> : "أظهر رقم الهاتف"}
        </button>
        <a
          href={`https://wa.me/212600000000?text=${encodeURIComponent(`سلام، بغيت نستفسر على المركبات ديال ${dealer.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn w-full"
          style={{ background: "#25D366", color: "#fff" }}
        >
          <Message size={16} /> واتساب
        </a>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-solid btn-sm"><Calendar size={14} /> اطلب موعد</button>
          <button onClick={share} className="btn btn-solid btn-sm">
            <Share size={14} /> {copied ? "تم النسخ" : "شارك"}
          </button>
        </div>
      </div>
    </section>
  );
}
