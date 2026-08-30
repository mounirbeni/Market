"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/components/Link";
import { useApp } from "@/store/app";
import { useSession } from "@/store/session";
import { useDict } from "@/lib/i18n/client";
import { AccountBasicsForm } from "./AccountBasicsForm";
import {
  BadgeCheck, Bell, IdCard, Info, ShieldCheck, Sparkle, Users,
} from "@/components/icons";

interface VerifState {
  verified: boolean;
  request: { kind: string; status: string; note: string | null; created_at: string } | null;
}

export function DashboardSettings() {
  const t = useDict();
  const s = t.settingsPage;
  const { unit, setUnit, theme, toggleTheme } = useApp();
  const { user, signOut } = useSession();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <Users size={16} style={{ color: "var(--brand)" }} /> {s.accountInfoTitle}
        </h2>
        <Link
          href="/dashboard/trust"
          className="mt-2 flex items-center gap-1.5 text-[11px] font-bold transition hover:gap-2.5"
          style={{ color: "var(--brand)" }}
        >
          <Sparkle size={12} /> {s.seeTrustCenter}
        </Link>
        <div className="mt-4">
          <AccountBasicsForm />
        </div>
      </div>

      <VerificationCard verified={Boolean(user?.id_verified)} pro={user?.type === "professionnel"} />

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <Bell size={16} style={{ color: "var(--brand)" }} /> {s.displayTitle}
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <span className="label">{s.priceUnit}</span>
            <div className="flex gap-1.5">
              {(["dh", "million"] as const).map((u) => (
                <button
                  key={u} type="button" onClick={() => setUnit(u)}
                  className="chip transition"
                  style={{
                    borderColor: unit === u ? "var(--brand)" : "var(--line)",
                    background: unit === u ? "var(--brand-soft)" : "var(--surface-1)",
                    color: unit === u ? "var(--brand)" : "var(--text-muted)",
                  }}
                >
                  {u === "dh" ? s.dh : s.million}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">{s.theme}</span>
            <button type="button" onClick={toggleTheme} className="btn btn-solid btn-sm">
              {theme === "dark" ? s.light : s.dark}
            </button>
          </div>
          <p
            className="flex gap-2 rounded-lg p-3 text-[10.5px] leading-relaxed"
            style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
          >
            <Info size={13} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
            {s.localOnly}
          </p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <ShieldCheck size={16} style={{ color: "var(--brand)" }} /> {s.accountTitle}
        </h2>
        <button onClick={signOut} className="btn btn-solid btn-sm mt-4">{s.signOut}</button>
      </section>
    </div>
  );
}

/* ============================================================
   توثيق الهوية

   قبل كانت لائحة ثابتة كتقول «موثّق» بلا ما يوقع والو. دابا:
   كترفع البطاقة، والمشرف كيشوفها وكيقرّر.
   ============================================================ */
function VerificationCard({ verified, pro }: { verified: boolean; pro: boolean }) {
  const t = useDict();
  const s = t.settingsPage;
  const [state, setState] = useState<VerifState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const front = useRef<HTMLInputElement>(null);
  const back = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/me/verification")
      .then((r) => r.json())
      .then((j) => j?.ok && setState(j.data))
      .catch(() => {});
  }, []);

  /** كنرفعو الوثيقة لمسار خاص — ماكتّقدّمش من مسار الصور العام */
  async function upload(file: File): Promise<string> {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "content-type": file.type || "image/jpeg",
        "x-filename": "doc.jpg",
        "x-purpose": "doc",
      },
      body: file,
    });
    const json = await res.json();
    if (!json?.ok) throw new Error(json?.error ?? s.docUploadError);
    return json.data.pathname as string;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const f = front.current?.files?.[0];
    if (!f) return;
    setError(null);
    setBusy(true);
    try {
      const doc = await upload(f);
      const b = back.current?.files?.[0];
      const backPath = b ? await upload(b) : undefined;

      const res = await fetch("/api/me/verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: pro ? "registre" : "cin", doc, back: backPath }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? s.requestError);
      setState({ verified: false, request: { kind: "cin", status: "pending", note: null, created_at: new Date().toISOString() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : s.genericError);
    } finally {
      setBusy(false);
    }
  }

  const status = state?.request?.status;
  const done = verified || state?.verified;

  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 text-[14px] font-bold">
        <IdCard size={16} style={{ color: "var(--brand)" }} /> {s.idVerificationTitle}
      </h2>

      {done ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg p-3 text-[12.5px]"
          style={{ background: "var(--good-soft)", color: "var(--good)" }}>
          <BadgeCheck size={16} /> {s.idVerifiedText}
        </p>
      ) : status === "pending" ? (
        <p className="mt-4 rounded-lg p-3 text-[12.5px] leading-relaxed"
          style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}>
          {s.pendingText}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <ul
            className="space-y-1 rounded-lg p-3 text-[11.5px] leading-relaxed"
            style={{ background: "var(--brand-soft)", color: "var(--text-muted)" }}
          >
            <li>· {s.optionalNote}</li>
            <li>· {s.benefitNote}</li>
          </ul>
          {status === "rejected" && (
            <p className="rounded-lg p-3 text-[12px] leading-relaxed"
              style={{ background: "var(--bad-soft, var(--surface-3))", color: "var(--bad)" }}>
              {s.rejectedPrefix}
              {state?.request?.note ? ` ${s.rejectedReason} ${state.request.note}` : ""} {s.canRetry}
            </p>
          )}
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {s.uploadInstructionA} {pro ? s.registreCommerce : s.cinCard} {s.uploadInstructionB}
          </p>
          <div>
            <label className="label" htmlFor="v-front">
              {pro ? s.registreCommerce : s.frontLabel}
            </label>
            <input id="v-front" ref={front} type="file" accept="image/*" required className="field" />
          </div>
          {!pro && (
            <div>
              <label className="label" htmlFor="v-back">{s.backLabel}</label>
              <input id="v-back" ref={back} type="file" accept="image/*" className="field" />
            </div>
          )}
          {error && <p className="text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}
          <button className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? s.uploading : s.submitForReview}
          </button>
        </form>
      )}
    </section>
  );
}
