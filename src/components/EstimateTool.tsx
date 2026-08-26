"use client";

import Link from "next/link";
import { vehicleHref } from "@/lib/slug";
import { useEffect, useMemo, useState } from "react";
import { estimateValue } from "@/lib/market";
import { useCatalog } from "@/lib/useCatalog";
import { formatNumber } from "@/lib/format";
import { CITIES } from "@/lib/cities";
import type { Condition } from "@/lib/types";
import { Price } from "@/components/Price";
import {
  ArrowLeft, BadgeCheck, Calendar, Car, Chart, Coins, Fuel, Gauge, Gearbox,
  Info, MapPin, Moto, Sparkle, TrendingDown, Wallet,
} from "@/components/icons";

const CONDITIONS: [Condition, string, string][] = [
  ["excellent", "ممتازة", "كأنها جديدة، بلا خدوش ولا مشاكل"],
  ["tres-bon", "جيدة جداً", "علامات استعمال عادية جداً"],
  ["bon", "جيدة", "خدوش خفيفة، ميكانيك سليم"],
  ["moyen", "متوسطة", "تحتاج بعض الإصلاحات"],
];

export function EstimateTool() {
  const [kind, setKind] = useState<"car" | "moto">("car");
  const [make, setMake] = useState("Dacia");
  const [model, setModel] = useState("Logan");
  const [year, setYear] = useState(2018);
  const [km, setKm] = useState(120000);
  const [fuel, setFuel] = useState("diesel");
  const [gearbox, setGearbox] = useState("manuelle");
  const [condition, setCondition] = useState<Condition>("tres-bon");
  const [city, setCity] = useState("casablanca");

  /* الماركات والموديلات كيجيو من قاعدة البيانات */
  const { makesFor, modelsFor } = useCatalog();

  /* عدد المركبات المعروضة — كيبان فالملاحظة تحت التقدير */
  const [fleet, setFleet] = useState(0);
  useEffect(() => {
    let alive = true;
    fetch("/api/listings?limit=1")
      .then((r) => r.json())
      .then((j) => alive && j?.ok && setFleet(j.data.total as number))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const makes = useMemo(() => makesFor(kind), [makesFor, kind]);
  const models = useMemo(() => modelsFor(make), [modelsFor, make]);

  function changeKind(k: "car" | "moto") {
    setKind(k);
    const m = makesFor(k)[0];
    setMake(m);
    setModel(modelsFor(m)[0] ?? "");
    setKm(k === "moto" ? 20000 : 120000);
    setFuel(k === "moto" ? "essence" : "diesel");
  }

  function changeMake(m: string) {
    setMake(m);
    setModel(modelsFor(m)[0] ?? "");
  }

  const est = useMemo(
    () => estimateValue({ kind, make, model, year, km, fuel, gearbox, condition }),
    [kind, make, model, year, km, fuel, gearbox, condition],
  );

  // توقّع القيمة على 5 سنوات
  const projection = useMemo(() => {
    const rate = kind === "car" ? 0.1 : 0.075;
    const age = 2026 - year;
    const eff = rate * Math.max(0.35, 1 - age * 0.045);
    return Array.from({ length: 6 }, (_, i) => ({
      year: 2026 + i,
      value: Math.round(est.mid * Math.pow(1 - eff, i)),
    }));
  }, [est.mid, year, kind]);

  const maxProj = projection[0]?.value || 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      {/* النموذج */}
      <div className="card h-fit p-5">
        <h2 className="flex items-center gap-2 text-[13px] font-bold"><Sparkle size={15} style={{ color: "var(--brand)" }} /> معطيات المركبة</h2>

        <div className="mt-4 grid grid-cols-2 gap-1.5">
          {([["car", "سيارة", Car], ["moto", "دراجة نارية", Moto]] as const).map(([k, l, I]) => (
            <button
              key={k}
              onClick={() => changeKind(k)}
              aria-pressed={kind === k}
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition"
              style={{
                background: kind === k ? "var(--brand)" : "var(--surface-3)",
                color: kind === k ? "var(--brand-ink)" : "var(--text-muted)",
              }}
            >
              <I size={17} /> {l}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="label" htmlFor="es-make"><BadgeCheck size={13} /> الماركة</label>
            <select id="es-make" className="field" value={make} onChange={(e) => changeMake(e.target.value)}>
              {makes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="es-model"><Car size={13} /> الموديل</label>
            <select id="es-model" className="field" value={model} onChange={(e) => setModel(e.target.value)}>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="es-year">
              <Calendar size={13} /> سنة الصنع
              <span className="num mr-auto" style={{ color: "var(--brand)" }}>{year}</span>
            </label>
            <input
              id="es-year"
              type="range"
              min={2005}
              max={2026}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full "
            />
          </div>

          <div>
            <label className="label" htmlFor="es-km">
              <Gauge size={13} /> الكيلومتراج
              <span className="num mr-auto" style={{ color: "var(--brand)" }}>{formatNumber(km)} كم</span>
            </label>
            <input
              id="es-km"
              type="range"
              min={0}
              max={kind === "moto" ? 120000 : 350000}
              step={kind === "moto" ? 1000 : 5000}
              value={km}
              onChange={(e) => setKm(Number(e.target.value))}
              className="w-full "
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="es-fuel"><Fuel size={13} /> الوقود</label>
              <select id="es-fuel" className="field" value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option value="diesel">ديزل</option>
                <option value="essence">بنزين</option>
                <option value="hybride">هجين</option>
                <option value="electrique">كهربائي</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="es-gb"><Gearbox size={13} /> الناقل</label>
              <select id="es-gb" className="field" value={gearbox} onChange={(e) => setGearbox(e.target.value)}>
                <option value="manuelle">يدوية</option>
                <option value="automatique">أوتوماتيك</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="es-city"><MapPin size={13} /> المدينة</label>
            <select id="es-city" className="field" value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.ar}</option>)}
            </select>
          </div>

          <div>
            <span className="label"><BadgeCheck size={13} /> الحالة العامة</span>
            <div className="grid gap-1.5">
              {CONDITIONS.map(([k, l, hint]) => (
                <button
                  key={k}
                  onClick={() => setCondition(k)}
                  aria-pressed={condition === k}
                  className="rounded-lg border p-2.5 text-right transition"
                  style={{
                    borderColor: condition === k ? "var(--brand)" : "var(--line-soft)",
                    background: condition === k ? "color-mix(in oklab, var(--brand) 10%, transparent)" : "transparent",
                  }}
                >
                  <span className="block text-xs font-bold">{l}</span>
                  <span className="block text-[10px]" style={{ color: "var(--text-dim)" }}>{hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* النتيجة */}
      <div className="space-y-6">
        <div className="card-raised zellige relative overflow-hidden p-7 text-center">
          <div className="glow pointer-events-none absolute inset-0" />
          <div className="relative">
            <span className="eyebrow mx-auto"><Wallet size={13} /> الثمن المقترح</span>
            <p className="mt-2 text-[13px] font-bold">
              {make} {model} <span className="num opacity-60">{year}</span>
            </p>
            <div className="mt-3">
              <Price value={est.mid} className="text-4xl font-extrabold tracking-tight sm:text-5xl" />
            </div>
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              المجال المعقول:{" "}
              <b><Price value={est.low} /></b> — <b><Price value={est.high} /></b>
            </p>

            <div className="mx-auto mt-5 max-w-md">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full" style={{ background: "var(--line)" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.round(est.confidence * 100)}%`,
                      background: "var(--data)",
                    }}
                  />
                </div>
                <span className="num text-[11px]" style={{ color: "var(--text-dim)" }}>
                  دقة {Math.round(est.confidence * 100)}٪
                </span>
              </div>
              <p className="mt-2 text-[11px]" style={{ color: "var(--text-dim)" }}>
                محسوب من <span className="num">{est.sampleSize}</span> إعلاناً مشابهاً في السوق المغربي
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/sell" className="btn btn-primary btn-sm"><Coins size={14} /> بيع بهاد الثمن</Link>
              <Link
                href={`/vehicles?kind=${kind}&make=${make}&model=${encodeURIComponent(model)}`}
                className="btn btn-ghost btn-sm"
              >
                شوف الإعلانات المشابهة <ArrowLeft size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* توقع القيمة */}
        <div className="card p-5">
          <h2 className="flex items-center gap-2 text-[13px] font-bold"><Chart size={15} style={{ color: "var(--data)" }} /> كيفاش غادي تتغير القيمة</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            توقّع خسارة القيمة إلى غاية <span className="num">2031</span> بناءً على معدل السوق.
          </p>
          <div className="mt-5 flex items-end justify-between gap-2" style={{ height: 150 }}>
            {projection.map((p, i) => (
              <div key={p.year} className="flex flex-1 flex-col items-center gap-2">
                <span className="num text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
                  {Math.round(p.value / 1000)}k
                </span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(p.value / maxProj) * 110}px`,
                    background:
                      i === 0
                        ? "var(--brand)"
                        : `color-mix(in oklab, var(--brand) ${Math.max(18, 85 - i * 14)}%, var(--surface-3))`,
                  }}
                />
                <span className="num text-[10px]" style={{ color: "var(--text-dim)" }}>{p.year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* المقارنات */}
        {est.comparables.length > 0 && (
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-[13px] font-bold"><TrendingDown size={15} style={{ color: "var(--brand)" }} /> إعلانات مشابهة في السوق حالياً</h2>
            <div className="mt-3 divide-y" style={{ borderColor: "var(--line-soft)" }}>
              {est.comparables.map((c) => (
                <Link
                  key={c.id}
                  href={vehicleHref(c)}
                  className="flex items-center justify-between gap-3 py-2.5 text-xs transition hover:text-[var(--brand)]"
                >
                  <span className="truncate">
                    {c.make} {c.model} <span className="num opacity-60">{c.year}</span>
                    <span className="num mr-2 opacity-60">{formatNumber(c.km)} كم</span>
                  </span>
                  <span className="num shrink-0 font-bold">{formatNumber(c.price)} د.م</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="flex gap-2 text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          <Info size={13} className="mt-px shrink-0" />
          التقدير إرشادي ومبني على الإعلانات المتوفرة داخل المنصة ({formatNumber(fleet)} مركبة).
          الثمن النهائي كيتأثر بحالة المحرك، تاريخ الصيانة، الوثائق والتفاوض.
        </p>
      </div>
    </div>
  );
}
