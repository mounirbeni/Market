"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/app";
import {
  BadgeCheck, Car, Info, Lock2, Message, Phone, ShieldCheck, Users, Wallet,
} from "./icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { signIn } = useApp();
  const router = useRouter();
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");

  const isRegister = mode === "register";
  const validPhone = /^0[67]\d{8}$/.test(phone.replace(/\s/g, ""));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step === "form") {
      setStep("otp");
      return;
    }
    signIn({ name: name.trim() || "مستعمل طريق", role, phone });
    router.push("/dashboard");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
      {/* الجانب التعريفي */}
      <div className="order-2 lg:order-1">
        <span className="eyebrow"><ShieldCheck size={13} /> حساب واحد لكل شي</span>
        <h1 className="h-page mt-4">
          {isRegister ? "أنشئ حسابك فطريق" : "مرحباً بك من جديد"}
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {isRegister
            ? "حساب مجاني كيخليك تنشر إعلاناتك، تحفظ المركبات اللي عجباتك، وتوصلك تنبيهات ملي ينقص الثمن."
            : "دخل لحسابك باش توصل لإعلاناتك، رسائلك، ومفضلتك."}
        </p>

        <ul className="mt-8 space-y-4">
          {[
            { Icon: Car, t: "إعلانات بلا حدود", d: "انشر سياراتك ودراجاتك مجاناً" },
            { Icon: Wallet, t: "تنبيهات انخفاض الثمن", d: "كنعلمو ملي ينقص ثمن مركبة محفوظة" },
            { Icon: Message, t: "مراسلة داخل المنصة", d: "تواصل مع المشترين بلا ما تعطي رقمك" },
            { Icon: BadgeCheck, t: "توثيق الهوية", d: "الحسابات الموثقة كتاخد نقطة ثقة أعلى" },
          ].map((f) => (
            <li key={f.t} className="flex gap-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
              >
                <f.Icon size={18} />
              </span>
              <div>
                <div className="text-[13px] font-bold">{f.t}</div>
                <div className="text-[11.5px]" style={{ color: "var(--text-muted)" }}>{f.d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* النموذج */}
      <div className="card-raised order-1 p-6 lg:order-2">
        {step === "form" ? (
          <form onSubmit={submit} className="space-y-4">
            <h2 className="text-lg font-bold">{isRegister ? "إنشاء حساب" : "تسجيل الدخول"}</h2>

            {isRegister && (
              <>
                <div>
                  <span className="label"><Users size={13} /> شنو بغيتي دير؟</span>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ["buyer", "نشري مركبة", Car],
                      ["seller", "نبيع مركبة", Wallet],
                    ] as const).map(([r, label, Icon]) => {
                      const on = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          aria-pressed={on}
                          className="flex flex-col items-center gap-1.5 rounded-xl border py-3.5 text-[12px] font-bold transition"
                          style={{
                            borderColor: on ? "var(--brand)" : "var(--line)",
                            background: on ? "var(--brand-soft)" : "var(--surface-1)",
                            color: on ? "var(--brand)" : "var(--text-muted)",
                          }}
                        >
                          <Icon size={20} /> {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="au-name"><Users size={13} /> الاسم الكامل</label>
                  <input
                    id="au-name"
                    className="field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً: منير بنعلي"
                    autoComplete="name"
                  />
                </div>
              </>
            )}

            <div>
              <label className="label" htmlFor="au-phone"><Phone size={13} /> رقم الهاتف</label>
              <input
                id="au-phone"
                className="field num"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                autoComplete="tel"
                dir="ltr"
              />
              {phone && !validPhone && (
                <p className="mt-1.5 text-[11px]" style={{ color: "var(--bad)" }}>
                  الرقم خاصو يبدا بـ06 ولا 07 ويكون فيه 10 أرقام
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={!validPhone}>
              <Lock2 size={16} /> {isRegister ? "أرسل رمز التأكيد" : "دخول برمز SMS"}
            </button>

            <div className="rule-diamond text-[10px]">ولا</div>

            <div className="grid gap-2">
              {["متابعة بحساب Google", "متابعة بحساب Apple"].map((l) => (
                <button key={l} type="button" className="btn btn-solid w-full text-[12.5px]">{l}</button>
              ))}
            </div>

            <p className="text-center text-[11px]" style={{ color: "var(--text-dim)" }}>
              {isRegister ? (
                <>عندك حساب؟ <Link href="/login" className="font-bold" style={{ color: "var(--brand)" }}>دخل من هنا</Link></>
              ) : (
                <>ماعندكش حساب؟ <Link href="/register" className="font-bold" style={{ color: "var(--brand)" }}>أنشئ واحد</Link></>
              )}
            </p>
          </form>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h2 className="text-lg font-bold">تأكيد الرقم</h2>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              صيفطنا رمزاً من <span className="num">4</span> أرقام للرقم{" "}
              <b className="num" dir="ltr">{phone}</b>
            </p>
            <div>
              <label className="label" htmlFor="au-otp"><Lock2 size={13} /> رمز التأكيد</label>
              <input
                id="au-otp"
                className="field num text-center text-2xl tracking-[0.5em]"
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                dir="ltr"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">تأكيد ودخول</button>
            <button type="button" onClick={() => setStep("form")} className="btn btn-ghost btn-sm w-full">
              بدّل الرقم
            </button>
          </form>
        )}

        <p
          className="mt-5 flex gap-2 rounded-lg p-3 text-[10.5px] leading-relaxed"
          style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
        >
          <Info size={13} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
          هادي منصة تجريبية: الحساب كيتسجّل فمتصفحك فقط وماكيتصيفطش لأي خادم. أي رمز غادي يمشي.
        </p>
      </div>
    </div>
  );
}
