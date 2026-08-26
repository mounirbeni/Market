"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/cities";

import { paramsFromFilters, type Filters } from "@/lib/search";
import { emptyFacets, type Facets } from "@/lib/facets";
import { formatNumber } from "@/lib/format";
import { AR } from "@/lib/format";
import {
  BadgeCheck, Bolt, Calendar, Car, Coins, Droplet, Fuel, Gauge, Gearbox, Key,
  Leaf, MapPin, Moto, Odometer, Reset, Search, ShieldCheck, Transmission,
  TrendingDown, Wrench,
} from "@/components/icons";
import { VehicleGlyph } from "@/components/VehicleArt";

const CAR_BODIES = [
  { value: "citadine", label: "مدينية" },
  { value: "berline", label: "صالون" },
  { value: "suv", label: "دفع رباعي" },
  { value: "break", label: "بريك" },
  { value: "utilitaire", label: "نفعية" },
  { value: "cabriolet", label: "مكشوفة" },
];
const MOTO_BODIES = [
  { value: "scooter", label: "سكوتر" },
  { value: "roadster", label: "رودستر" },
  { value: "trail", label: "طرق وعرة" },
  { value: "sportive", label: "رياضية" },
  { value: "custom", label: "كوستوم" },
];
const FUELS = [
  { value: "diesel", label: "ديزل", Icon: Droplet },
  { value: "essence", label: "بنزين", Icon: Fuel },
  { value: "hybride", label: "هجين", Icon: Leaf },
  { value: "electrique", label: "كهربائي", Icon: Bolt },
];

function Field({
  label, Icon, children,
}: { label: string; Icon: (p: { size?: number }) => React.JSX.Element; children: React.ReactNode }) {
  return (
    <div>
      <label className="label"><Icon size={13} /> {label}</label>
      {children}
    </div>
  );
}

