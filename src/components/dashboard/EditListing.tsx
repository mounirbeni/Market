"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CITIES } from "@/lib/cities";
import { EQUIPMENT } from "@/lib/equipment";
import { formatNumber } from "@/lib/format";
import { vehicleHref } from "@/lib/slug";
import { useMyListings } from "@/lib/useMyListings";
import type { Condition, Fuel, Gearbox } from "@/lib/types";
import { Check, ChevronLeft, Plus } from "@/components/icons";

/* ============================================================
   تعديل إعلان

   ماكيتبدّلش: الماركة، الموديل، والسنة. هادو هوما هوية الإعلان —
   فيهم الرابط، والمشاهدات والمفضّلة والدردشات كلها مربوطة بيهم.
   اللي بغا يبيع سيارة أخرى خاصو إعلان جديد.

   الصور كتّبدّل من الإعلان راسو ماشي من هنا — الرفع والحذف
   عندهم واجهة ديالهم فنموذج البيع.
   ============================================================ */

interface Form {
  version: string;
  km: number;
  price: number;
  owners: number;
  fuel: Fuel;
  gearbox: Gearbox;
  city: string;
  color: string;
  condition: Condition;
  description: string;
  equipment: string[];
  negotiable: boolean;
  exchangeAccepted: boolean;
  papersOk: boolean;
  vinChecked: boolean;
  technicalControlValid: boolean;
  serviceBook: boolean;
  inspected: boolean;
}

const CONDITION_AR: Record<Condition, string> = {
  excellent: "ممتازة",
  "tres-bon": "جيدة جداً",
  bon: "جيدة",
  moyen: "متوسطة",
};

