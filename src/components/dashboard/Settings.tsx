"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/store/app";
import { useSession } from "@/store/session";
import { CITIES } from "@/lib/cities";
import {
  BadgeCheck, Bell, Check, IdCard, Info, MapPin, Phone, ShieldCheck, Users,
} from "@/components/icons";

interface VerifState {
  verified: boolean;
  request: { kind: string; status: string; note: string | null; created_at: string } | null;
}

export function DashboardSettings() {
  const { unit, setUnit, theme, toggleTheme } = useApp();
  const { user, signOut } = useSession();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "casablanca",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? "ماقدرناش نسجّلو.");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ماقدرناش نسجّلو.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={save} className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <Users size={16} style={{ color: "var(--brand)" }} /> معلومات الحساب
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="st-name"><Users size={13} /> الاسم</label>
            <input
              id="st-name" className="field" required maxLength={80}
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setSaved(false); }}
            />
          </div>
          <div>
            <label className="label" htmlFor="st-phone"><Phone size={13} /> الهاتف</label>
            <input
              id="st-phone" className="field num" dir="ltr" inputMode="tel"
              placeholder="0612345678"
              value={form.phone}
              onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setSaved(false); }}
            />
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
              هادا هو الرقم اللي غادي يبان فالإعلانات ديالك. بلاه المشتري
              ماعندو غير الدردشة.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="st-city"><MapPin size={13} /> المدينة</label>
            <select
              id="st-city" className="field" value={form.city}
              onChange={(e) => { setForm((f) => ({ ...f, city: e.target.value })); setSaved(false); }}
            >
              {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.ar}</option>)}
            </select>
          </div>
          {error && <p className="text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}
          <button className="btn btn-primary btn-sm" disabled={busy}>
            {saved ? <><Check size={14} /> تسجّل</> : busy ? "…" : "حفظ التغييرات"}
          </button>
        </div>
      </form>

      <VerificationCard verified={Boolean(user?.id_verified)} pro={user?.type === "professionnel"} />

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <Bell size={16} style={{ color: "var(--brand)" }} /> العرض
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <span className="label">وحدة الثمن</span>
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
                  {u === "dh" ? "درهم" : "مليون"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">المظهر</span>
            <button type="button" onClick={toggleTheme} className="btn btn-solid btn-sm">
              {theme === "dark" ? "فاتح" : "غامق"}
            </button>
          </div>
          <p
            className="flex gap-2 rounded-lg p-3 text-[10.5px] leading-relaxed"
            style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
          >
            <Info size={13} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
            هاد الإعدادات كتبقى فالمتصفح ديال هاد الجهاز وحدو.
          </p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <ShieldCheck size={16} style={{ color: "var(--brand)" }} /> الحساب
        </h2>
        <button onClick={signOut} className="btn btn-solid btn-sm mt-4">خروج</button>
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
    if (!json?.ok) throw new Error(json?.error ?? "ماقدرناش نرفعو الوثيقة.");
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
      if (!json?.ok) throw new Error(json?.error ?? "ماقدرناش نسجّلو الطلب.");
      setState({ verified: false, request: { kind: "cin", status: "pending", note: null, created_at: new Date().toISOString() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ماقدرناش.");
    } finally {
      setBusy(false);
    }
  }

  const status = state?.request?.status;
  const done = verified || state?.verified;

  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 text-[14px] font-bold">
        <IdCard size={16} style={{ color: "var(--brand)" }} /> توثيق الهوية
      </h2>

      {done ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg p-3 text-[12.5px]"
          style={{ background: "var(--good-soft)", color: "var(--good)" }}>
          <BadgeCheck size={16} /> هويتك موثّقة. الشارة كتبان فكل إعلاناتك.
        </p>
      ) : status === "pending" ? (
        <p className="mt-4 rounded-lg p-3 text-[12.5px] leading-relaxed"
          style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}>
          الطلب ديالك فانتظار المراجعة. غادي نجاوبوك فأقرب وقت.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          {status === "rejected" && (
            <p className="rounded-lg p-3 text-[12px] leading-relaxed"
              style={{ background: "var(--bad-soft, var(--surface-3))", color: "var(--bad)" }}>
              الطلب السابق تّرفض.
              {state?.request?.note ? ` السبب: ${state.request.note}` : ""} تقدّر تعاود.
            </p>
          )}
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            صوّر {pro ? "السجل التجاري" : "البطاقة الوطنية"} وارفعها. الوثيقة
            كيشوفها غير فريق المراجعة — عمرها ما كتبان فالموقع.
          </p>
          <div>
            <label className="label" htmlFor="v-front">
              {pro ? "السجل التجاري" : "الوجه الأمامي"}
            </label>
            <input id="v-front" ref={front} type="file" accept="image/*" required className="field" />
          </div>
          {!pro && (
            <div>
              <label className="label" htmlFor="v-back">الوجه الخلفي (اختياري)</label>
              <input id="v-back" ref={back} type="file" accept="image/*" className="field" />
            </div>
          )}
          {error && <p className="text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}
          <button className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? "كنرفعو…" : "صيفط للمراجعة"}
          </button>
        </form>
      )}
    </section>
  );
}
