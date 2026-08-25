"use client";

import { useMemo, useState } from "react";
import { CITIES } from "@/lib/cities";
import { makesFor, modelsFor, VEHICLES } from "@/lib/data/vehicles";
import { applyFilters, type Filters } from "@/lib/search";
import { formatNumber } from "@/lib/format";
import {
  BadgeCheck, Bolt, Calendar, Car, Droplet, Fuel, Gauge, Gearbox, Grid, Leaf,
  MapPin, Moto, Reset, ShieldCheck, Timer, TrendingDown, Key, Wrench,
} from "@/components/icons";
import { VehicleGlyph } from "@/components/VehicleArt";
import {
  ChipToggles, DualRange, FilterSection, IconTiles, Segmented, SwitchRow,
} from "./FilterPrimitives";

interface Props {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  reset: () => void;
  count: number;
  lockKind?: "car" | "moto";
  lockBrand?: string;
}

const CONDITIONS = [
  { value: "excellent", label: "ممتازة" },
  { value: "tres-bon", label: "جيدة جداً" },
  { value: "bon", label: "جيدة" },
  { value: "moyen", label: "متوسطة" },
];

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

const MOTO_SET = new Set(MOTO_BODIES.map((b) => b.value));

const FUELS = [
  { value: "diesel", label: "ديزل", Icon: Droplet },
  { value: "essence", label: "بنزين", Icon: Fuel },
  { value: "hybride", label: "هجين", Icon: Leaf },
  { value: "electrique", label: "كهربائي", Icon: Bolt },
];

const GEARBOXES = [
  { value: "manuelle", label: "يدوية", Icon: Gearbox },
  { value: "automatique", label: "أوتوماتيك", Icon: Gearbox },
];

const PRICE_MAX = 600000;
const KM_MAX = 350000;

function histogram(values: number[], min: number, max: number, buckets = 22) {
  const out = new Array(buckets).fill(0);
  const span = max - min || 1;
  for (const v of values) {
    const i = Math.min(buckets - 1, Math.max(0, Math.floor(((v - min) / span) * buckets)));
    out[i]++;
  }
  return out;
}

