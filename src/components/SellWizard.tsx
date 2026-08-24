"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { estimateValue, trustScore } from "@/lib/market";
import { makesFor, modelsFor } from "@/lib/data/vehicles";
import { CITIES } from "@/lib/cities";
import { formatNumber } from "@/lib/format";
import { TrustRing } from "@/components/TrustBadge";
import type { Condition, Seller, Vehicle } from "@/lib/types";

const STEPS = ["المركبة", "الحالة والوثائق", "الصور والوصف", "الثمن", "المعاينة"];

interface Draft {
  kind: "car" | "moto";
  make: string;
  model: string;
  version: string;
  year: number;
  km: number;
  fuel: string;
  gearbox: string;
  city: string;
  condition: Condition;
  owners: number;
  papersOk: boolean;
  vinChecked: boolean;
  serviceBook: boolean;
  technicalControlValid: boolean;
  accident: boolean;
  photos: number;
  hasVideo: boolean;
  description: string;
  equipment: string[];
  inspected: boolean;
  price: number;
  sellerName: string;
  sellerType: "particulier" | "professionnel";
  idVerified: boolean;
  phoneVerified: boolean;
}

const EQUIPMENT = [
  "مكيف الهواء", "نظام ABS", "وسائد هوائية", "زجاج كهربائي", "راديو Bluetooth",
  "شاشة تعمل باللمس", "كاميرا الرجوع للخلف", "حساسات ركن", "مثبت السرعة",
  "جنطات ألومنيوم", "GPS", "فتحة سقف", "مقاعد جلدية", "أضواء LED",
];

const initialDraft: Draft = {
  kind: "car",
  make: "Dacia",
  model: "Logan",
  version: "1.5 dCi",
  year: 2018,
  km: 120000,
  fuel: "diesel",
  gearbox: "manuelle",
  city: "casablanca",
  condition: "tres-bon",
  owners: 1,
  papersOk: true,
  vinChecked: false,
  serviceBook: false,
  technicalControlValid: true,
  accident: false,
  photos: 6,
  hasVideo: false,
  description: "",
  equipment: ["مكيف الهواء", "نظام ABS"],
  inspected: false,
  price: 120000,
  sellerName: "",
  sellerType: "particulier",
  idVerified: false,
  phoneVerified: true,
};

function draftToVehicle(d: Draft): Vehicle {
  return {
    id: "draft",
    kind: d.kind,
    make: d.make,
    model: d.model,
    version: d.version,
    year: d.year,
    km: d.km,
    price: d.price,
    owners: d.owners,
    fuel: d.fuel as Vehicle["fuel"],
    gearbox: d.gearbox as Vehicle["gearbox"],
    body: (d.kind === "moto" ? "roadster" : "berline") as Vehicle["body"],
    fiscalPower: d.kind === "moto" ? 2 : 6,
    consumption: d.kind === "moto" ? 3 : 5,
    color: "أبيض",
    city: d.city,
    condition: d.condition,
    firstHand: d.owners === 1,
    papersOk: d.papersOk,
    technicalControl: d.technicalControlValid ? "2027-01-01" : "2026-01-01",
    inspected: d.inspected,
    photos: d.photos,
    hasVideo: d.hasVideo,
    serviceBook: d.serviceBook,
    vinChecked: d.vinChecked,
    description: d.description,
    equipment: d.equipment,
    history: d.accident
      ? [{ date: "2022-05-14", type: "accident", label: "حادث مصرّح به" }]
      : [],
    sellerId: "s03",
    publishedAt: "2026-08-24T10:00:00Z",
    views: 0,
    saves: 0,
    priceDrops: [],
    negotiable: true,
    exchangeAccepted: false,
  };
}

function draftSeller(d: Draft): Seller {
  return {
    id: "draft",
    name: d.sellerName || "أنت",
    type: d.sellerType,
    city: d.city,
    since: 2026,
    idVerified: d.idVerified,
    phoneVerified: d.phoneVerified,
    rating: 4.5,
    salesCount: 0,
    responseMinutes: 60,
  };
}