export function EditListing({ listingRef }: { listingRef: string }) {
  const router = useRouter();
  const { items, loading } = useMyListings();
  const v = items.find((x) => x.id === listingRef);

  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* كنعمّرو الفورم غير ملي يوصل الإعلان — ماشي فكل رندر */
  useEffect(() => {
    if (!v || form) return;
    setForm({
      version: v.version,
      km: v.km,
      price: v.price,
      owners: v.owners,
      fuel: v.fuel,
      gearbox: v.gearbox,
      city: v.city,
      color: v.color,
      condition: v.condition,
      description: v.description,
      equipment: v.equipment ?? [],
      negotiable: v.negotiable,
      exchangeAccepted: v.exchangeAccepted,
      papersOk: v.papersOk,
      vinChecked: v.vinChecked,
      technicalControlValid: new Date(v.technicalControl).getTime() > Date.now(),
      serviceBook: v.serviceBook,
      inspected: v.inspected,
    });
  }, [v, form]);

  const set = (patch: Partial<Form>) => {
    setForm((f) => (f ? { ...f, ...patch } : f));
    setSaved(false);
  };

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/me/listings/${listingRef}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          edit: {
            ...form,
            /* الخادم كيعاود يحسب هادو، ولكن كيسناهم فالجسم */
            body: v?.body,
            fiscalPower: v?.fiscalPower,
            consumption: v?.consumption,
            displacement: v?.displacement,
            doors: v?.doors,
          },
        }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? "ماقدرناش نسجّلو.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ماقدرناش نسجّلو.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>كنقلبو…</p>;
  }

  if (!v || !form) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          هاد الإعلان ماكاينش، ولا ماشي ديالك.
        </p>
        <Link href="/dashboard/listings" className="btn btn-solid btn-sm mt-4">رجع لإعلاناتي</Link>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold">{v.make} {v.model} <span className="num">{v.year}</span></p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
            المرجع <span className="num">{v.id}</span> · الماركة والموديل والسنة ماكيتبدّلوش
          </p>
        </div>
        <Link href={vehicleHref(v)} className="btn btn-ghost btn-sm">
          شوف الإعلان <ChevronLeft size={14} />
        </Link>
      </div>

      {/* ---------- الثمن والكيلومتراج ---------- */}
      <section className="card space-y-3 p-5">
        <h2 className="text-[14px] font-bold">الثمن والاستعمال</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ed-price">الثمن (د.م)</label>
            <input
              id="ed-price" className="field num" dir="ltr" inputMode="numeric" required
              value={form.price}
              onChange={(e) => set({ price: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            />
            <p className="mt-1 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
              إلا هبّطتي الثمن، اللي كيراقبو الإعلان كيوصلهم تنبيه.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="ed-km">الكيلومتراج</label>
            <input
              id="ed-km" className="field num" dir="ltr" inputMode="numeric"
              value={form.km}
              onChange={(e) => set({ km: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            />
            <p className="num mt-1 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
              {formatNumber(form.km)} كم
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {([["negotiable", "الثمن قابل للتفاوض"], ["exchangeAccepted", "كنقبل التبادل"]] as const).map(
            ([key, label]) => (
              <button
                key={key} type="button" onClick={() => set({ [key]: !form[key] } as Partial<Form>)}
                aria-pressed={form[key]} className="chip transition"
                style={{
                  background: form[key] ? "var(--brand)" : "var(--surface-3)",
                  color: form[key] ? "var(--brand-ink)" : "var(--text-muted)",
                  borderColor: "transparent",
                }}
              >
                {form[key] ? <Check size={11} /> : <Plus size={11} />}{label}
              </button>
            ),
          )}
        </div>
      </section>

      {/* ---------- المركبة ---------- */}
      <section className="card space-y-3 p-5">
        <h2 className="text-[14px] font-bold">تفاصيل المركبة</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ed-version">الفئة</label>
            <input
              id="ed-version" className="field" maxLength={80} value={form.version}
              onChange={(e) => set({ version: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="ed-color">اللون</label>
            <input
              id="ed-color" className="field" maxLength={40} value={form.color}
              onChange={(e) => set({ color: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="ed-city">المدينة</label>
            <select id="ed-city" className="field" value={form.city}
              onChange={(e) => set({ city: e.target.value })}>
              {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.ar}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-fuel">الوقود</label>
            <select id="ed-fuel" className="field" value={form.fuel}
              onChange={(e) => set({ fuel: e.target.value as Fuel })}>
              <option value="diesel">ديزل</option>
              <option value="essence">بنزين</option>
              <option value="hybride">هجين</option>
              <option value="electrique">كهربائية</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-gear">علبة السرعة</label>
            <select id="ed-gear" className="field" value={form.gearbox}
              onChange={(e) => set({ gearbox: e.target.value as Gearbox })}>
              <option value="manuelle">عادية</option>
              <option value="automatique">أوتوماتيك</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-owners">
              عدد الملاّك <span className="num mr-auto" style={{ color: "var(--brand)" }}>{form.owners}</span>
            </label>
            <input id="ed-owners" type="range" min={1} max={5} value={form.owners}
              onChange={(e) => set({ owners: Number(e.target.value) })} className="w-full" />
          </div>
        </div>

        <div>
          <span className="label">الحالة العامة</span>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {(Object.keys(CONDITION_AR) as Condition[]).map((c) => (
              <button
                key={c} type="button" onClick={() => set({ condition: c })}
                aria-pressed={form.condition === c}
                className="rounded-lg py-2 text-xs font-bold transition"
                style={{
                  background: form.condition === c ? "var(--brand)" : "var(--surface-3)",
                  color: form.condition === c ? "var(--brand-ink)" : "var(--text-muted)",
                }}
              >
                {CONDITION_AR[c]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- الوثائق ---------- */}
      <section className="card space-y-2 p-5">
        <h2 className="text-[14px] font-bold">الوثائق</h2>
        {([
          ["papersOk", "البطاقة الرمادية فسميتي والوثائق كاملة"],
          ["vinChecked", "موافق على التحقق من رقم الهيكل (VIN)"],
          ["technicalControlValid", "الفحص التقني صالح"],
          ["serviceBook", "عندي دفتر الصيانة بالفواتير"],
          ["inspected", "فحص طريق المستقل تدار"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2.5"
            style={{ background: "var(--surface-3)" }}>
            <input type="checkbox" checked={form[key]}
              onChange={(e) => set({ [key]: e.target.checked } as Partial<Form>)}
              className="mt-0.5 h-4 w-4" />
            <span className="flex-1 text-xs">{label}</span>
          </label>
        ))}
      </section>

      {/* ---------- الوصف والتجهيزات ---------- */}
      <section className="card space-y-3 p-5">
        <h2 className="text-[14px] font-bold">الوصف والتجهيزات</h2>
        <div>
          <label className="label" htmlFor="ed-desc">
            الوصف <span className="num opacity-60">({form.description.length} حرف)</span>
          </label>
          <textarea id="ed-desc" className="field min-h-32" value={form.description}
            onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div>
          <span className="label">التجهيزات ({form.equipment.length})</span>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT.map((eq) => {
              const on = form.equipment.includes(eq);
              return (
                <button
                  key={eq} type="button" aria-pressed={on} className="chip transition"
                  onClick={() => set({
                    equipment: on
                      ? form.equipment.filter((x) => x !== eq)
                      : [...form.equipment, eq],
                  })}
                  style={{
                    background: on ? "var(--brand)" : "var(--surface-3)",
                    color: on ? "var(--brand-ink)" : "var(--text-muted)",
                    borderColor: "transparent",
                  }}
                >
                  {on ? <Check size={11} /> : <Plus size={11} />}{eq}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {error && (
        <p className="card p-3 text-[12.5px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>
      )}

      <div
        className="sticky bottom-0 flex gap-2 border-t py-3"
        style={{ borderColor: "var(--line-soft)", background: "var(--surface-1)" }}
      >
        <button className="btn btn-primary" disabled={busy}>
          {saved ? <><Check size={15} /> تسجّل</> : busy ? "كنسجّلو…" : "حفظ التعديلات"}
        </button>
        <Link href="/dashboard/listings" className="btn btn-solid">رجع</Link>
      </div>
    </form>
  );
}
