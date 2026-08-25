"use client";

import { useState } from "react";
import { BadgeCheck, Info, Message, Phone, Users } from "./icons";

const TOPICS = ["سؤال عام", "مشكل فإعلان", "التبليغ عن نصب", "شراكة أو معرض", "اقتراح تحسين"];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);

  if (sent) {
    return (
      <div className="card flex flex-col items-center p-12 text-center">
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: "var(--good-soft)", color: "var(--good)" }}
        >
          <BadgeCheck size={28} />
        </span>
        <h2 className="mt-5 text-lg font-bold">توصلنا برسالتك</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          غادي نجاوبوك فأقرب وقت. (هادي نسخة تجريبية — الرسالة ماتصيفطاتش فعلاً.)
        </p>
        <button onClick={() => setSent(false)} className="btn btn-ghost btn-sm mt-6">رسالة أخرى</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSent(true); }}
      className="card space-y-4 p-6"
    >
      <div>
        <span className="label"><Message size={13} /> موضوع الرسالة</span>
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((t) => {
            const on = topic === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                aria-pressed={on}
                className="chip transition"
                style={{
                  borderColor: on ? "var(--brand)" : "var(--line)",
                  background: on ? "var(--brand-soft)" : "var(--surface-1)",
                  color: on ? "var(--brand)" : "var(--text-muted)",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ct-name"><Users size={13} /> الاسم</label>
          <input id="ct-name" className="field" required placeholder="اسمك الكامل" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="ct-phone"><Phone size={13} /> الهاتف أو البريد</label>
          <input id="ct-phone" className="field" required placeholder="06… أو name@mail.com" dir="ltr" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ct-msg"><Message size={13} /> الرسالة</label>
        <textarea id="ct-msg" className="field min-h-32" required placeholder="اشرح لينا بالتفصيل…" />
      </div>

      <button type="submit" className="btn btn-primary w-full"><Message size={16} /> صيفط الرسالة</button>

      <p
        className="flex gap-2 rounded-lg p-3 text-[10.5px] leading-relaxed"
        style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
      >
        <Info size={13} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
        منصة تجريبية: النموذج ماكيصيفطش رسائل حقيقية.
      </p>
    </form>
  );
}
