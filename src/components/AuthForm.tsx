"use client";

import { Link } from "@/components/Link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/store/session";
import { useDict } from "@/lib/i18n/client";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Info, Mail, ShieldCheck } from "@/components/icons";

/* ============================================================
   الدخول بالإيميل + رمز التحقق

   الرمز كيتولّد فالخادم وكيتخزن hash ديالو فقط. فالتطوير كيتعرض
   فالواجهة؛ فالإنتاج مع مزوّد إيميل مضبوط ماكيرجعش للمتصفح.
   ============================================================ */

/** خطأ من الخادم — الرمز `code` كيتترجم فالواجهة، النص الأصلي كنستعملوه غير كـfallback */
class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function post<T>(url: string, data: unknown, genericError: string): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  const j = await r.json();
  if (!j.ok) throw new ApiError(j.error ?? genericError, j.code);
  return j.data as T;
}

export function AuthForm({ mode = "login" }: { mode?: "login" | "register" }) {
  const t = useDict();
  /** لو الخطأ عندو رمز معروف، كنترجموه؛ وإلا كنبقاو على النص الأصلي (احتياط) */
  const errText = (e: unknown) => {
    const code = e instanceof ApiError ? e.code : undefined;
    const known = code ? t.auth.errors[code as keyof typeof t.auth.errors] : undefined;
    return known ?? (e as Error).message;
  };
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();

  /** وجهة ما بعد الدخول — داخلية فقط، ماكنقبلوش روابط خارجية */
  const next = (() => {
    const raw = params.get("next") ?? "";
    return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
  })();

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const d = await post<{ email: string; devCode?: string }>("/api/auth/request-otp", { email }, t.auth.genericError);
      setDevCode(d.devCode ?? null);
      setStep("code");
    } catch (e) {
      setErr(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await post("/api/auth/verify-otp", { email, code, name }, t.auth.genericError);
      await refresh();
      router.push(next);
      router.refresh();
    } catch (e) {
      setErr(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mx-auto max-w-md p-7">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl"
        style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
        <ShieldCheck size={22} />
      </span>
      <h1 className="h-page mt-5 text-center text-2xl">
        {mode === "register" ? t.auth.heading.register : t.auth.heading.login}
      </h1>
      <p className="mt-2 text-center text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {step === "email"
          ? t.auth.leadEmail
          : <>{t.auth.leadCodeA} <bdi dir="ltr" className="font-bold">{email}</bdi></>}
      </p>

      {step === "email" ? (
        <form onSubmit={requestCode} className="mt-6 space-y-3">
          {mode === "register" && (
            <div>
              <label className="label" htmlFor="af-name">{t.auth.nameLabel}</label>
              <input id="af-name" value={name} onChange={(e) => setName(e.target.value)}
                className="field mt-1.5 w-full" placeholder={t.auth.namePlaceholder} maxLength={60} />
            </div>
          )}
          <div>
            <label className="label" htmlFor="af-email">{t.auth.emailLabel}</label>
            <input id="af-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="field mt-1.5 w-full" dir="ltr" style={{ textAlign: "left" }}
              placeholder="nom@example.com" inputMode="email" autoComplete="email"
              spellCheck={false} required />
          </div>
          {err && (
            <p className="flex items-center gap-2 text-[12px]" style={{ color: "var(--bad)" }}>
              <AlertTriangle size={13} /> {err}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-50">
            {busy ? t.auth.sending : <>{t.auth.sendCode} <ArrowLeft size={15} className="dir-flip" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-3">
          {devCode && (
            <p className="flex items-start gap-2 rounded-xl p-3 text-[11.5px] leading-relaxed"
              style={{ background: "var(--warn-soft)", color: "var(--text-muted)" }}>
              <Info size={14} className="mt-px shrink-0" style={{ color: "var(--warn)" }} />
              <span>
                {t.auth.devModeNote}{" "}
                <b className="num tracking-widest" style={{ color: "var(--text)" }}>{devCode}</b>.
                {t.auth.devModeNoteEnd}
              </span>
            </p>
          )}
          <div>
            <label className="label" htmlFor="af-code">{t.auth.codeLabel}</label>
            <input id="af-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="field num mt-1.5 w-full text-center text-xl tracking-[0.5em]" dir="ltr"
              placeholder="······" inputMode="numeric" autoComplete="one-time-code" required />
          </div>
          {err && (
            <p className="flex items-center gap-2 text-[12px]" style={{ color: "var(--bad)" }}>
              <AlertTriangle size={13} /> {err}
            </p>
          )}
          <button type="submit" disabled={busy || code.length !== 6}
            className="btn btn-primary w-full disabled:opacity-50">
            {busy ? t.auth.verifying : <><Check size={16} /> {t.auth.login}</>}
          </button>
          <button type="button" onClick={() => { setStep("email"); setCode(""); setErr(""); }}
            className="btn btn-ghost btn-sm w-full">
            <ArrowRight size={14} className="dir-flip" /> {t.auth.changeEmail}
          </button>
        </form>
      )}

      <p className="mt-6 border-t pt-4 text-center text-[12px]" style={{ borderColor: "var(--line-soft)", color: "var(--text-muted)" }}>
        {mode === "register" ? (
          <>{t.auth.hasAccount} <Link href="/login" className="font-bold" style={{ color: "var(--brand)" }}>{t.auth.login}</Link></>
        ) : (
          <>{t.auth.noAccount} <Link href="/register" className="font-bold" style={{ color: "var(--brand)" }}>{t.auth.registerCta}</Link></>
        )}
      </p>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
        <Mail size={11} /> {t.auth.privacyNote}
      </p>
    </div>
  );
}
