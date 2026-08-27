"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { paramsFromFilters, type Filters } from "@/lib/search";
import { fairPriceOf, trustOf } from "@/lib/market";
import { computeTco } from "@/lib/tco";
import { CITIES } from "@/lib/cities";
import { formatNumber } from "@/lib/format";
import { VehicleCard } from "@/components/VehicleCard";
import type { Vehicle } from "@/lib/types";
import {
  ArrowLeft, ArrowRight, Car, Check, Coins, Fuel, MapPin, Moto, Reset,
  Road, Search, Sparkle, Users, Wallet,
} from "@/components/icons";

type Use = "ville" | "route" | "famille" | "travail" | "plaisir";

interface Answers {
  kind: "car" | "moto";
  budget: number;
  city: string;
  seats: number;
  use: Use;
  kmPerYear: number;
}

const USES: { value: Use; label: string; hint: string; Icon: typeof Car }[] = [
  { value: "ville", label: "المدينة أساساً", hint: "طلوع ونزول، ركن ضيّق", Icon: MapPin },
  { value: "route", label: "الطريق السيار", hint: "تنقلات طويلة كل أسبوع", Icon: Road },
  { value: "famille", label: "العائلة", hint: "دراري، أمتعة، سفر", Icon: Users },
  { value: "travail", label: "الخدمة", hint: "نقل معدات ولا بضاعة", Icon: Wallet },
  { value: "plaisir", label: "المتعة", hint: "بغيت شي حاجة كتفرح", Icon: Sparkle },
];

const BUDGETS = [40000, 70000, 100000, 150000, 220000, 350000];
const MOTO_BUDGETS = [12000, 25000, 45000, 70000, 110000, 180000];

/** تحويل الأجوبة لفلاتر حقيقية */
function toFilters(a: Answers): Partial<Filters> {
  const f: Partial<Filters> = {
    kind: a.kind,
    city: a.city || "",
    priceMax: a.budget,
    sort: "deal",
  };
  if (a.kind === "car") {
    if (a.use === "famille") f.body = a.seats >= 6 ? "utilitaire" : "suv";
    else if (a.use === "ville") f.body = "citadine";
    else if (a.use === "route") f.fuel = "diesel";
    else if (a.use === "travail") f.body = "utilitaire";
    if (a.kmPerYear >= 25000) f.fuel = "diesel";
    if (a.kmPerYear <= 8000 && a.use === "ville") f.fuel = "essence";
  } else {
    if (a.use === "ville") f.body = "scooter";
    else if (a.use === "route") f.body = "trail";
    else if (a.use === "plaisir") f.body = "sportive";
  }
  return f;
}

/** لماذا اقترحنا هذه المركبة */
function reasons(v: Vehicle, a: Answers): string[] {
  const out: string[] = [];
  const fp = fairPriceOf(v);
  const t = trustOf(v);
  const tco = computeTco(v, {
    kmPerYear: a.kmPerYear,
    years: 3,
    coverage: "tiers",
    includeDepreciation: false,
  });
  if (fp.delta < -0.06) out.push(`تحت الثمن المرجعي بـ${Math.round(Math.abs(fp.delta) * 100)}٪`);
  if (t.score >= 75) out.push(`نقطة ثقة ${t.score}/100`);
  if (v.inspected) out.push("مفحوصة من طرف طريق");
  if (v.firstHand) out.push("يد أولى");
  out.push(`~${formatNumber(tco.perYear)} د.م تكلفة السنة`);
  if (a.city && v.city === a.city) out.push("فنفس المدينة ديالك");
  return out.slice(0, 4);
}

const STEP_TITLES = ["نوع المركبة", "الميزانية", "المدينة", "الاستعمال", "الكيلومترات"];

