"use client";

import { useEffect, useState } from "react";
import { Link } from "@/components/Link";
import { useDict, useLocale } from "@/lib/i18n/client";
import { citiesIn } from "@/lib/i18n/labels";
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

/* ============================================================
   ملف المعرض

   قبل، صفحة /dealers كانت كتقرا لائحة مرفقة مع الموقع. دابا
   كتقرا من قاعدة البيانات — وهاد الفورمير هو الطريق الوحيد باش
   يدخل شي معرض. بلاه القسم كيبقى خاوي للأبد.
   ============================================================ */
export function DealerProfileForm() {
  const t = useDict();
  const locale = useLocale();
  const d0 = t.dealerForm;
  const separator = locale === "fr" ? ", " : "، ";
  const EMPTY = {
    name: "", tagline: "", about: "", address: "",
    hours: d0.defaultHours, city: "casablanca", brands: "",
  };
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
        const dl: Dealer | null = j?.ok ? j.data.dealer : null;
        if (dl) {
          setDealer(dl);
          setForm({
            name: dl.name,
            tagline: dl.tagline ?? "",
            about: dl.about ?? "",
            address: dl.address ?? "",
            hours: dl.hours ?? "",
            city: dl.city,
            brands: (dl.brands ?? []).join(separator),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (!json?.ok) throw new Error(json?.error ?? d0.genericError);
      setDealer((dl) => ({
        slug: json.data.slug,
        name: form.name,
        tagline: form.tagline,
        about: form.about,
        address: form.address,
        hours: form.hours,
        city: form.city,
        brands: form.brands.split(/[،,]/).map((b) => b.trim()).filter(Boolean),
        verified: dl?.verified ?? false,
      }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : d0.genericError);
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
            {dealer ? d0.editTitle : d0.createTitle}
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {d0.lead}
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
              <BadgeCheck size={11} /> {d0.verified}
            </span>
          ) : (
            <span style={{ color: "var(--text-dim)" }}>
              {d0.verifyPending}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="d-name">{d0.nameLabel}</label>
          <input
            id="d-name" className="field" required maxLength={80}
            value={form.name} onChange={(e) => set({ name: e.target.value })}
            placeholder={d0.namePlaceholder}
          />
        </div>
        <div>
          <label className="label" htmlFor="d-city"><MapPin size={13} /> {d0.cityLabel}</label>
          <select
            id="d-city" className="field"
            value={form.city} onChange={(e) => set({ city: e.target.value })}
          >
            {citiesIn(locale).map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="d-tagline">{d0.taglineLabel}</label>
        <input
          id="d-tagline" className="field" maxLength={120}
          value={form.tagline} onChange={(e) => set({ tagline: e.target.value })}
          placeholder={d0.taglinePlaceholder}
        />
      </div>

      <div>
        <label className="label" htmlFor="d-about">{d0.aboutLabel}</label>
        <textarea
          id="d-about" className="field min-h-28" maxLength={2000}
          value={form.about} onChange={(e) => set({ about: e.target.value })}
          placeholder={d0.aboutPlaceholder}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="d-address">{d0.addressLabel}</label>
          <input
            id="d-address" className="field" maxLength={160}
            value={form.address} onChange={(e) => set({ address: e.target.value })}
            placeholder={d0.addressPlaceholder}
          />
        </div>
        <div>
          <label className="label" htmlFor="d-hours">{d0.hoursLabel}</label>
          <input
            id="d-hours" className="field" maxLength={80}
            value={form.hours} onChange={(e) => set({ hours: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="d-brands">{d0.brandsLabel}</label>
        <input
          id="d-brands" className="field" dir="ltr"
          value={form.brands} onChange={(e) => set({ brands: e.target.value })}
          placeholder={d0.brandsPlaceholder}
        />
        <p className="mt-1 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
          {d0.brandsHint}
        </p>
      </div>

      {error && <p className="text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {saved ? <><Check size={16} /> {d0.saved}</> : busy ? d0.saving : dealer ? d0.update : d0.create}
      </button>
    </form>
  );
}
