"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trustScore } from "@/lib/market";
import { useEstimate } from "@/hooks/useEstimate";
import { useCatalog } from "@/lib/useCatalog";
import { PhotoUploader, type UploadedPhoto } from "@/components/sell/PhotoUploader";
import { VideoUploader, type UploadedVideo } from "@/components/sell/VideoUploader";
import { CITIES, cityName } from "@/lib/cities";
import { EQUIPMENT } from "@/lib/equipment";
import { AR, formatNumber } from "@/lib/format";
import { TrustRing } from "@/components/TrustBadge";
import { VehicleGlyph } from "@/components/VehicleArt";
import {
  CAR_BODIES, COMMON_COLORS, DOOR_OPTIONS, DRIVETRAINS, MOTO_BODIES, ORIGINS,
} from "@/lib/vehicle-options";
import {
  AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Bookmark, Calendar,
  Car, Check, CircleDot, Coins, Door, FileText, Gauge, Horsepower, Info,
  MapPin, Moto, Palette, Sparkle, Plus, TrendingDown, Wrench,
} from "@/components/icons";
import type { Body, Condition, Drivetrain, Origin, Seller, Vehicle } from "@/lib/types";

const STEPS = ["المركبة", "الحالة والوثائق", "الصور والوصف", "الثمن", "المعاينة والنشر"];

interface Draft {
  kind: "car" | "moto";
  make: string;
  model: string;
  version: string;
  year: number;
  km: number;
  fuel: string;
  gearbox: string;
  body: Body;
  color: string;
  doors: number;
  fiscalPower: number;
  drivetrain: Drivetrain | "";
  origin: Origin | "";
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
  negotiable: boolean;
  sellerName: string;
  sellerType: "particulier" | "professionnel";
  idVerified: boolean;
  phoneVerified: boolean;
}

