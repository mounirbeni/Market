"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/store/session";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Info, Phone, ShieldCheck } from "@/components/icons";

/* ============================================================
   الدخول برقم الهاتف + رمز التحقق (OTP)

   الرمز كيتولّد فالخادم وكيتخزن hash ديالو فقط. فالتطوير كيتعرض
   فالواجهة؛ فالإنتاج مع مزوّد SMS مضبوط ماكيرجعش للمتصفح.
   ============================================================ */

async function post<T>(url: string, data: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error ?? "وقع مشكل.");
  return j.data as T;
}

export function AuthForm({ mode = "login" }: { mode?: "login" | "register" }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
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
      const d = await post<{ phone: string; devCode?: string }>("/api/auth/request-otp", { phone });
      setDevCode(d.devCode ?? null);
      setStep("code");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await post("/api/auth/verify-otp", { phone, code, name });
      await refresh();
      router.push(next);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
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
        {mode === "register" ? "إنشاء حساب" : "تسجيل الدخول"}
      </h1>
      <p className="mt-2 text-center text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {step === "phone"
          ? "برقم الهاتف فقط — بلا كلمة سر. كنصيفطو ليك رمز تحقق."
          : <>دخّل الرمز اللي وصلك على <bdi dir="ltr" className="num font-bold">{phone}</bdi></>}
      </p>

      {step === "phone" ? (
        <form onSubmit={requestCode} className="mt-6 space-y-3">
          {mode === "register" && (
            <div>
              <label className="label" htmlFor="af-name">السمية</label>
              <input id="af-name" value={name} onChange={(e) => setName(e.target.value)}
                className="field mt-1.5 w-full" placeholder="مثلاً: يوسف الإدريسي" maxLength={60} />
            </div>
          )}
          <div>
            <label className="label" htmlFor="af-phone">رقم الهاتف</label>
            <input id="af-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="field num mt-1.5 w-full" dir="ltr" style={{ textAlign: "left" }}
              placeholder="0612345678" inputMode="tel" autoComplete="tel" required />
          </div>
          {err && (
            <p className="flex items-center gap-2 text-[12px]" style={{ color: "var(--bad)" }}>
              <AlertTriangle size={13} /> {err}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-50">
            {busy ? "كنصيفطو…" : <>صيفط الرمز <ArrowLeft size={15} /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-3">
          {devCode && (
            <p className="flex items-start gap-2 rounded-xl p-3 text-[11.5px] leading-relaxed"
              style={{ background: "var(--warn-soft)", color: "var(--text-muted)" }}>
              <Info size={14} className="mt-px shrink-0" style={{ color: "var(--warn)" }} />
              <span>
                وضع التطوير — الرمز ديالك:{" "}
                <b className="num tracking-widest" style={{ color: "var(--text)" }}>{devCode}</b>.
                فالإنتاج كيوصل بـSMS.
              </span>
            </p>
          )}
          <div>
            <label className="label" htmlFor="af-code">رمز التحقق</label>
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
            {busy ? "كنتحققو…" : <><Check size={16} /> دخول</>}
          </button>
          <button type="button" onClick={() => { setStep("phone"); setCode(""); setErr(""); }}
            className="btn btn-ghost btn-sm w-full">
            <ArrowRight size={14} /> بدّل الرقم
          </button>
        </form>
      )}

      <p className="mt-6 border-t pt-4 text-center text-[12px]" style={{ borderColor: "var(--line-soft)", color: "var(--text-muted)" }}>
        {mode === "register" ? (
          <>عندك حساب؟ <Link href="/login" className="font-bold" style={{ color: "var(--brand)" }}>دخول</Link></>
        ) : (
          <>ما عندكش حساب؟ <Link href="/register" className="font-bold" style={{ color: "var(--brand)" }}>إنشاء حساب</Link></>
        )}
      </p>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
        <Phone size={11} /> رقمك ماكيتنشرش. كيبان غير ملي تختار تبيّنو.
      </p>
    </div>
  );
}
