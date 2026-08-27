"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { BadgeCheck, Check, MapPin, Users } from "@/components/icons";

interface Dealer {
  slug: string;
  name: string;
  tagline: string | null;
  about: string | null;
  address: string | null;
  hours: string | null;
  city: string;
  brands: string[];
  verified: boolean;
}

const EMPTY = {
  name: "", tagline: "", about: "", address: "",
  hours: "الإثنين ـ السبت · 9:00 — 19:00", city: "casablanca", brands: "",
};

/* ============================================================
   ملف المعرض

   قبل، صفحة /dealers كانت كتقرا لائحة مرفقة مع الموقع. دابا
   كتقرا من قاعدة البيانات — وهاد الفورمير هو الطريق الوحيد باش
   يدخل شي معرض. بلاه القسم كيبقى خاوي للأبد.
   ============================================================ */
export function DealerProfileForm() {
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/dealer")
      .then((r) => r.json())
      .then((j) => {
        const d: Dealer | null = j?.ok ? j.data.dealer : null;
        if (d) {
          setDealer(d);
          setForm({
            name: d.name,
            tagline: d.tagline ?? "",
            about: d.about ?? "",
            address: d.address ?? "",
            hours: d.hours ?? "",
            city: d.city,
            brands: (d.brands ?? []).join("، "),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (patch: Partial<typeof EMPTY>) => {
    setForm((p) => ({ ...p, ...patch }));
    setSaved(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/me/dealer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: dealer?.slug ?? "",
          brands: form.brands.split(/[،,]/).map((b) => b.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? "ماقدرناش نسجّلو.");
      setDealer((d) => ({
        slug: json.data.slug,
        name: form.name,
        tagline: form.tagline,
        about: form.about,
        address: form.address,
        hours: form.hours,
        city: form.city,
        brands: form.brands.split(/[،,]/).map((b) => b.trim()).filter(Boolean),
        verified: d?.verified ?? false,
      }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ماقدرناش نسجّلو.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="card p-8 text-center text-sm">…</div>;

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
        >
          <Users size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold">
            {dealer ? "ملف المعرض ديالك" : "صاوب ملف معرض"}
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            الحساب ديالك غادي يولّي «بائع محترف»، والمخزون كامل غادي يبان
            فصفحة وحدة مع العنوان وساعات العمل.
          </p>
        </div>
      </div>

      {dealer && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-lg p-3 text-[11.5px]"
          style={{ background: "var(--surface-3)" }}
        >
          <Link href={`/dealer/${dealer.slug}`} className="font-bold" style={{ color: "var(--brand)" }}>
            /dealer/{dealer.slug}
          </Link>
          {dealer.verified ? (
            <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
              <BadgeCheck size={11} /> موثّق
            </span>
          ) : (
            <span style={{ color: "var(--text-dim)" }}>
              · التوثيق كيتحط بعد التأكد من السجل التجاري
            </span>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="d-name">اسم المعرض</label>
          <input
            id="d-name" className="field" required maxLength={80}
            value={form.name} onChange={(e) => set({ name: e.target.value })}
            placeholder="أوطو ..."
          />
        </div>
        <div>
          <label className="label" htmlFor="d-city"><MapPin size={13} /> المدينة</label>
          <select
            id="d-city" className="field"
            value={form.city} onChange={(e) => set({ city: e.target.value })}
          >
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.ar}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="d-tagline">جملة تعريفية</label>
        <input
          id="d-tagline" className="field" maxLength={120}
          value={form.tagline} onChange={(e) => set({ tagline: e.target.value })}
          placeholder="بيع وشراء وتبادل السيارات المستعملة"
        />
      </div>

      <div>
        <label className="label" htmlFor="d-about">تعريف بالمعرض</label>
        <textarea
          id="d-about" className="field min-h-28" maxLength={2000}
          value={form.about} onChange={(e) => set({ about: e.target.value })}
          placeholder="شحال هادي وأنت خدّام، شنو كتبيع، واش كتوفّر ضمان…"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="d-address">العنوان</label>
          <input
            id="d-address" className="field" maxLength={160}
            value={form.address} onChange={(e) => set({ address: e.target.value })}
            placeholder="زنقة …، المدينة"
          />
        </div>
        <div>
          <label className="label" htmlFor="d-hours">ساعات العمل</label>
          <input
            id="d-hours" className="field" maxLength={80}
            value={form.hours} onChange={(e) => set({ hours: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="d-brands">الماركات اللي كتبيع</label>
        <input
          id="d-brands" className="field" dir="ltr"
          value={form.brands} onChange={(e) => set({ brands: e.target.value })}
          placeholder="Dacia، Renault، Peugeot"
        />
        <p className="mt-1 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
          فرّقهم بفاصلة
        </p>
      </div>

      {error && <p className="text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {saved ? <><Check size={16} /> تسجّل</> : busy ? "كنسجّلو…" : dealer ? "حيّن الملف" : "صاوب الملف"}
      </button>
    </form>
  );
}