export function FiltersPanel({ filters, set, reset, count, lockKind, lockBrand }: Props) {
  const [showAllCities, setShowAllCities] = useState(false);

  /** عدد النتائج لو طُبّق هذا الخيار */
  const facet = useMemo(
    () => (patch: Partial<Filters>) => applyFilters({ ...filters, ...patch }).length,
    [filters],
  );

  const kindCounts = useMemo(
    () => ({
      all: applyFilters({ ...filters, kind: "all", make: "", model: "", body: "" }).length,
      car: applyFilters({ ...filters, kind: "car", make: "", model: "", body: "" }).length,
      moto: applyFilters({ ...filters, kind: "moto", make: "", model: "", body: "" }).length,
    }),
    [filters],
  );

  const makes = useMemo(() => makesFor(filters.kind), [filters.kind]);
  const models = useMemo(() => (filters.make ? modelsFor(filters.make) : []), [filters.make]);

  const bodies = filters.kind === "moto" ? MOTO_BODIES : filters.kind === "car" ? CAR_BODIES : [...CAR_BODIES, ...MOTO_BODIES];

  const priceHist = useMemo(() => {
    const base = applyFilters({ ...filters, priceMin: undefined, priceMax: undefined });
    return histogram(base.map((v) => v.price), 0, PRICE_MAX);
  }, [filters]);

  const yearHist = useMemo(() => {
    const base = applyFilters({ ...filters, yearMin: undefined, yearMax: undefined });
    return histogram(base.map((v) => v.year), 2004, 2026, 22);
  }, [filters]);

  const cityList = useMemo(() => {
    const withCounts = CITIES.map((c) => ({ ...c, n: facet({ city: c.slug }) }))
      .filter((c) => c.n > 0)
      .sort((a, b) => b.n - a.n);
    return showAllCities ? withCounts : withCounts.slice(0, 8);
  }, [facet, showAllCities]);

  const activeTotal = [
    filters.make, filters.model, filters.city, filters.fuel, filters.gearbox, filters.body,
    filters.condition, filters.urgentOnly,
  ].filter(Boolean).length
    + [filters.priceMin, filters.priceMax, filters.yearMin, filters.yearMax, filters.kmMax, filters.trustMin].filter((x) => x !== undefined).length
    + (filters.condition ? 1 : 0)
    + [filters.goodDealsOnly, filters.inspectedOnly, filters.verifiedOnly, filters.firstHandOnly, filters.urgentOnly].filter(Boolean).length;

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
      >
        <h2 className="flex items-center gap-2 text-[13px] font-bold">
          تصفية
          {activeTotal > 0 && (
            <span
              className="num grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9.5px]"
              style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
            >
              {activeTotal}
            </span>
          )}
        </h2>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-[11px] font-semibold transition hover:text-[var(--brand)]"
          style={{ color: "var(--text-dim)" }}
        >
          <Reset size={13} /> إعادة ضبط
        </button>
      </div>

      <div className="px-4">
        {/* النوع */}
        {!lockKind && (
        <div className="py-4">
          <Segmented
            value={filters.kind}
            onChange={(k) => set({ kind: k, make: "", model: "", body: "" })}
            options={[
              { value: "all", label: "الكل", Icon: Grid, count: kindCounts.all },
              { value: "car", label: "سيارات", Icon: Car, count: kindCounts.car },
              { value: "moto", label: "دراجات", Icon: Moto, count: kindCounts.moto },
            ]}
          />
        </div>
        )}

        {/* الهيكل */}
        <FilterSection title="نوع الهيكل" Icon={Car} activeCount={filters.body ? 1 : 0}>
          <IconTiles
            value={filters.body}
            onChange={(b) => set({ body: b })}
            columns={3}
            options={bodies.map((b) => ({
              ...b,
              count: facet({ body: b.value }),
              render: () => (
                <VehicleGlyph
                  shape={b.value as never}
                  kind={MOTO_SET.has(b.value) ? "moto" : "car"}
                  size={26}
                  strokeWidth={10}
                />
              ),
            }))}
          />
        </FilterSection>

        {/* الماركة */}
        <FilterSection
          title={lockBrand ? "الموديل" : "الماركة والموديل"}
          Icon={BadgeCheck}
          activeCount={(filters.make && !lockBrand ? 1 : 0) + (filters.model ? 1 : 0)}
        >
          {!lockBrand && (
          <select
            className="field"
            value={filters.make}
            onChange={(e) => set({ make: e.target.value, model: "" })}
            aria-label="الماركة"
          >
            <option value="">كل الماركات</option>
            {makes.map((m) => {
              const n = facet({ make: m, model: "" });
              return (
                <option key={m} value={m} disabled={n === 0}>
                  {m} ({n})
                </option>
              );
            })}
          </select>
          )}
          {filters.make && (
            <select
              className="field mt-2"
              value={filters.model}
              onChange={(e) => set({ model: e.target.value })}
              aria-label="الموديل"
            >
              <option value="">كل موديلات {filters.make}</option>
              {models.map((m) => (
                <option key={m} value={m}>{m} ({facet({ model: m })})</option>
              ))}
            </select>
          )}
        </FilterSection>

        {/* الثمن */}
        <FilterSection
          title="الثمن"
          Icon={TrendingDown}
          activeCount={(filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0)}
        >
          <DualRange
            min={0}
            max={PRICE_MAX}
            step={5000}
            low={filters.priceMin}
            high={filters.priceMax}
            histogram={priceHist}
            onChange={(lo, hi) => set({ priceMin: lo, priceMax: hi })}
            format={(n) => `${formatNumber(n / 10000)} مليون`}
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[60000, 100000, 150000, 250000].map((p) => (
              <button
                key={p}
                onClick={() => set({ priceMax: p, priceMin: undefined })}
                className="chip transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                تحت <span className="num">{p / 10000}</span> مليون
              </button>
            ))}
          </div>
        </FilterSection>

        {/* السنة */}
        <FilterSection
          title="سنة الصنع"
          Icon={Calendar}
          activeCount={(filters.yearMin ? 1 : 0) + (filters.yearMax ? 1 : 0)}
        >
          <DualRange
            min={2004}
            max={2026}
            step={1}
            low={filters.yearMin}
            high={filters.yearMax}
            histogram={yearHist}
            onChange={(lo, hi) => set({ yearMin: lo, yearMax: hi })}
            format={(n) => String(n)}
          />
        </FilterSection>

        {/* الكيلومتراج */}
        <FilterSection title="الكيلومتراج" Icon={Gauge} activeCount={filters.kmMax ? 1 : 0}>
          <input
            type="range"
            min={0}
            max={KM_MAX}
            step={10000}
            value={filters.kmMax ?? KM_MAX}
            onChange={(e) => {
              const v = Number(e.target.value);
              set({ kmMax: v >= KM_MAX ? undefined : v });
            }}
            aria-label="أقصى كيلومتراج"
          />
          <div className="flex justify-between text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
            <span>0</span>
            <span style={{ color: filters.kmMax ? "var(--brand)" : undefined }}>
              {filters.kmMax ? (
                <>أقل من <span className="num">{formatNumber(filters.kmMax)}</span> كم</>
              ) : (
                "بدون حد"
              )}
            </span>
          </div>
        </FilterSection>

        {/* الوقود والناقل */}
        <FilterSection
          title="المحرك والناقل"
          Icon={Fuel}
          activeCount={(filters.fuel ? 1 : 0) + (filters.gearbox ? 1 : 0)}
        >
          <ChipToggles
            value={filters.fuel}
            onChange={(f) => set({ fuel: f })}
            options={FUELS.map((f) => ({ ...f, count: facet({ fuel: f.value }) }))}
          />
          <div className="mt-2">
            <ChipToggles
              value={filters.gearbox}
              onChange={(g) => set({ gearbox: g })}
              options={GEARBOXES.map((g) => ({ ...g, count: facet({ gearbox: g.value }) }))}
            />
          </div>
        </FilterSection>

        {/* حالة المركبة */}
        <FilterSection title="حالة المركبة" Icon={BadgeCheck} activeCount={filters.condition ? 1 : 0}>
          <ChipToggles
            value={filters.condition}
            onChange={(c) => set({ condition: c })}
            options={CONDITIONS.map((c) => ({ ...c, count: facet({ condition: c.value }) }))}
          />
        </FilterSection>

        {/* المدينة */}
        <FilterSection title="المدينة" Icon={MapPin} activeCount={filters.city ? 1 : 0}>
          <ChipToggles
            value={filters.city}
            onChange={(c) => set({ city: c })}
            options={cityList.map((c) => ({ value: c.slug, label: c.ar, count: c.n }))}
          />
          {CITIES.length > 8 && (
            <button
              onClick={() => setShowAllCities((s) => !s)}
              className="mt-2 text-[11px] font-semibold underline"
              style={{ color: "var(--text-dim)" }}
            >
              {showAllCities ? "عرض أقل" : "كل المدن"}
            </button>
          )}
        </FilterSection>

        {/* الثقة */}
        <FilterSection title="مستوى الثقة" Icon={ShieldCheck} activeCount={filters.trustMin ? 1 : 0}>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={filters.trustMin ?? 0}
            onChange={(e) => set({ trustMin: Number(e.target.value) || undefined })}
            aria-label="أدنى مؤشر ثقة"
          />
          <div className="flex justify-between text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
            <span>الكل</span>
            <span style={{ color: filters.trustMin ? "var(--brand)" : undefined }}>
              {filters.trustMin ? (
                <><span className="num">{filters.trustMin}</span>+ من 100</>
              ) : (
                "بدون حد"
              )}
            </span>
          </div>
        </FilterSection>

        {/* الضمانات */}
        <FilterSection
          title="ضمانات"
          Icon={ShieldCheck}
          activeCount={[filters.goodDealsOnly, filters.inspectedOnly, filters.verifiedOnly, filters.firstHandOnly, filters.urgentOnly].filter(Boolean).length}
        >
          <div className="grid gap-1.5">
            <SwitchRow
              Icon={TrendingDown}
              label="صفقات تحت ثمن السوق"
              hint="الثمن أقل من المرجع المحسوب"
              checked={filters.goodDealsOnly}
              onChange={(b) => set({ goodDealsOnly: b })}
              count={facet({ goodDealsOnly: true })}
            />
            <SwitchRow
              Icon={Wrench}
              label="مفحوصة من طرف طريق"
              hint="120 نقطة فحص مستقلة"
              checked={filters.inspectedOnly}
              onChange={(b) => set({ inspectedOnly: b })}
              count={facet({ inspectedOnly: true })}
            />
            <SwitchRow
              Icon={BadgeCheck}
              label="وثائق ورقم هيكل موثقان"
              checked={filters.verifiedOnly}
              onChange={(b) => set({ verifiedOnly: b })}
              count={facet({ verifiedOnly: true })}
            />
            <SwitchRow
              Icon={Key}
              label="يد أولى"
              hint="مالك واحد منذ الشراء"
              checked={filters.firstHandOnly}
              onChange={(b) => set({ firstHandOnly: b })}
              count={facet({ firstHandOnly: true })}
            />
            <SwitchRow
              Icon={Timer}
              label="بيع مستعجل"
              hint="البائع مستعجل — غالباً قابل للتفاوض"
              checked={filters.urgentOnly}
              onChange={(b) => set({ urgentOnly: b })}
              count={facet({ urgentOnly: true })}
            />
          </div>
        </FilterSection>
      </div>

      <div
        className="border-t px-4 py-3 text-center text-[11.5px]"
        style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)", color: "var(--text-dim)" }}
      >
        <span className="num font-extrabold" style={{ color: "var(--brand)" }}>{count}</span> مركبة مطابقة
      </div>
    </div>
  );
}
