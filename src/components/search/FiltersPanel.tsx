"use client";

import { CITIES } from "@/lib/cities";
import { makesFor, modelsFor, VEHICLES } from "@/lib/data/vehicles";
import type { Filters } from "@/lib/search";
import { AR } from "@/lib/format";

interface Props {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  reset: () => void;
  count: number;
}

const CAR_BODIES = ["citadine", "berline", "suv", "break", "utilitaire", "cabriolet"] as const;
const MOTO_BODIES = ["scooter", "roadster", "trail", "sportive", "custom"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b py-4" style={{ borderColor: "var(--line-soft)" }}>
      <h3 className="mb-3 text-xs font-extrabold" style={{ color: "var(--text-muted)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FiltersPanel({ filters, set, reset, count }: Props) {
  const makes = makesFor(filters.kind);
  const models = filters.make ? modelsFor(filters.make) : [];
  const bodies =
    filters.kind === "moto"
      ? MOTO_BODIES
      : filters.kind === "car"
        ? CAR_BODIES
        : [...CAR_BODIES, ...MOTO_BODIES];

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold">تصفية النتائج</h2>
        <button onClick={reset} className="text-[11px] underline" style={{ color: "var(--text-dim)" }}>
          إعادة ضبط
        </button>
      </div>

      <Section title="النوع">
        <div className="grid grid-cols-3 gap-1.5">
          {([
            ["all", "الكل"],
            ["car", "سيارات"],
            ["moto", "دراجات"],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => set({ kind: k, make: "", model: "", body: "" })}
              aria-pressed={filters.kind === k}
              className="rounded-lg py-2 text-xs font-bold transition"
              style={{
                background: filters.kind === k ? "var(--accent)" : "var(--bg-inset)",
                color: filters.kind === k ? "var(--accent-ink)" : "var(--text-muted)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </Section>

      <Section title="الماركة والموديل">
        <select
          className="field"
          value={filters.make}
          onChange={(e) => set({ make: e.target.value, model: "" })}
          aria-label="الماركة"
        >
          <option value="">كل الماركات</option>
          {makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {filters.make && (
          <select
            className="field mt-2"
            value={filters.model}
            onChange={(e) => set({ model: e.target.value })}
            aria-label="الموديل"
          >
            <option value="">كل الموديلات</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </Section>

      <Section title="الثمن (درهم)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            className="field num"
            placeholder="من"
            value={filters.priceMin ?? ""}
            onChange={(e) => set({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
            aria-label="الثمن الأدنى"
          />
          <input
            type="number"
            inputMode="numeric"
            className="field num"
            placeholder="إلى"
            value={filters.priceMax ?? ""}
            onChange={(e) => set({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
            aria-label="الثمن الأقصى"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[50000, 100000, 150000, 250000].map((p) => (
            <button
              key={p}
              onClick={() => set({ priceMax: p })}
              className="chip transition hover:border-[var(--accent)]"
            >
              تحت <span className="num">{p / 10000}</span> مليون
            </button>
          ))}
        </div>
      </Section>

      <Section title="السنة والكيلومتراج">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            className="field num"
            placeholder="من سنة"
            value={filters.yearMin ?? ""}
            onChange={(e) => set({ yearMin: e.target.value ? Number(e.target.value) : undefined })}
            aria-label="السنة الأدنى"
          />
          <input
            type="number"
            inputMode="numeric"
            className="field num"
            placeholder="إلى سنة"
            value={filters.yearMax ?? ""}
            onChange={(e) => set({ yearMax: e.target.value ? Number(e.target.value) : undefined })}
            aria-label="السنة الأقصى"
          />
        </div>
        <input
          type="number"
          inputMode="numeric"
          className="field num mt-2"
          placeholder="أقصى كيلومتراج"
          value={filters.kmMax ?? ""}
          onChange={(e) => set({ kmMax: e.target.value ? Number(e.target.value) : undefined })}
          aria-label="أقصى كيلومتراج"
        />
      </Section>

      <Section title="المواصفات">
        <div className="grid gap-2">
          <select className="field" value={filters.fuel} onChange={(e) => set({ fuel: e.target.value })} aria-label="الوقود">
            <option value="">كل أنواع الوقود</option>
            {(Object.keys(AR.fuel) as (keyof typeof AR.fuel)[]).map((f) => (
              <option key={f} value={f}>{AR.fuel[f]}</option>
            ))}
          </select>
          <select className="field" value={filters.gearbox} onChange={(e) => set({ gearbox: e.target.value })} aria-label="ناقل السرعة">
            <option value="">كل أنواع الناقل</option>
            <option value="manuelle">يدوية</option>
            <option value="automatique">أوتوماتيك</option>
          </select>
          <select className="field" value={filters.body} onChange={(e) => set({ body: e.target.value })} aria-label="الهيكل">
            <option value="">كل الهياكل</option>
            {bodies.map((b) => (
              <option key={b} value={b}>{AR.body[b]}</option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="المدينة">
        <select className="field" value={filters.city} onChange={(e) => set({ city: e.target.value })} aria-label="المدينة">
          <option value="">كل المغرب</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.ar} ({VEHICLES.filter((v) => v.city === c.slug).length})
            </option>
          ))}
        </select>
      </Section>

      <Section title="مستوى الثقة">
        <input
          type="range"
          min={0}
          max={95}
          step={5}
          value={filters.trustMin ?? 0}
          onChange={(e) => set({ trustMin: Number(e.target.value) || undefined })}
          className="w-full accent-[var(--accent)]"
          aria-label="أدنى مؤشر ثقة"
        />
        <div className="mt-1 flex justify-between text-[11px]" style={{ color: "var(--text-dim)" }}>
          <span>الكل</span>
          <span className="num font-bold" style={{ color: "var(--accent)" }}>
            {filters.trustMin ? `${filters.trustMin}+ / 100` : "بدون حد"}
          </span>
        </div>
      </Section>

      <Section title="ضمانات">
        <div className="space-y-2">
          {([
            ["goodDealsOnly", "الصفقات تحت ثمن السوق فقط"],
            ["inspectedOnly", "مفحوصة من طرف طريق"],
            ["verifiedOnly", "وثائق ورقم هيكل مُتحقق منهما"],
            ["firstHandOnly", "يد أولى"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={Boolean(filters[key])}
                onChange={(e) => set({ [key]: e.target.checked } as Partial<Filters>)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span style={{ color: "var(--text-muted)" }}>{label}</span>
            </label>
          ))}
        </div>
      </Section>

      <div className="pt-4 text-center text-xs" style={{ color: "var(--text-dim)" }}>
        <span className="num font-extrabold" style={{ color: "var(--accent)" }}>{count}</span> مركبة مطابقة
      </div>
    </div>
  );
}