const initialDraft: Draft = {
  kind: "car",
  make: "Dacia",
  model: "Logan",
  version: "1.5 dCi",
  year: 2018,
  km: 120000,
  fuel: "diesel",
  gearbox: "manuelle",
  body: "berline",
  color: "أبيض",
  doors: 5,
  fiscalPower: 6,
  drivetrain: "",
  origin: "",
  city: "casablanca",
  condition: "tres-bon",
  owners: 1,
  papersOk: true,
  vinChecked: false,
  serviceBook: false,
  technicalControlValid: true,
  accident: false,
  photos: 0,
  hasVideo: false,
  description: "",
  equipment: ["مكيف الهواء", "نظام ABS"],
  inspected: false,
  price: 120000,
  negotiable: true,
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
    body: d.body,
    fiscalPower: d.fiscalPower,
    consumption: d.kind === "moto" ? 3 : 5,
    doors: d.kind === "car" ? d.doors : undefined,
    color: d.color,
    drivetrain: d.drivetrain || undefined,
    origin: d.origin || undefined,
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
    updatedAt: "2026-08-24T10:00:00Z",
    views: 0,
    saves: 0,
    priceDrops: [],
    priceHistory: [],
    negotiable: d.negotiable,
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

const DRAFT_KEY = "triq:draft";

export function SellWizard() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(initialDraft);
  const [published, setPublished] = useState(false);
  /* نتيجة النشر الحقيقية: الرابط ديال الإعلان، ولا رسالة الخطأ */
  const [publishing, setPublishing] = useState(false);
  const [publishedHref, setPublishedHref] = useState("");
  const [publishError, setPublishError] = useState("");
  /* الصور المرفوعة — كتّربط بالإعلان ملي يتنشر */
  const [uploaded, setUploaded] = useState<UploadedPhoto[]>([]);
  const [video, setVideo] = useState<UploadedVideo | null>(null);
  /** حالة المسودة: idle | saved | restored */
  const [draftState, setDraftState] = useState<"idle" | "saved" | "restored">("idle");
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    try {
      setHasDraft(Boolean(localStorage.getItem(DRAFT_KEY)));
    } catch {
      /* التخزين ممنوع */
    }
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ d, step }));
      setHasDraft(true);
      setDraftState("saved");
      setTimeout(() => setDraftState("idle"), 2400);
    } catch {
      /* التخزين ممنوع */
    }
  };

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { d: Draft; step: number };
      setD({ ...initialDraft, ...saved.d });
      setStep(Math.min(STEPS.length - 1, Math.max(0, saved.step ?? 0)));
      setDraftState("restored");
      setTimeout(() => setDraftState("idle"), 2400);
    } catch {
      /* مسودة تالفة */
    }
  };

  const dropDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
    } catch {
      /* التخزين ممنوع */
    }
  };

  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  /* الماركات والموديلات كيجيو من قاعدة البيانات */
  const { makesFor, modelsFor } = useCatalog();
  const makes = useMemo(() => makesFor(d.kind), [makesFor, d.kind]);
  const models = useMemo(() => modelsFor(d.make), [modelsFor, d.make]);

  const { estimate } = useEstimate({
    kind: d.kind,
    make: d.make,
    model: d.model,
    year: d.year,
    km: d.km,
    fuel: d.fuel,
    gearbox: d.gearbox,
    condition: d.condition,
  });

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

  /** كيبعت الإعلان للخادم وكيسجّلو فقاعدة البيانات */
  async function publish() {
    setPublishing(true);
    setPublishError("");
    try {
      const res = await fetch("/api/listings/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: d.kind, make: d.make, model: d.model, version: d.version,
          year: d.year, km: d.km, price: d.price, owners: d.owners,
          fuel: d.fuel, gearbox: d.gearbox, body: d.body,
          color: d.color, fiscalPower: d.fiscalPower,
          doors: d.kind === "car" ? d.doors : undefined,
          drivetrain: d.drivetrain || undefined, origin: d.origin || undefined,
          city: d.city, condition: d.condition,
          papersOk: d.papersOk, technicalControlValid: d.technicalControlValid,
          inspected: d.inspected, serviceBook: d.serviceBook,
          vinChecked: d.vinChecked, description: d.description,
          equipment: d.equipment, photos: d.photos, hasVideo: d.hasVideo,
          negotiable: d.negotiable,
          media: video ? [...uploaded, video] : uploaded,
        }),
      });
      const json = await res.json();
      if (!json?.ok) {
        setPublishError(
          res.status === 401
            ? "خاصك تسجّل الدخول باش تنشر إعلان."
            : json?.error ?? "ماقدرناش ننشرو الإعلان. عاود المحاولة.",
        );
        return;
      }
      setPublishedHref(`/vehicle/${json.data.slug}`);
      dropDraft();
      setPublished(true);
    } catch {
      setPublishError("الشبكة قاطعة. عاود المحاولة.");
    } finally {
      setPublishing(false);
    }
  }

  if (published) {
    return (
      <div className="card-raised zellige relative overflow-hidden p-12 text-center">
        <div className="glow pointer-events-none absolute inset-0" />
        <div className="relative">
          <span
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl"
            style={{ background: "var(--good-soft)", color: "var(--good)" }}
          >
            <BadgeCheck size={32} />
          </span>
          <h2 className="h-section mt-5">تنشر إعلانك!</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {d.make} {d.model} {d.year} بثمن <span className="num">{formatNumber(d.price)}</span> د.م، بمؤشر ثقة{" "}
            <b className="num">{trust.score}/100</b>. الإعلانات اللي نقطتها فوق{" "}
            <span className="num">75</span> كتباع بسرعة أكبر بـ<span className="num">3</span> مرات.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setPublished(false);
                setPublishedHref("");
                setStep(0);
                setD(initialDraft);
                setUploaded([]);
              }}
              className="btn btn-ghost"
            >
              إعلان جديد
            </button>
            {publishedHref && (
              <Link href={publishedHref} className="btn btn-primary">شوف الإعلان ديالك</Link>
            )}
            <Link href="/dashboard/listings" className="btn btn-ghost">إعلاناتي</Link>
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
                className="w-full text-start"
                aria-current={step === i}
              >
                <div
                  className="h-1 rounded-full transition-all"
                  style={{ background: i <= step ? "var(--brand)" : "var(--surface-3)" }}
                />
                <span
                  className="mt-1.5 block text-[10px] font-bold"
                  style={{ color: i <= step ? "var(--brand)" : "var(--text-dim)" }}
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
                {([["car", "سيارة", Car], ["moto", "دراجة نارية", Moto]] as const).map(([k, l, I]) => (
                  <button
                    key={k}
                    onClick={() => {
                      const m = makesFor(k)[0];
                      set({
                        kind: k, make: m, model: modelsFor(m)[0] ?? "",
                        body: k === "moto" ? "roadster" : "berline",
                        fiscalPower: k === "moto" ? 2 : 6,
                        drivetrain: "",
                      });
                    }}
                    aria-pressed={d.kind === k}
                    className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition"
                    style={{
                      background: d.kind === k ? "var(--brand)" : "var(--surface-3)",
                      color: d.kind === k ? "var(--brand-ink)" : "var(--text-muted)",
                    }}
                  >
                    <I size={18} /> {l}
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
                    <Calendar size={13} /> السنة
                    <span className="num me-auto" style={{ color: "var(--brand)" }}>{d.year}</span>
                  </label>
                  <input id="sw-year" type="range" min={2000} max={2026} value={d.year}
                    onChange={(e) => set({ year: Number(e.target.value) })} className="w-full " />
                </div>
                <div>
                  <label className="label" htmlFor="sw-km">
                    <Gauge size={13} /> الكيلومتراج
                    <span className="num me-auto" style={{ color: "var(--brand)" }}>{formatNumber(d.km)}</span>
                  </label>
                  <input id="sw-km" type="range" min={0} max={d.kind === "moto" ? 120000 : 350000}
                    step={d.kind === "moto" ? 1000 : 5000} value={d.km}
                    onChange={(e) => set({ km: Number(e.target.value) })} className="w-full " />
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
                  <label className="label" htmlFor="sw-city"><MapPin size={13} /> المدينة</label>
                  <select id="sw-city" className="field" value={d.city} onChange={(e) => set({ city: e.target.value })}>
                    {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.ar}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <span className="label"><Car size={13} /> نوع الهيكل</span>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                  {(d.kind === "moto" ? MOTO_BODIES : CAR_BODIES).map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => set({ body: b.value as Body })}
                      aria-pressed={d.body === b.value}
                      className="flex flex-col items-center gap-1 rounded-lg border py-2.5 text-[10.5px] font-bold transition"
                      style={{
                        borderColor: d.body === b.value ? "var(--brand)" : "var(--line)",
                        background: d.body === b.value ? "var(--brand-soft)" : "var(--surface-1)",
                        color: d.body === b.value ? "var(--brand)" : "var(--text)",
                      }}
                    >
                      <VehicleGlyph shape={b.value as never} kind={d.kind} size={22} strokeWidth={10} />
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="sw-color"><Palette size={13} /> اللون</label>
                  <input
                    id="sw-color" className="field" list="sw-colors" maxLength={40}
                    value={d.color} onChange={(e) => set({ color: e.target.value })}
                  />
                  <datalist id="sw-colors">
                    {COMMON_COLORS.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                {d.kind === "car" && (
                  <div>
                    <span className="label"><Door size={13} /> عدد الأبواب</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {DOOR_OPTIONS.map((n) => (
                        <button
                          key={n} type="button" onClick={() => set({ doors: n })}
                          aria-pressed={d.doors === n}
                          className="rounded-lg py-2 text-xs font-bold transition"
                          style={{
                            background: d.doors === n ? "var(--brand)" : "var(--surface-3)",
                            color: d.doors === n ? "var(--brand-ink)" : "var(--text-muted)",
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="label" htmlFor="sw-power">
                    <Horsepower size={13} /> القوة الجبائية
                    <span className="num me-auto" style={{ color: "var(--brand)" }}>{d.fiscalPower} حصان</span>
                  </label>
                  <input
                    id="sw-power" type="range" min={1} max={d.kind === "moto" ? 6 : 30} value={d.fiscalPower}
                    onChange={(e) => set({ fiscalPower: Number(e.target.value) })} className="w-full"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {d.kind === "car" && (
                  <div>
                    <label className="label" htmlFor="sw-drivetrain">الدفع (اختياري)</label>
                    <select
                      id="sw-drivetrain" className="field" value={d.drivetrain}
                      onChange={(e) => set({ drivetrain: e.target.value as Drivetrain | "" })}
                    >
                      <option value="">ماشي معروف</option>
                      {DRIVETRAINS.map((dr) => <option key={dr.value} value={dr.value}>{dr.label}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="label" htmlFor="sw-origin">مصدر السيارة (اختياري)</label>
                  <select
                    id="sw-origin" className="field" value={d.origin}
                    onChange={(e) => set({ origin: e.target.value as Origin | "" })}
                  >
                    <option value="">ماشي معروف</option>
                    {ORIGINS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
                        background: d.condition === c ? "var(--brand)" : "var(--surface-3)",
                        color: d.condition === c ? "var(--brand-ink)" : "var(--text-muted)",
                      }}>
                      {{ excellent: "ممتازة", "tres-bon": "جيدة جداً", bon: "جيدة", moyen: "متوسطة" }[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="sw-owners">
                  عدد الملاّك
                  <span className="num me-auto" style={{ color: "var(--brand)" }}>{d.owners}</span>
                </label>
                <input id="sw-owners" type="range" min={1} max={5} value={d.owners}
                  onChange={(e) => set({ owners: Number(e.target.value) })} className="w-full " />
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
                    style={{ background: "var(--surface-3)" }}>
                    <input type="checkbox" checked={Boolean(d[key])}
                      onChange={(e) => set({ [key]: e.target.checked } as Partial<Draft>)}
                      className="mt-0.5 h-4 w-4 " />
                    <span className="flex-1 text-xs">{label}</span>
                    <span className="num text-[10px] font-bold" style={{ color: "var(--good)" }}>{gain}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ---------- 3 ---------- */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold">الصور والوصف</h2>
              <PhotoUploader
                photos={uploaded}
                onChange={(next) => {
                  setUploaded(next);
                  // عدد الصور فمؤشر الثقة كيتبع الصور الحقيقية
                  set({ photos: next.length });
                }}
              />

              <VideoUploader
                video={video}
                onChange={(next) => {
                  setVideo(next);
                  // مؤشر الثقة كيتبع الفيديو الحقيقي، ماشي وعد بيه
                  set({ hasVideo: Boolean(next) });
                }}
              />

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
                          background: on ? "var(--brand)" : "var(--surface-3)",
                          color: on ? "var(--brand-ink)" : "var(--text-muted)",
                          borderColor: "transparent",
                        }}>
                        {on ? <Check size={11} /> : <Plus size={11} />}{e}
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
              <div className="rounded-xl p-4" style={{ background: "var(--surface-3)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>الثمن المقترح من السوق</p>
                <p className="num mt-1 text-2xl font-black" style={{ color: "var(--brand)" }}>
                  {formatNumber(estimate.mid)} د.م
                </p>
                <p className="num mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  المجال: {formatNumber(estimate.low)} — {formatNumber(estimate.high)} د.م
                </p>
              </div>

              <div>
                <label className="label" htmlFor="sw-price"><Coins size={13} /> الثمن ديالك (درهم)</label>
                <input id="sw-price" type="number" step="1000" className="field num text-lg font-bold"
                  value={d.price} onChange={(e) => set({ price: Number(e.target.value) || 0 })} />
                <input type="range" min={Math.round(estimate.low * 0.6)} max={Math.round(estimate.high * 1.5)}
                  step={1000} value={d.price} onChange={(e) => set({ price: Number(e.target.value) })}
                  className="mt-3 w-full " aria-label="مؤشر الثمن" />
              </div>

              <div className="rounded-lg p-3 text-xs leading-relaxed"
                style={{
                  background: `color-mix(in oklab, ${
                    Math.abs(priceDelta) < 0.05
                      ? "var(--good)"
                      : priceDelta > 0.14
                        ? "var(--bad)"
                        : "var(--brand)"
                  } 14%, transparent)`,
                }}>
                {Math.abs(priceDelta) < 0.05 ? (
                  <><Check size={13} className="inline" /> ثمنك فالمجال ديال السوق. الإعلانات المسعّرة بشكل عادل كتباع أسرع بـ<span className="num">40٪</span>.</>
                ) : priceDelta > 0.14 ? (
                  <><AlertTriangle size={13} className="inline" /> ثمنك أعلى بـ<span className="num">{Math.round(priceDelta * 100)}٪</span> من المرجع.
                    كيمكن يبقى الإعلان مدة طويلة بلا اتصالات. جرّب تقرّبو من{" "}
                    <b className="num">{formatNumber(estimate.high)} د.م</b>.</>
                ) : priceDelta < -0.14 ? (
                  <><Info size={13} className="inline" /> ثمنك أقل بكثير من السوق. غادي تبيع بسرعة، ولكن ممكن تخسر{" "}
                    <b className="num">{formatNumber(estimate.mid - d.price)} د.م</b>.</>
                ) : (
                  <>الثمن قريب من السوق مع فارق <span className="num">{Math.round(Math.abs(priceDelta) * 100)}٪</span>.</>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2.5" style={{ background: "var(--surface-3)" }}>
                <input
                  type="checkbox"
                  checked={d.negotiable}
                  onChange={(e) => set({ negotiable: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="flex-1 text-xs">الثمن قابل للتفاوض</span>
              </label>
            </div>
          )}

          {/* ---------- 5 ---------- */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-extrabold">معاينة الإعلان</h2>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                هكذا غادي يبان الإعلان ديالك للمشترين — تأكد من كلشي قبل النشر.
              </p>

              <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--line)" }}>
                <div className="relative aspect-[16/10]" style={{ background: "var(--surface-3)" }}>
                  {uploaded[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={uploaded[0].thumbUrl ?? uploaded[0].url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs" style={{ color: "var(--text-dim)" }}>
                      بلا صور بعد
                    </div>
                  )}
                  {d.photos > 0 && (
                    <span
                      className="absolute bottom-2 start-2 rounded-md px-2 py-0.5 text-[10px]"
                      style={{ background: "rgba(10,30,61,0.72)", color: "#fff" }}
                    >
                      <span className="num">{d.photos}</span> صور{video ? " · فيديو" : ""}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{d.make} {d.model} {d.version}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                        <MapPin size={11} /> {cityName(d.city)} · <span className="num">{d.year}</span>
                      </p>
                    </div>
                    <TrustRing score={trust.score} grade={trust.grade} size={44} stroke={4} />
                  </div>
                  <p className="num mt-2 text-xl font-black" style={{ color: "var(--brand)" }}>
                    {formatNumber(d.price)} د.م
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="chip chip-plain"><span className="num">{formatNumber(d.km)}</span> كم</span>
                    <span className="chip chip-plain">{AR.fuel[d.fuel as keyof typeof AR.fuel] ?? d.fuel}</span>
                    <span className="chip chip-plain">{AR.gearbox[d.gearbox as keyof typeof AR.gearbox] ?? d.gearbox}</span>
                    {d.negotiable && <span className="chip chip-plain">قابل للتفاوض</span>}
                  </div>
                  {d.description && (
                    <p className="mt-3 text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {d.description.slice(0, 160)}{d.description.length > 160 ? "…" : ""}
                    </p>
                  )}
                  {d.equipment.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {d.equipment.slice(0, 6).map((e) => (
                        <span key={e} className="chip chip-plain">{e}</span>
                      ))}
                      {d.equipment.length > 6 && (
                        <span className="chip chip-plain">+<span className="num">{d.equipment.length - 6}</span></span>
                      )}
                    </div>
                  )}
                </div>
              </div>

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
                      background: d.sellerType === k ? "var(--brand)" : "var(--surface-3)",
                      color: d.sellerType === k ? "var(--brand-ink)" : "var(--text-muted)",
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
                    style={{ background: "var(--surface-3)" }}>
                    <input type="checkbox" checked={Boolean(d[key])}
                      onChange={(e) => set({ [key]: e.target.checked } as Partial<Draft>)}
                      className="h-4 w-4 " />
                    <span className="flex-1 text-xs">{label}</span>
                    <span className="num text-[10px] font-bold" style={{ color: "var(--good)" }}>{gain}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={publish}
                disabled={publishing}
                className="btn btn-primary w-full"
              >
                <Sparkle size={16} /> {publishing ? "كننشرو…" : "انشر الإعلان مجاناً"}
              </button>
              {publishError && (
                <p className="mt-3 text-center text-[12px] font-semibold" style={{ color: "var(--bad)" }}>
                  {publishError}
                </p>
              )}
            </div>
          )}

          {/* التنقل */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "var(--line-soft)" }}>
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              className="btn btn-ghost btn-sm"><ArrowRight size={14} className="dir-flip" /> السابق</button>

            <div className="flex items-center gap-2">
              <button onClick={saveDraft} className="btn btn-solid btn-sm" aria-live="polite">
                {draftState === "saved"
                  ? <><Check size={13} style={{ color: "var(--good)" }} /> تحفظات</>
                  : <><Bookmark size={13} /> احفظ كمسودة</>}
              </button>
              {step < STEPS.length - 1 && (
                <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="btn btn-primary btn-sm">
                  التالي <ArrowLeft size={14} className="dir-flip" />
                </button>
              )}
            </div>
          </div>

          {hasDraft && draftState !== "restored" && (
            <div
              className="mt-3 flex flex-wrap items-center gap-2.5 rounded-xl p-3 text-[11.5px]"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
            >
              <Bookmark size={14} className="shrink-0" style={{ color: "var(--brand)" }} />
              <span className="min-w-0 flex-1">عندك مسودة محفوظة من قبل.</span>
              <button onClick={restoreDraft} className="btn btn-ghost btn-sm">استرجعها</button>
              <button onClick={dropDraft} className="btn btn-ghost btn-sm" style={{ color: "var(--bad)" }}>
                حيّدها
              </button>
            </div>
          )}
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
                <span className="mt-0.5 shrink-0" style={{ color: t.done ? "var(--good)" : "var(--text-dim)" }}>
                  {t.done ? <Check size={13} /> : <CircleDot size={13} />}
                </span>
                <span className="flex-1" style={{
                  color: t.done ? "var(--text-dim)" : "var(--text-muted)",
                  textDecoration: t.done ? "line-through" : undefined,
                }}>
                  {t.text}
                </span>
                {!t.done && (
                  <span className="num shrink-0 font-bold" style={{ color: "var(--good)" }}>
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