export function SellWizard() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(initialDraft);
  const [published, setPublished] = useState(false);

  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  const makes = useMemo(() => makesFor(d.kind), [d.kind]);
  const models = useMemo(() => modelsFor(d.make), [d.make]);

  const estimate = useMemo(
    () =>
      estimateValue({
        kind: d.kind,
        make: d.make,
        model: d.model,
        year: d.year,
        km: d.km,
        fuel: d.fuel,
        gearbox: d.gearbox,
        condition: d.condition,
      }),
    [d.kind, d.make, d.model, d.year, d.km, d.fuel, d.gearbox, d.condition],
  );

  const trust = useMemo(
    () => trustScore(draftToVehicle(d), draftSeller(d)),
    [d],
  );

  const priceDelta = estimate.mid ? (d.price - estimate.mid) / estimate.mid : 0;

  /** اقتراحات لرفع النقطة */
  const tips = useMemo(() => {
    const t: { text: string; gain: number; done: boolean }[] = [
      { text: "وثّق هويتك بالبطاقة الوطنية", gain: 8, done: d.idVerified },
      { text: "زد رقم الهيكل (VIN) باش نتحققو منه", gain: 6, done: d.vinChecked },
      { text: "زيد على 12 صورة للمركبة", gain: 7, done: d.photos >= 12 },
      { text: "زيد فيديو قصير للمحرك والهيكل", gain: 4, done: d.hasVideo },
      { text: "أرفق دفتر الصيانة", gain: 7, done: d.serviceBook },
      { text: "اطلب فحص طريق المستقل", gain: 10, done: d.inspected },
      { text: "اكتب وصفاً مفصلاً (أكثر من 220 حرف)", gain: 3, done: d.description.length > 220 },
      { text: "وثّق 8 تجهيزات على الأقل", gain: 4, done: d.equipment.length >= 8 },
    ];
    return t.sort((a, b) => Number(a.done) - Number(b.done) || b.gain - a.gain);
  }, [d]);

  if (published) {
    return (
      <div className="card zellige relative overflow-hidden p-12 text-center">
        <div className="glow-saffron pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="text-5xl">🎉</p>
          <h2 className="mt-4 text-2xl font-black">تنشر إعلانك!</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {d.make} {d.model} {d.year} بثمن {formatNumber(d.price)} د.م، بمؤشر ثقة{" "}
            <b className="num">{trust.score}/100</b>. الإعلانات اللي نقطتها فوق{" "}
            <span className="num">75</span> كتباع بسرعة أكبر بـ<span className="num">3</span> مرات.
          </p>
          <div className="mt-3 text-xs" style={{ color: "var(--text-dim)" }}>
            (هادي منصة تجريبية — الإعلان ما تسجّلش فأي خادم)
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => { setPublished(false); setStep(0); setD(initialDraft); }} className="btn btn-ghost">
              إعلان جديد
            </button>
            <Link href="/vehicles" className="btn btn-primary">تصفح السوق</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        {/* المؤشر */}
        <ol className="mb-6 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <button
                onClick={() => setStep(i)}
                className="w-full text-right"
                aria-current={step === i}
              >
                <div
                  className="h-1 rounded-full transition-all"
                  style={{ background: i <= step ? "var(--accent)" : "var(--bg-inset)" }}
                />
                <span
                  className="mt-1.5 block text-[10px] font-bold"
                  style={{ color: i <= step ? "var(--accent)" : "var(--text-dim)" }}
                >
                  {s}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="card p-5">
          {/* ---------- 1 ---------- */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold">شنو غادي تبيع؟</h2>
              <div className="grid grid-cols-2 gap-1.5">
                {([["car", "سيارة"], ["moto", "دراجة نارية"]] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => {
                      const m = makesFor(k)[0];
                      set({ kind: k, make: m, model: modelsFor(m)[0] ?? "" });
                    }}
                    aria-pressed={d.kind === k}
                    className="rounded-lg py-3 text-sm font-bold transition"
                    style={{
                      background: d.kind === k ? "var(--accent)" : "var(--bg-inset)",
                      color: d.kind === k ? "var(--accent-ink)" : "var(--text-muted)",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="sw-make">الماركة</label>
                  <select id="sw-make" className="field" value={d.make}
                    onChange={(e) => set({ make: e.target.value, model: modelsFor(e.target.value)[0] ?? "" })}>
                    {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="sw-model">الموديل</label>
                  <select id="sw-model" className="field" value={d.model} onChange={(e) => set({ model: e.target.value })}>
                    {models.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="sw-version">النسخة / المحرك</label>
                <input id="sw-version" className="field" value={d.version}
                  onChange={(e) => set({ version: e.target.value })} placeholder="مثلاً: 1.5 dCi Ambiance" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="sw-year">
                    السنة: <span className="num" style={{ color: "var(--accent)" }}>{d.year}</span>
                  </label>
                  <input id="sw-year" type="range" min={2000} max={2026} value={d.year}
                    onChange={(e) => set({ year: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
                </div>
                <div>
                  <label className="label" htmlFor="sw-km">
                    الكيلومتراج: <span className="num" style={{ color: "var(--accent)" }}>{formatNumber(d.km)}</span>
                  </label>
                  <input id="sw-km" type="range" min={0} max={d.kind === "moto" ? 120000 : 350000}
                    step={d.kind === "moto" ? 1000 : 5000} value={d.km}
                    onChange={(e) => set({ km: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="sw-fuel">الوقود</label>
                  <select id="sw-fuel" className="field" value={d.fuel} onChange={(e) => set({ fuel: e.target.value })}>
                    <option value="diesel">ديزل</option>
                    <option value="essence">بنزين</option>
                    <option value="hybride">هجين</option>
                    <option value="electrique">كهربائي</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="sw-gb">الناقل</label>
                  <select id="sw-gb" className="field" value={d.gearbox} onChange={(e) => set({ gearbox: e.target.value })}>
                    <option value="manuelle">يدوية</option>
                    <option value="automatique">أوتوماتيك</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="sw-city">المدينة</label>
                  <select id="sw-city" className="field" value={d.city} onChange={(e) => set({ city: e.target.value })}>
                    {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.ar}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ---------- 2 ---------- */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold">الحالة والوثائق</h2>
              <div>
                <span className="label">الحالة العامة</span>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {(["excellent", "tres-bon", "bon", "moyen"] as Condition[]).map((c) => (
                    <button key={c} onClick={() => set({ condition: c })} aria-pressed={d.condition === c}
                      className="rounded-lg py-2 text-xs font-bold transition"
                      style={{
                        background: d.condition === c ? "var(--accent)" : "var(--bg-inset)",
                        color: d.condition === c ? "var(--accent-ink)" : "var(--text-muted)",
                      }}>
                      {{ excellent: "ممتازة", "tres-bon": "جيدة جداً", bon: "جيدة", moyen: "متوسطة" }[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="sw-owners">
                  عدد الملاّك: <span className="num" style={{ color: "var(--accent)" }}>{d.owners}</span>
                </label>
                <input id="sw-owners" type="range" min={1} max={5} value={d.owners}
                  onChange={(e) => set({ owners: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
              </div>

              <div className="space-y-2">
                {([
                  ["papersOk", "البطاقة الرمادية فسميتي والوثائق كاملة", "+8 نقط"],
                  ["vinChecked", "موافق على التحقق من رقم الهيكل (VIN)", "+6 نقط"],
                  ["technicalControlValid", "الفحص التقني صالح", "+6 نقط"],
                  ["serviceBook", "عندي دفتر الصيانة بالفواتير", "+7 نقط"],
                  ["accident", "المركبة دازت من شي حادث مصرّح به", "شفافية"],
                  ["inspected", "بغيت فحص طريق المستقل (250 د.م)", "+10 نقط"],
                ] as const).map(([key, label, gain]) => (
                  <label key={key} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2.5"
                    style={{ background: "var(--bg-inset)" }}>
                    <input type="checkbox" checked={Boolean(d[key])}
                      onChange={(e) => set({ [key]: e.target.checked } as Partial<Draft>)}
                      className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
                    <span className="flex-1 text-xs">{label}</span>
                    <span className="num text-[10px] font-bold" style={{ color: "var(--color-atlas-400)" }}>{gain}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ---------- 3 ---------- */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold">الصور والوصف</h2>
              <div>
                <label className="label" htmlFor="sw-photos">
                  عدد الصور: <span className="num" style={{ color: "var(--accent)" }}>{d.photos}</span>
                </label>
                <input id="sw-photos" type="range" min={1} max={20} value={d.photos}
                  onChange={(e) => set({ photos: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  الإعلانات ب<span className="num">12</span> صورة فما فوق كتوصل ضعف الاتصالات.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2.5" style={{ background: "var(--bg-inset)" }}>
                <input type="checkbox" checked={d.hasVideo} onChange={(e) => set({ hasVideo: e.target.checked })}
                  className="h-4 w-4 accent-[var(--accent)]" />
                <span className="flex-1 text-xs">غادي نزيد فيديو قصير (المحرك + جولة حول المركبة)</span>
                <span className="num text-[10px] font-bold" style={{ color: "var(--color-atlas-400)" }}>+4</span>
              </label>

              <div>
                <label className="label" htmlFor="sw-desc">
                  الوصف <span className="num opacity-60">({d.description.length} حرف)</span>
                </label>
                <textarea id="sw-desc" className="field min-h-32" value={d.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="عاود لينا على المركبة: الصيانة، شنو تبدل، واش كاين شي حاجة خاصها إصلاح…" />
              </div>

              <div>
                <span className="label">التجهيزات ({d.equipment.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {EQUIPMENT.map((e) => {
                    const on = d.equipment.includes(e);
                    return (
                      <button key={e} onClick={() => set({
                        equipment: on ? d.equipment.filter((x) => x !== e) : [...d.equipment, e],
                      })} aria-pressed={on} className="chip transition"
                        style={{
                          background: on ? "var(--accent)" : "var(--bg-inset)",
                          color: on ? "var(--accent-ink)" : "var(--text-muted)",
                          borderColor: "transparent",
                        }}>
                        {on ? "✓ " : "+ "}{e}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ---------- 4 ---------- */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold">الثمن</h2>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-inset)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>الثمن المقترح من السوق</p>
                <p className="num mt-1 text-2xl font-black" style={{ color: "var(--accent)" }}>
                  {formatNumber(estimate.mid)} د.م
                </p>
                <p className="num mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  المجال: {formatNumber(estimate.low)} — {formatNumber(estimate.high)} د.م
                </p>
              </div>

              <div>
                <label className="label" htmlFor="sw-price">الثمن ديالك (درهم)</label>
                <input id="sw-price" type="number" step="1000" className="field num text-lg font-bold"
                  value={d.price} onChange={(e) => set({ price: Number(e.target.value) || 0 })} />
                <input type="range" min={Math.round(estimate.low * 0.6)} max={Math.round(estimate.high * 1.5)}
                  step={1000} value={d.price} onChange={(e) => set({ price: Number(e.target.value) })}
                  className="mt-3 w-full accent-[var(--accent)]" aria-label="مؤشر الثمن" />
              </div>

              <div className="rounded-lg p-3 text-xs leading-relaxed"
                style={{
                  background: `color-mix(in oklab, ${
                    Math.abs(priceDelta) < 0.05
                      ? "var(--color-atlas-500)"
                      : priceDelta > 0.14
                        ? "var(--color-clay-500)"
                        : "var(--color-saffron-500)"
                  } 14%, transparent)`,
                }}>
                {Math.abs(priceDelta) < 0.05 ? (
                  <>✓ ثمنك فالمجال ديال السوق. الإعلانات المسعّرة بشكل عادل كتباع أسرع بـ<span className="num">40٪</span>.</>
                ) : priceDelta > 0.14 ? (
                  <>⚠ ثمنك أعلى بـ<span className="num">{Math.round(priceDelta * 100)}٪</span> من المرجع.
                    كيمكن يبقى الإعلان مدة طويلة بلا اتصالات. جرّب تقرّبو من{" "}
                    <b className="num">{formatNumber(estimate.high)} د.م</b>.</>
                ) : priceDelta < -0.14 ? (
                  <>ℹ ثمنك أقل بكثير من السوق. غادي تبيع بسرعة، ولكن ممكن تخسر{" "}
                    <b className="num">{formatNumber(estimate.mid - d.price)} د.م</b>.</>
                ) : (
                  <>الثمن قريب من السوق مع فارق <span className="num">{Math.round(Math.abs(priceDelta) * 100)}٪</span>.</>
                )}
              </div>
            </div>
          )}

          {/* ---------- 5 ---------- */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold">معلوماتك</h2>
              <div>
                <label className="label" htmlFor="sw-name">الاسم أو اسم المحل</label>
                <input id="sw-name" className="field" value={d.sellerName}
                  onChange={(e) => set({ sellerName: e.target.value })} placeholder="مثلاً: منير ب." />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {([["particulier", "خاص"], ["professionnel", "محترف"]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => set({ sellerType: k })} aria-pressed={d.sellerType === k}
                    className="rounded-lg py-2 text-xs font-bold transition"
                    style={{
                      background: d.sellerType === k ? "var(--accent)" : "var(--bg-inset)",
                      color: d.sellerType === k ? "var(--accent-ink)" : "var(--text-muted)",
                    }}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {([
                  ["phoneVerified", "تأكيد رقم الهاتف عبر SMS", "+4"],
                  ["idVerified", "توثيق الهوية بالبطاقة الوطنية", "+8"],
                ] as const).map(([key, label, gain]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2.5"
                    style={{ background: "var(--bg-inset)" }}>
                    <input type="checkbox" checked={Boolean(d[key])}
                      onChange={(e) => set({ [key]: e.target.checked } as Partial<Draft>)}
                      className="h-4 w-4 accent-[var(--accent)]" />
                    <span className="flex-1 text-xs">{label}</span>
                    <span className="num text-[10px] font-bold" style={{ color: "var(--color-atlas-400)" }}>{gain}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-xl p-4" style={{ background: "var(--bg-inset)" }}>
                <h3 className="text-xs font-extrabold">ملخص الإعلان</h3>
                <p className="mt-2 text-sm font-bold">
                  {d.make} {d.model} {d.version} <span className="num">{d.year}</span>
                </p>
                <p className="num mt-1 text-lg font-black" style={{ color: "var(--accent)" }}>
                  {formatNumber(d.price)} د.م
                </p>
                <p className="num mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  {formatNumber(d.km)} كم · {d.photos} صور · مؤشر ثقة {trust.score}/100
                </p>
              </div>

              <button onClick={() => setPublished(true)} className="btn btn-primary w-full">
                انشر الإعلان مجاناً
              </button>
            </div>
          )}

          {/* التنقل */}
          <div className="mt-6 flex justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--line-soft)" }}>
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              className="btn btn-ghost btn-sm disabled:opacity-40">السابق</button>
            {step < STEPS.length - 1 && (
              <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="btn btn-primary btn-sm">
                التالي
              </button>
            )}
          </div>
        </div>
      </div>

      {/* الشريط الجانبي الحي */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
        <div className="card p-5 text-center">
          <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            مؤشر الثقة ديال إعلانك
          </p>
          <div className="mt-3 flex justify-center">
            <TrustRing score={trust.score} grade={trust.grade} size={96} stroke={7} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            كل ما رفعتي هاد النقطة، كل ما بان إعلانك أكثر وجاتك اتصالات جدية بزاف.
          </p>
        </div>

        <div className="card p-5">
          <h3 className="text-xs font-extrabold">كيفاش ترفع النقطة</h3>
          <ul className="mt-3 space-y-2">
            {tips.map((t) => (
              <li key={t.text} className="flex items-start gap-2 text-[11px]">
                <span style={{ color: t.done ? "var(--color-atlas-400)" : "var(--text-dim)" }}>
                  {t.done ? "✓" : "○"}
                </span>
                <span className="flex-1" style={{
                  color: t.done ? "var(--text-dim)" : "var(--text-muted)",
                  textDecoration: t.done ? "line-through" : undefined,
                }}>
                  {t.text}
                </span>
                {!t.done && (
                  <span className="num shrink-0 font-bold" style={{ color: "var(--color-atlas-400)" }}>
                    +{t.gain}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
