"use client";

import { useRef, useState } from "react";
import { useSession } from "@/store/session";
import { useDict, useLocale } from "@/lib/i18n/client";
import { citiesIn, DEFAULT_SELLER_NAME } from "@/lib/i18n/labels";
import {
  Award, BadgeCheck, Camera, Check, MapPin, Phone, Users,
} from "@/components/icons";

/* ============================================================
   معلومات الحساب الأساسية — الاسم، الهاتف، المدينة، نوع الحساب،
   الصورة. مشتركة بين صفحة الإعدادات (تعديل حر فأي وقت) وصفحة
   استكمال الملف الشخصي الإلزامية — بلا ما نكرّرو نفس الفورم
   فبلاصتين.
   ============================================================ */

const TYPES_META = [
  { value: "particulier", Icon: Users },
  { value: "professionnel", Icon: BadgeCheck },
  { value: "professionnel-dealer", Icon: Award },
] as const;

export function AccountBasicsForm({
  ctaLabel,
  onSaved,
}: {
  ctaLabel?: string;
  onSaved?: (info: { wantsDealer: boolean }) => void;
}) {
  const t = useDict();
  const locale = useLocale();
  const a = t.accountForm;
  const TYPES = TYPES_META.map((m) => ({ ...m, label: a.types[m.value] }));
  const { user, refresh } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name === DEFAULT_SELLER_NAME ? "" : (user?.name ?? ""),
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    /* «شركة أو معرض» فالواجهة كتخزن professionnel + كتوجّه المستخدم
       يكمّل صفحة المعرض من بعد — النوع فقاعدة البيانات عندو قيمتين
       غير (particulier/professionnel)، بحال ما كان قبل. */
    type: (user?.type ?? "particulier") as "particulier" | "professionnel",
    wantsDealer: false,
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setSaved(false);
  };

  async function uploadAvatar(file: File) {
    setAvatarBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "content-type": file.type || "image/jpeg",
          "x-filename": "avatar.jpg",
          "x-purpose": "avatar",
        },
        body: file,
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? a.avatarUploadError);
      setAvatarUrl(json.data.url as string);
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : a.avatarUploadError);
    } finally {
      setAvatarBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name, phone: form.phone, city: form.city,
          type: form.type, avatarUrl,
        }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? a.genericError);
      await refresh();
      setSaved(true);
      onSaved?.({ wantsDealer: form.wantsDealer });
    } catch (err) {
      setError(err instanceof Error ? err.message : a.genericError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={avatarBusy}
          className="group relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2"
          style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}
          aria-label={a.avatarAlt}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-extrabold" style={{ color: "var(--text-dim)" }}>
              {(form.name || user?.name || (locale === "fr" ? "?" : "؟")).trim().slice(0, 1)}
            </span>
          )}
          <span
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
            style={{ background: "rgba(10,30,61,0.55)" }}
          >
            <Camera size={18} style={{ color: "#fff" }} />
          </span>
        </button>
        <div className="min-w-0">
          <p className="text-[12.5px] font-bold">{a.avatarTitle}</p>
          <p className="mt-0.5 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
            {avatarBusy ? a.avatarUploading : a.avatarHint}
          </p>
          <input
            ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadAvatar(f); }}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ab-name"><Users size={13} /> {a.nameLabel}</label>
        <input
          id="ab-name" className="field" required maxLength={80}
          value={form.name} onChange={(e) => set({ name: e.target.value })}
        />
      </div>

      <div>
        <label className="label" htmlFor="ab-phone"><Phone size={13} /> {a.phoneLabel}</label>
        <input
          id="ab-phone" className="field num" dir="ltr" inputMode="tel" required
          placeholder="0612345678"
          value={form.phone} onChange={(e) => set({ phone: e.target.value })}
        />
        <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {a.phoneHint}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="ab-city"><MapPin size={13} /> {a.cityLabel}</label>
        <select
          id="ab-city" className="field" required value={form.city}
          onChange={(e) => set({ city: e.target.value })}
        >
          <option value="" disabled>{a.cityPlaceholder}</option>
          {citiesIn(locale).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <span className="label">{a.accountTypeLabel}</span>
        <div className="grid grid-cols-3 gap-1.5">
          {TYPES.map((tp) => {
            const on = tp.value === "professionnel-dealer"
              ? form.type === "professionnel" && form.wantsDealer
              : tp.value === form.type && !form.wantsDealer;
            return (
              <button
                key={tp.value}
                type="button"
                onClick={() => set({
                  type: tp.value === "particulier" ? "particulier" : "professionnel",
                  wantsDealer: tp.value === "professionnel-dealer",
                })}
                aria-pressed={on}
                className="flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[11px] font-bold transition"
                style={{
                  borderColor: on ? "var(--brand)" : "var(--line)",
                  background: on ? "var(--brand-soft)" : "var(--surface-1)",
                  color: on ? "var(--brand)" : "var(--text-muted)",
                }}
              >
                <tp.Icon size={18} />
                {tp.label}
              </button>
            );
          })}
        </div>
        {form.wantsDealer && (
          <p className="mt-2 text-[10.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            {a.dealerHint}
          </p>
        )}
      </div>

      {error && <p className="text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      <button className="btn btn-primary btn-sm" disabled={busy}>
        {saved ? <><Check size={14} /> {a.saved}</> : busy ? "…" : (ctaLabel ?? a.defaultCta)}
      </button>
    </form>
  );
}
