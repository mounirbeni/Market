"use client";

import { Link } from "@/components/Link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EQUIPMENT } from "@/lib/equipment";
import { formatNumber } from "@/lib/format";
import { vehicleHref } from "@/lib/slug";
import { useMyListings } from "@/lib/useMyListings";
import { VehicleGlyph } from "@/components/VehicleArt";
import { useDict, useLocale } from "@/lib/i18n/client";
import { citiesIn, cityLabel, dhUnit, equipmentLabel, kmUnit, localizeOptions, specs } from "@/lib/i18n/labels";
import {
  CAR_BODIES, DOOR_OPTIONS, DRIVETRAINS, MOTO_BODIES, ORIGINS,
} from "@/lib/vehicle-options";
import type { Body, Condition, Drivetrain, Fuel, Gearbox, Origin } from "@/lib/types";
import { Check, ChevronLeft, Door, Plus } from "@/components/icons";

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
  body: Body;
  doors: number;
  fiscalPower: number;
  drivetrain: Drivetrain | "";
  origin: Origin | "";
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

export function EditListing({ listingRef }: { listingRef: string }) {
  const t = useDict();
  const locale = useLocale();
  const dh = dhUnit(locale);
  const km = kmUnit(locale);
  const L = specs(locale);
  const e = t.editListing;
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
      body: v.body,
      doors: v.doors ?? (v.kind === "car" ? 5 : 0),
      fiscalPower: v.fiscalPower,
      drivetrain: v.drivetrain ?? "",
      origin: v.origin ?? "",
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
            doors: v?.kind === "moto" ? undefined : form.doors,
            drivetrain: form.drivetrain || undefined,
            origin: form.origin || undefined,
            /* الخادم كيعاود يحسب هادو */
            consumption: v?.consumption,
            displacement: v?.displacement,
          },
        }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? e.genericError);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : e.genericError);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="card p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>{e.loading}</p>;
  }

  if (!v || !form) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {e.notFound}
        </p>
        <Link href="/dashboard/listings" className="btn btn-solid btn-sm mt-4">{e.backToListings}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold">{v.make} {v.model} <span className="num">{v.year}</span></p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
            {e.refLabel} <span className="num">{v.id}</span> · {e.refNote}
          </p>
        </div>
        <Link href={vehicleHref(v)} className="btn btn-ghost btn-sm">
          {e.seeListing} <ChevronLeft size={14} className="dir-flip" />
        </Link>
      </div>

      {/* ---------- الثمن والكيلومتراج ---------- */}
      <section className="card space-y-3 p-5">
        <h2 className="text-[14px] font-bold">{e.priceUsageTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ed-price">{e.priceLabel} ({dh})</label>
            <input
              id="ed-price" className="field num" dir="ltr" inputMode="numeric" required
              value={form.price}
              onChange={(ev) => set({ price: Number(ev.target.value.replace(/\D/g, "")) || 0 })}
            />
            <p className="mt-1 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
              {e.priceHint}
            </p>
          </div>
          <div>
            <label className="label" htmlFor="ed-km">{e.kmLabel}</label>
            <input
              id="ed-km" className="field num" dir="ltr" inputMode="numeric"
              value={form.km}
              onChange={(ev) => set({ km: Number(ev.target.value.replace(/\D/g, "")) || 0 })}
            />
            <p className="num mt-1 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
              {formatNumber(form.km)} {km}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {([["negotiable", e.negotiable], ["exchangeAccepted", e.exchangeAccepted]] as const).map(
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
        <h2 className="text-[14px] font-bold">{e.vehicleDetailsTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ed-version">{e.versionLabel}</label>
            <input
              id="ed-version" className="field" maxLength={80} value={form.version}
              onChange={(ev) => set({ version: ev.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="ed-color">{e.colorLabel}</label>
            <input
              id="ed-color" className="field" maxLength={40} value={form.color}
              onChange={(ev) => set({ color: ev.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="ed-city">{e.cityLabel}</label>
            <select id="ed-city" className="field" value={form.city}
              onChange={(ev) => set({ city: ev.target.value })}>
              {citiesIn(locale).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-fuel">{e.fuelLabel}</label>
            <select id="ed-fuel" className="field" value={form.fuel}
              onChange={(ev) => set({ fuel: ev.target.value as Fuel })}>
              <option value="diesel">{L.fuel.diesel}</option>
              <option value="essence">{L.fuel.essence}</option>
              <option value="hybride">{L.fuel.hybride}</option>
              <option value="electrique">{L.fuel.electrique}</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-gear">{e.gearLabel}</label>
            <select id="ed-gear" className="field" value={form.gearbox}
              onChange={(ev) => set({ gearbox: ev.target.value as Gearbox })}>
              <option value="manuelle">{L.gearbox.manuelle}</option>
              <option value="automatique">{L.gearbox.automatique}</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ed-owners">
              {e.ownersLabel} <span className="num me-auto" style={{ color: "var(--brand)" }}>{form.owners}</span>
            </label>
            <input id="ed-owners" type="range" min={1} max={5} value={form.owners}
              onChange={(ev) => set({ owners: Number(ev.target.value) })} className="w-full" />
          </div>
          <div>
            <label className="label" htmlFor="ed-power">
              {e.powerLabel} <span className="num me-auto" style={{ color: "var(--brand)" }}>{form.fiscalPower} {e.powerUnit}</span>
            </label>
            <input id="ed-power" type="range" min={1} max={v.kind === "moto" ? 6 : 30} value={form.fiscalPower}
              onChange={(ev) => set({ fiscalPower: Number(ev.target.value) })} className="w-full" />
          </div>
          {v.kind === "car" && (
            <div>
              <span className="label"><Door size={13} /> {e.doorsLabel}</span>
              <div className="grid grid-cols-4 gap-1.5">
                {DOOR_OPTIONS.map((n) => (
                  <button
                    key={n} type="button" onClick={() => set({ doors: n })}
                    aria-pressed={form.doors === n}
                    className="rounded-lg py-2 text-xs font-bold transition"
                    style={{
                      background: form.doors === n ? "var(--brand)" : "var(--surface-3)",
                      color: form.doors === n ? "var(--brand-ink)" : "var(--text-muted)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          {v.kind === "car" && (
            <div>
              <label className="label" htmlFor="ed-drivetrain">{e.drivetrainLabel}</label>
              <select id="ed-drivetrain" className="field" value={form.drivetrain}
                onChange={(ev) => set({ drivetrain: ev.target.value as Drivetrain | "" })}>
                <option value="">{e.unknown}</option>
                {localizeOptions(DRIVETRAINS, locale).map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label" htmlFor="ed-origin">{e.originLabel}</label>
            <select id="ed-origin" className="field" value={form.origin}
              onChange={(ev) => set({ origin: ev.target.value as Origin | "" })}>
              <option value="">{e.unknown}</option>
              {localizeOptions(ORIGINS, locale).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <span className="label">{e.bodyLabel}</span>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {localizeOptions(
              (v.kind === "moto" ? MOTO_BODIES : CAR_BODIES) as readonly { value: string; label: string; fr: string }[],
              locale,
            ).map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => set({ body: b.value as Body })}
                aria-pressed={form.body === b.value}
                className="flex flex-col items-center gap-1 rounded-lg border py-2.5 text-[10.5px] font-bold transition"
                style={{
                  borderColor: form.body === b.value ? "var(--brand)" : "var(--line)",
                  background: form.body === b.value ? "var(--brand-soft)" : "var(--surface-1)",
                  color: form.body === b.value ? "var(--brand)" : "var(--text)",
                }}
              >
                <VehicleGlyph shape={b.value as never} kind={v.kind} size={22} strokeWidth={10} />
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">{e.conditionLabel}</span>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {(Object.keys(L.condition) as Condition[]).map((c) => (
              <button
                key={c} type="button" onClick={() => set({ condition: c })}
                aria-pressed={form.condition === c}
                className="rounded-lg py-2 text-xs font-bold transition"
                style={{
                  background: form.condition === c ? "var(--brand)" : "var(--surface-3)",
                  color: form.condition === c ? "var(--brand-ink)" : "var(--text-muted)",
                }}
              >
                {L.condition[c]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- الوثائق ---------- */}
      <section className="card space-y-2 p-5">
        <h2 className="text-[14px] font-bold">{e.documentsTitle}</h2>
        {([
          ["papersOk", e.docs.papersOk],
          ["vinChecked", e.docs.vinChecked],
          ["technicalControlValid", e.docs.technicalControlValid],
          ["serviceBook", e.docs.serviceBook],
          ["inspected", e.docs.inspected],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2.5"
            style={{ background: "var(--surface-3)" }}>
            <input type="checkbox" checked={form[key]}
              onChange={(ev) => set({ [key]: ev.target.checked } as Partial<Form>)}
              className="mt-0.5 h-4 w-4" />
            <span className="flex-1 text-xs">{label}</span>
          </label>
        ))}
      </section>

      {/* ---------- الوصف والتجهيزات ---------- */}
      <section className="card space-y-3 p-5">
        <h2 className="text-[14px] font-bold">{e.descEquipTitle}</h2>
        <div>
          <label className="label" htmlFor="ed-desc">
            {e.descLabel} <span className="num opacity-60">({form.description.length} {e.charsSuffix})</span>
          </label>
          <textarea id="ed-desc" className="field min-h-32" value={form.description}
            onChange={(ev) => set({ description: ev.target.value })} />
        </div>
        <div>
          <span className="label">{e.equipmentLabel} ({form.equipment.length})</span>
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
                  {on ? <Check size={11} /> : <Plus size={11} />}{equipmentLabel(eq, locale)}
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
          {saved ? <><Check size={15} /> {e.saved}</> : busy ? e.saving : e.save}
        </button>
        <Link href="/dashboard/listings" className="btn btn-solid">{e.back}</Link>
      </div>
    </form>
  );
}