export function AssistantClient() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({
    kind: "car", budget: 100000, city: "", seats: 5, use: "ville", kmPerYear: 15000,
  });
  const set = (patch: Partial<Answers>) => setA((p) => ({ ...p, ...patch }));
  const done = step >= STEP_TITLES.length;

  const [results, setResults] = useState<Vehicle[]>([]);

  /* النتائج كتجي من قاعدة البيانات. إلا كانو قليلين كنوسّعو
     المعايير على مراحل — نوع الهيكل أولاً، ومن بعد المدينة
     والوقود — بدل ما نرجعو للمستخدم بلا والو. */
  useEffect(() => {
    if (!done) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const f = toFilters(a);
    const tries: Partial<Filters>[] = [
      f,
      { ...f, body: "" },
      { ...f, body: "", city: "", fuel: "" },
    ];

    (async () => {
      for (const filters of tries) {
        const qs = paramsFromFilters(filters);
        qs.set("limit", "6");
        try {
          const res = await fetch(`/api/listings?${qs.toString()}`, { signal: ctrl.signal });
          const json = await res.json();
          const items = json?.ok ? (json.data.items as Vehicle[]) : [];
          if (items.length >= 3 || filters === tries[tries.length - 1]) {
            setResults(items);
            return;
          }
        } catch {
          return;
        }
      }
    })();

    return () => ctrl.abort();
  }, [a, done]);

  const budgets = a.kind === "car" ? BUDGETS : MOTO_BUDGETS;

  if (done) {
    const href = `/search?${paramsFromFilters(toFilters(a)).toString()}`;
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <header className="mb-8 max-w-2xl">
          <span className="eyebrow"><Sparkle size={13} /> النتيجة</span>
          <h1 className="h-page mt-4">
            {results.length > 0 ? "هاذي المركبات اللي كتناسبك" : "ماكلقيناش مطابقة دقيقة"}
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {results.length > 0 ? (
              <>
                مرتّبة حسب أحسن صفقة داخل ميزانية{" "}
                <b className="num">{formatNumber(a.budget)}</b> د.م. تحت كل مركبة كتلقى
                علاش اقترحناها عليك بالضبط.
              </>
            ) : (
              <>جرّب ترفع الميزانية شوية ولا تحيّد قيد المدينة.</>
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => setStep(0)} className="btn btn-ghost btn-sm">
              <Reset size={14} /> بدّل الأجوبة
            </button>
            <Link href={href} className="btn btn-primary btn-sm">
              <Search size={14} /> شوف كل النتائج المطابقة
            </Link>
          </div>
        </header>

        {results.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((v) => (
              <div key={v.id} className="flex min-w-0 flex-col gap-2">
                <VehicleCard v={v} />
                <ul className="flex flex-wrap gap-1.5 px-1">
                  {reasons(v, a).map((r) => (
                    <li key={r} className="chip chip-plain text-[10.5px]">
                      <Check size={10} style={{ color: "var(--good)" }} /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <header className="mb-7">
        <span className="eyebrow"><Sparkle size={13} /> مساعد الاختيار</span>
        <h1 className="h-page mt-4">مامعرفتيش شنو تشري؟</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          جاوب على <span className="num">5</span> أسئلة بسيطة، ونقترحو عليك مركبات
          حقيقية من السوق مع سبب واضح لكل اقتراح.
        </p>
      </header>

      {/* شريط التقدم */}
      <div className="mb-7 flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5}>
        {STEP_TITLES.map((t, i) => (
          <div key={t} className="min-w-0 flex-1">
            <div
              className="h-1.5 rounded-full transition-colors"
              style={{ background: i <= step ? "var(--brand)" : "var(--surface-3)" }}
            />
            <span
              className="mt-1.5 block truncate text-[10px] font-bold"
              style={{ color: i <= step ? "var(--brand)" : "var(--text-dim)" }}
            >
              {t}
            </span>
          </div>
        ))}
      </div>

      <div className="card p-6">
        {step === 0 && (
          <Q title="واش سيارة ولا دراجة؟">
            <div className="grid grid-cols-2 gap-3">
              {([["car", "سيارة", Car], ["moto", "دراجة نارية", Moto]] as const).map(([k, label, Icon]) => (
                <Pick key={k} on={a.kind === k} onClick={() => set({ kind: k, budget: k === "car" ? 100000 : 25000 })}>
                  <Icon size={26} />
                  <span className="mt-2 text-sm font-bold">{label}</span>
                </Pick>
              ))}
            </div>
          </Q>
        )}

        {step === 1 && (
          <Q title="شحال الميزانية ديالك؟" hint="الحد الأقصى اللي مستعد تخلّص">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {budgets.map((b) => (
                <Pick key={b} on={a.budget === b} onClick={() => set({ budget: b })}>
                  <span className="num text-base font-extrabold">{formatNumber(b)}</span>
                  <span className="text-[10.5px]" style={{ color: "var(--text-dim)" }}>درهم وأقل</span>
                </Pick>
              ))}
            </div>
          </Q>
        )}

        {step === 2 && (
          <Q title="فينا مدينة كتسكن؟" hint="باش نقربو عليك المركبات">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => set({ city: "" })}
                className="chip"
                style={a.city === "" ? { background: "var(--brand)", color: "#fff", borderColor: "transparent" } : undefined}
              >
                كل المغرب
              </button>
              {CITIES.slice(0, 14).map((c) => (
                <button
                  key={c.slug}
                  onClick={() => set({ city: c.slug })}
                  className="chip"
                  style={a.city === c.slug ? { background: "var(--brand)", color: "#fff", borderColor: "transparent" } : undefined}
                >
                  {c.ar}
                </button>
              ))}
            </div>
          </Q>
        )}

        {step === 3 && (
          <Q title="غادي تستعملها فاش أساساً؟">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {USES.map((u) => (
                <Pick key={u.value} on={a.use === u.value} onClick={() => set({ use: u.value })} row>
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                  >
                    <u.Icon size={17} />
                  </span>
                  <span className="min-w-0 text-right">
                    <span className="block text-[13px] font-bold">{u.label}</span>
                    <span className="block text-[11px]" style={{ color: "var(--text-dim)" }}>{u.hint}</span>
                  </span>
                </Pick>
              ))}
            </div>
            {a.kind === "car" && a.use === "famille" && (
              <div className="mt-4">
                <span className="label mb-2 block">شحال من شخص عادةً؟</span>
                <div className="flex gap-2">
                  {[4, 5, 7].map((n) => (
                    <button
                      key={n}
                      onClick={() => set({ seats: n })}
                      className="chip num"
                      style={a.seats === n ? { background: "var(--brand)", color: "#fff", borderColor: "transparent" } : undefined}
                    >
                      {n === 7 ? "6 ولا أكثر" : n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Q>
        )}

        {step === 4 && (
          <Q title="شحال كتمشي فالعام؟" hint="هادشي كيحدّد واش گازوال ولا بنزين">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { v: 6000, l: "قليل", h: "أقل من 8 آلاف كم" },
                { v: 15000, l: "عادي", h: "10 ـ 20 ألف كم" },
                { v: 28000, l: "بزاف", h: "20 ـ 35 ألف كم" },
                { v: 45000, l: "كثير جداً", h: "فوق 35 ألف كم" },
              ].map((o) => (
                <Pick key={o.v} on={a.kmPerYear === o.v} onClick={() => set({ kmPerYear: o.v })}>
                  <span className="text-[13px] font-bold">{o.l}</span>
                  <span className="mt-0.5 text-[10px]" style={{ color: "var(--text-dim)" }}>{o.h}</span>
                </Pick>
              ))}
            </div>
            <p
              className="mt-4 flex items-start gap-2 rounded-xl p-3 text-[11.5px] leading-relaxed"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
            >
              <Fuel size={14} className="mt-px shrink-0" style={{ color: "var(--brand)" }} />
              قاعدة عملية فالمغرب: فوق <span className="num">20</span> ألف كم فالعام الگازوال كيربح،
              وتحت <span className="num">10</span> آلاف كم البنزين أرخص فالصيانة والتأمين.
            </p>
          </Q>
        )}

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn btn-ghost btn-sm"
          >
            <ArrowRight size={14} /> رجع
          </button>
          <button onClick={() => setStep((s) => s + 1)} className="btn btn-primary">
            {step === STEP_TITLES.length - 1 ? (
              <><Coins size={16} /> شوف الاقتراحات</>
            ) : (
              <>التالي <ArrowLeft size={15} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Q({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      {hint && <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-dim)" }}>{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Pick({
  on, onClick, children, row = false,
}: { on: boolean; onClick: () => void; children: React.ReactNode; row?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex rounded-xl border p-4 transition-all ${
        row ? "items-center gap-3" : "flex-col items-center justify-center text-center"
      }`}
      style={{
        borderColor: on ? "var(--brand)" : "var(--line)",
        background: on ? "var(--brand-soft)" : "transparent",
        color: on ? "var(--brand)" : "var(--text)",
        boxShadow: on ? "0 0 0 1px var(--brand)" : undefined,
      }}
    >
      {children}
    </button>
  );
}
