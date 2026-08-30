"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Message } from "@/components/icons";
import { useDict, useHref } from "@/lib/i18n/client";

/**
 * «راسل البائع» — كيفتح محادثة حقيقية على الإعلان.
 * إلا ماكانش المستخدم داخل، كيوجّهو للدخول ومن بعد كيرجع لهنا.
 */
export function ContactSellerButton({
  listingRef,
  className = "btn btn-solid btn-sm",
  label,
}: { listingRef: string; className?: string; label?: string }) {
  const t = useDict();
  const href = useHref();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function open() {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listing: listingRef }),
      });
      const j = await r.json();
      if (r.status === 401) {
        router.push(href(`/login?next=${encodeURIComponent(`/messages?listing=${listingRef}`)}`));
        return;
      }
      if (!j.ok) throw new Error(j.error);
      router.push(href("/messages"));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={open} disabled={busy} className={`${className} disabled:opacity-50`}>
        <Message size={14} /> {busy ? t.contact.opening : label ?? t.contact.label}
      </button>
      {err && (
        <p className="col-span-2 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--bad)" }}>
          <AlertTriangle size={12} /> {err}
        </p>
      )}
    </>
  );
}