export function AdvancedSearch() {
  const router = useRouter();
  const [f, setF] = useState<Partial<Filters>>({ kind: "car" });
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  const kind = (f.kind ?? "all") as "all" | "car" | "moto";

  /* العدد والماركات كيجيو من الخادم — كيتحدّثو مع كل اختيار */
  const [f9s, setF9s] = useState<Facets>(emptyFacets);
  const facetKey = useMemo(() => paramsFromFilters(f).toString(), [f]);
  useEffect(() => {
    let alive = true;
    fetch(`/api/facets?${facetKey}`)
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok) setF9s(j.data as Facets);
      })
      .catch(() => {
        /* الشبكة قاطعة — كنخلّيو آخر عدّادات عندنا */
      });
    return () => {
      alive = false;
    };
  }, [facetKey]);

  const makes = useMemo(() => Object.keys(f9s.makes).sort(), [f9s]);
  const models = useMemo(() => Object.keys(f9s.models).sort(), [f9s]);
  const bodies = kind === "moto" ? MOTO_BODIES : kind === "car" ? CAR_BODIES : [...CAR_BODIES, ...MOTO_BODIES];
  const count = f9s.total;

  function submit() {
    const params = paramsFromFilters(f);
    const base = kind === "car" ? "/cars" : kind === "moto" ? "/motorcycles" : "/vehicles";
    if (kind !== "all") params.delete("kind");
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* النوع */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[14px] font-bold">
            <Car size={16} style={{ color: "var(--brand)" }} /> نوع المركبة
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {([
              ["car", "سيارات", Car],
              ["moto", "دراجات نارية", Moto],
              ["all", "الاثنان", Key],
            ] as const).map(([k, label, Icon]) => {
              const on = kind === k;
              return (
                <button
                  key={k}
                  onClick={() => set({ kind: k, make: "", model: "", body: "" })}
                  aria-pressed={on}
                  className="flex flex-col items-center gap-1.5 rounded-xl border py-4 text-[12.5px] font-bold transition"
                  style={{
                    borderColor: on ? "var(--brand)" : "var(--line)",
                    background: on ? "var(--brand-soft)" : "var(--surface-1)",
                    color: on ? "var(--brand)" : "var(--text-muted)",
                  }}
                >
                  <Icon size={22} /> {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* الماركة والموديل */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[14px] font-bold">
            <BadgeCheck size={16} style={{ color: "var(--brand)" }} /> الماركة والموديل
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="الماركة" Icon={BadgeCheck}>
              <select className="field" dir="ltr" style={{ textAlign: "left" }} value={f.make ?? ""} onChange={(e) => set({ make: e.target.value, model: "" })}>
                <option value="">كل الماركات</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="الموديل" Icon={Car}>
              <select className="field" dir="ltr" style={{ textAlign: "left" }} value={f.model ?? ""} onChange={(e) => set({ model: e.target.value })} disabled={!f.make}>
                <option value="">{f.make ? `كل موديلات ${f.make}` : "اختر الماركة أولاً"}</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <span className="label"><Car size={13} /> نوع الهيكل</span>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {bodies.map((b) => {
                const on = f.body === b.value;
                return (
                  <button
                    key={b.value}
                    onClick={() => set({ body: on ? "" : b.value })}
                    aria-pressed={on}
                    className="flex flex-col items-center gap-1 rounded-lg border py-2.5 text-[10.5px] font-bold transition"
                    style={{
                      borderColor: on ? "var(--brand)" : "var(--line)",
                      background: on ? "var(--brand-soft)" : "var(--surface-1)",
                      color: on ? "var(--brand)" : "var(--text)",
                    }}
                  >
                    <VehicleGlyph
                      shape={b.value as never}
                      kind={MOTO_BODIES.some((x) => x.value === b.value) ? "moto" : "car"}
                      size={24}
                      strokeWidth={10}
                    />
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* الثمن والسنة والكيلومتراج */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[14px] font-bold">
            <Coins size={16} style={{ color: "var(--brand)" }} /> الثمن والاستعمال
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="الثمن من (د.م)" Icon={TrendingDown}>
              <input type="number" step="5000" className="field num" placeholder="0"
                value={f.priceMin ?? ""} onChange={(e) => set({ priceMin: e.target.value ? +e.target.value : undefined })} />
            </Field>
            <Field label="الثمن إلى (د.م)" Icon={Coins}>
              <input type="number" step="5000" className="field num" placeholder="بلا حد"
                value={f.priceMax ?? ""} onChange={(e) => set({ priceMax: e.target.value ? +e.target.value : undefined })} />
            </Field>
            <Field label="أقصى كيلومتراج" Icon={Odometer}>
              <input type="number" step="10000" className="field num" placeholder="بلا حد"
                value={f.kmMax ?? ""} onChange={(e) => set({ kmMax: e.target.value ? +e.target.value : undefined })} />
            </Field>
            <Field label="من سنة" Icon={Calendar}>
              <input type="number" className="field num" placeholder="2004"
                value={f.yearMin ?? ""} onChange={(e) => set({ yearMin: e.target.value ? +e.target.value : undefined })} />
            </Field>
            <Field label="إلى سنة" Icon={Calendar}>
              <input type="number" className="field num" placeholder="2026"
                value={f.yearMax ?? ""} onChange={(e) => set({ yearMax: e.target.value ? +e.target.value : undefined })} />
            </Field>
            <Field label="المدينة" Icon={MapPin}>
              <select className="field" value={f.city ?? ""} onChange={(e) => set({ city: e.target.value })}>
                <option value="">كل المغرب</option>
                {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.ar}</option>)}
              </select>
            </Field>
          </div>
        </section>

        {/* الميكانيك */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[14px] font-bold">
            <Gearbox size={16} style={{ color: "var(--brand)" }} /> الميكانيك
          </h2>
          <span className="label"><Fuel size={13} /> نوع الوقود</span>
          <div className="flex flex-wrap gap-1.5">
            {FUELS.map((x) => {
              const on = f.fuel === x.value;
              return (
                <button key={x.value} onClick={() => set({ fuel: on ? "" : x.value })} aria-pressed={on}
                  className="chip transition"
                  style={{
                    borderColor: on ? "var(--brand)" : "var(--line)",
                    background: on ? "var(--brand-soft)" : "var(--surface-1)",
                    color: on ? "var(--brand)" : "var(--text-muted)",
                  }}>
                  <x.Icon size={13} /> {x.label}
                </button>
              );
            })}
          </div>

          <span className="label mt-4"><Transmission size={13} /> ناقل السرعة</span>
          <div className="flex flex-wrap gap-1.5">
            {(["manuelle", "automatique"] as const).map((g) => {
              const on = f.gearbox === g;
              return (
                <button key={g} onClick={() => set({ gearbox: on ? "" : g })} aria-pressed={on}
                  className="chip transition"
                  style={{
                    borderColor: on ? "var(--brand)" : "var(--line)",
                    background: on ? "var(--brand-soft)" : "var(--surface-1)",
                    color: on ? "var(--brand)" : "var(--text-muted)",
                  }}>
                  <Gearbox size={13} /> {AR.gearbox[g]}
                </button>
              );
            })}
          </div>
        </section>

        {/* الضمانات */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[14px] font-bold">
            <ShieldCheck size={16} style={{ color: "var(--brand)" }} /> ضمانات إضافية
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["goodDealsOnly", "تحت ثمن السوق", TrendingDown],
              ["inspectedOnly", "مفحوصة من طريق", Wrench],
              ["verifiedOnly", "وثائق موثقة", BadgeCheck],
              ["firstHandOnly", "يد أولى", Key],
            ] as const).map(([key, label, Icon]) => {
              const on = Boolean(f[key]);
              return (
                <button key={key} onClick={() => set({ [key]: !on } as Partial<Filters>)} aria-pressed={on}
                  className="flex items-center gap-2.5 rounded-lg border p-3 text-right transition"
                  style={{
                    borderColor: on ? "var(--brand)" : "var(--line)",
                    background: on ? "var(--brand-soft)" : "var(--surface-1)",
                  }}>
                  <Icon size={17} style={{ color: on ? "var(--brand)" : "var(--text-dim)" }} />
                  <span className="text-[12.5px] font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* الملخص */}
      <aside className="lg:sticky lg:top-[84px] lg:h-fit">
        <div className="card p-5">
          <h2 className="text-[13px] font-bold">ملخص البحث</h2>
          <div className="mt-4 text-center">
            <div className="num text-4xl font-extrabold" style={{ color: count ? "var(--brand)" : "var(--bad)" }}>
              {formatNumber(count)}
            </div>
            <div className="mt-1 text-[11.5px]" style={{ color: "var(--text-dim)" }}>مركبة مطابقة</div>
          </div>

          <ul className="mt-5 space-y-1.5 text-[11.5px]" style={{ color: "var(--text-muted)" }}>
            <li className="flex justify-between"><span>النوع</span><b>{kind === "car" ? "سيارات" : kind === "moto" ? "دراجات" : "الكل"}</b></li>
            {f.make && <li className="flex justify-between"><span>الماركة</span><b>{f.make}</b></li>}
            {f.model && <li className="flex justify-between"><span>الموديل</span><b>{f.model}</b></li>}
            {f.city && <li className="flex justify-between"><span>المدينة</span><b>{CITIES.find((c) => c.slug === f.city)?.ar}</b></li>}
            {(f.priceMin || f.priceMax) && (
              <li className="flex justify-between">
                <span>الثمن</span>
                <b className="num">{formatNumber(f.priceMin ?? 0)} — {f.priceMax ? formatNumber(f.priceMax) : "∞"}</b>
              </li>
            )}
            {f.kmMax && <li className="flex justify-between"><span>الكيلومتراج</span><b className="num">حتى {formatNumber(f.kmMax)}</b></li>}
          </ul>

          <button onClick={submit} disabled={!count} className="btn btn-primary mt-6 w-full">
            <Search size={16} /> عرض النتائج
          </button>
          <button
            onClick={() => setF({ kind: "car" })}
            className="btn btn-ghost btn-sm mt-2 w-full"
          >
            <Reset size={13} /> إعادة ضبط
          </button>
        </div>
      </aside>
    </div>
  );
}
