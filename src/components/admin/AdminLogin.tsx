"use client";

import { useState } from "react";
import { useDict } from "@/lib/i18n/client";
import { Lock, ShieldCheck } from "@/components/icons";

/* ============================================================
   دخول الإشراف — خطوتين

   1. الإيميل + كلمة السر
   2. رمز ديال 6 أرقام كيوصل لنفس الإيميل

   حتى إلا تسرّبات كلمة السر، اللي ماعندوش الصندوق ماكيدخلش.
   ============================================================ */
export function AdminLogin() {
  const t = useDict();
  const l = t.adminLogin;
  const [step, setStep] = useState<"pw" | "code">("pw");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          step === "pw" ? { step: "pw", email, password } : { step: "code", email, code },
        ),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? l.genericError);

      if (json.data.step === "code") {
        setStep("code");
        setPassword("");
        // فالتطوير المحلي بلا مزوّد إيميل
        if (json.data.devCode) setHint(json.data.devCode);
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : l.genericError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[420px] items-center px-4">
      <form onSubmit={submit} className="card w-full space-y-4 p-7">
        <div className="text-center">
          <span
            className="mx-auto grid h-12 w-12 place-items-center rounded-2xl"
            style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
          >
            <ShieldCheck size={22} />
          </span>
          <h1 className="mt-4 text-lg font-extrabold">{l.title}</h1>
          <p className="mt-1 text-[12px]" style={{ color: "var(--text-muted)" }}>
            {step === "pw"
              ? l.leadPw
              : `${l.leadCodeA} ${email}`}
          </p>
        </div>

        {step === "pw" ? (
          <>
            <div>
              <label className="label" htmlFor="a-email">{l.emailLabel}</label>
              <input
                id="a-email" className="field" type="email" dir="ltr" required autoFocus
                autoComplete="username"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="a-pw"><Lock size={13} /> {l.passwordLabel}</label>
              <input
                id="a-pw" className="field" type="password" dir="ltr" required
                autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="label" htmlFor="a-code">{l.codeLabel}</label>
            <input
              id="a-code" className="field num text-center text-lg tracking-[0.5em]"
              inputMode="numeric" maxLength={6} required autoFocus dir="ltr"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            {hint && (
              <p className="num mt-1 text-[11px]" style={{ color: "var(--warn)" }}>
                {l.devHint} {hint}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "…" : step === "pw" ? l.continue : l.login}
        </button>

        {step === "code" && (
          <button
            type="button"
            className="btn btn-ghost btn-sm w-full"
            onClick={() => { setStep("pw"); setCode(""); setError(null); setHint(null); }}
          >
            {l.back}
          </button>
        )}
      </form>
    </div>
  );
}
