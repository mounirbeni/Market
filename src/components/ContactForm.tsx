"use client";

import { useState } from "react";
import { useDict } from "@/lib/i18n/client";
import { BadgeCheck, Info, Message, Phone, Users } from "./icons";

export function ContactForm() {
  const t = useDict();
  const f = t.contactForm;
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState(f.topics[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topic,
          name: data.get("name"),
          contact: data.get("contact"),
          message: data.get("message"),
        }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? f.genericError);
      form.reset();
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : f.genericError);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-center p-12 text-center">
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: "var(--good-soft)", color: "var(--good)" }}
        >
          <BadgeCheck size={28} />
        </span>
        <h2 className="mt-5 text-lg font-bold">{f.sentTitle}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {f.sentText}
        </p>
        <button onClick={() => setSent(false)} className="btn btn-ghost btn-sm mt-6">{f.anotherMessage}</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="card space-y-4 p-6"
    >
      <div>
        <span className="label"><Message size={13} /> {f.subjectLabel}</span>
        <div className="flex flex-wrap gap-1.5">
          {f.topics.map((tp) => {
            const on = topic === tp;
            return (
              <button
                key={tp}
                type="button"
                onClick={() => setTopic(tp)}
                aria-pressed={on}
                className="chip transition"
                style={{
                  borderColor: on ? "var(--brand)" : "var(--line)",
                  background: on ? "var(--brand-soft)" : "var(--surface-1)",
                  color: on ? "var(--brand)" : "var(--text-muted)",
                }}
              >
                {tp}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ct-name"><Users size={13} /> {f.nameLabel}</label>
          <input id="ct-name" name="name" className="field" required placeholder={f.namePlaceholder} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="ct-phone"><Phone size={13} /> {f.phoneLabel}</label>
          <input id="ct-phone" name="contact" className="field" required placeholder={f.phonePlaceholder} dir="ltr" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ct-msg"><Message size={13} /> {f.messageLabel}</label>
        <textarea id="ct-msg" name="message" className="field min-h-32" required minLength={10} placeholder={f.messagePlaceholder} />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        <Message size={16} /> {busy ? f.sending : f.send}
      </button>

      {error && (
        <p className="text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>
      )}

      <p
        className="flex gap-2 rounded-lg p-3 text-[10.5px] leading-relaxed"
        style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
      >
        <Info size={13} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
        {f.note}
      </p>
    </form>
  );
}
