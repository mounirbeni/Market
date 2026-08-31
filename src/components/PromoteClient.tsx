"use client";

import { Link } from "@/components/Link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { PROMOS, PROMO_ORDER, type PromoTier } from "@/lib/promo";
import { useVehiclesByIds } from "@/lib/useVehicles";
import { formatNumber } from "@/lib/format";
import { vehicleHref } from "@/lib/slug";
import { VehicleArt } from "@/components/VehicleArt";
import { artShape } from "@/lib/artshape";
import { Mixed } from "@/components/Mixed";
import { useDict, useLocale } from "@/lib/i18n/client";
import { dhUnit, promoBenefits, promoBlurb, promoLabel } from "@/lib/i18n/labels";
import {
  ArrowLeft, BadgeCheck, Camera, Check, Eye, Info, Phone, Sparkle, Timer, TrendingUp, Wallet,
} from "@/components/icons";

const TIER_ICON = { top: TrendingUp, urgent: Timer, featured: Sparkle } as const;

export function PromoteClient() {
  const t = useDict();
  const locale = useLocale();
  const dh = dhUnit(locale);
  const sp = useSearchParams();
  const wanted = useMemo(() => {
    const id = sp.get("listing");
    return id ? [id] : [];
  }, [sp]);
  /* الإعلان كيتجاب من قاعدة البيانات حسب المعرّف اللي فالرابط */
  const listing = useVehiclesByIds(wanted).items[0];
  const [picked, setPicked] = useState<PromoTier>("urgent");
  const [sending, setSending] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");
  const [promoId, setPromoId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofSending, setProofSending] = useState(false);
  const [proofSent, setProofSent] = useState(false);
  const [proofError, setProofError] = useState("");
  const proofInput = useRef<HTMLInputElement>(null);
  const meta = PROMOS[picked];

  /** تقدير المشاهدات: أساس الإعلان × مضاعف الدرجة على مدة الترويج */
  const projection = useMemo(() => {
    const baseDaily = listing ? Math.max(6, Math.round(listing.views / 45)) : 14;
    const plain = baseDaily * meta.days;
    return { plain, boosted: Math.round(plain * meta.liftX), baseDaily };
  }, [listing, meta]);

  /** كيسجّل طلب الترويج — الثمن كيتّاخد من الخادم ماشي من هنا */
  async function request() {
    if (!listing) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ref: listing.id, tier: picked }),
      });
      const json = await res.json();
      if (!json?.ok) {
        setError(
          res.status === 401
            ? t.promotePage.loginRequired
            : json?.error ?? t.promotePage.genericError,
        );
        return;
      }
      setPromoId(json.data.id as string);
      setRequested(true);
    } catch {
      setError(t.promotePage.networkError);
    } finally {
      setSending(false);
    }
  }

  /** كنرفعو السكرين شوت لمسار خاص — بحال وثائق التوثيق */
  async function submitProof() {
    if (!promoId || !proofFile) return;
    setProofSending(true);
    setProofError("");
    try {
      const up = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "content-type": proofFile.type || "image/jpeg",
          "x-filename": "proof.jpg",
          "x-purpose": "doc",
        },
        body: proofFile,
      });
      const upJson = await up.json();
      if (!upJson?.ok) throw new Error(upJson?.error ?? t.promotePage.proofError);

      const res = await fetch(`/api/promotions/${promoId}/proof`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ proof: upJson.data.pathname }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? t.promotePage.proofError);
      setProofSent(true);
    } catch (err) {
      setProofError(err instanceof Error ? err.message : t.promotePage.proofError);
    } finally {
      setProofSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10">
      <header className="mb-9 max-w-2xl">
        <span className="eyebrow"><TrendingUp size={13} /> {t.promotePage.eyebrow}</span>
        <h1 className="h-page mt-4">{t.promotePage.title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {t.promotePage.lead}
        </p>
      </header>

      {listing && (
        <div className="card mb-7 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="h-[92px] w-[150px] shrink-0 overflow-hidden rounded-xl">
            <VehicleArt
              id={listing.id} kind={listing.kind} body={artShape(listing)}
              color={listing.color} className="h-full w-full"
              label={`${listing.make} ${listing.model}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="eyebrow"><BadgeCheck size={12} /> {t.promotePage.promotingListing}</span>
            <h2 className="mt-1.5 truncate text-base font-bold">
              {listing.make} {listing.model} <span className="num">{listing.year}</span>
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-3 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
              <span className="num font-bold" style={{ color: "var(--brand)" }}>
                {formatNumber(listing.price)} {dh}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} /> <span className="num">{formatNumber(listing.views)}</span> {t.promotePage.view}
              </span>
              <span className="num">~{projection.baseDaily} {t.promotePage.viewPerDay}</span>
            </p>
          </div>
          <Link href={vehicleHref(listing)} className="btn btn-ghost btn-sm shrink-0">
            {t.promotePage.seeListing} <ArrowLeft size={13} className="dir-flip" />
          </Link>
        </div>
      )}

      {/* الخيارات */}
      <div className="grid gap-4 lg:grid-cols-3">
        {PROMO_ORDER.map((tier) => {
          const p = PROMOS[tier];
          const Icon = TIER_ICON[tier];
          const on = picked === tier;
          return (
            <button
              key={tier}
              onClick={() => setPicked(tier)}
              aria-pressed={on}
              className="card card-hover relative p-6 text-start transition-all"
              style={{
                borderColor: on ? p.color : "var(--line)",
                boxShadow: on ? `0 0 0 2px color-mix(in oklab, ${p.color} 35%, transparent)` : undefined,
              }}
            >
              {tier === "urgent" && (
                <span
                  className="absolute -top-2.5 end-5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold"
                  style={{ background: p.color, color: "#fff" }}
                >
                  {t.promotePage.mostRequested}
                </span>
              )}
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${p.color} 14%, transparent)`, color: p.color }}
              >
                <Icon size={21} />
              </span>
              <h3 className="mt-4 text-lg font-bold" style={{ color: p.color }}>{promoLabel(tier, locale, t)}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {promoBlurb(tier, locale, t)}
              </p>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="num text-3xl font-extrabold">{p.price}</span>
                <span className="text-xs font-bold" style={{ color: "var(--text-dim)" }}>
                  {dh} / <span className="num">{p.days}</span> {t.promotePage.perDays}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {promoBenefits(tier, locale, t).map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: p.color }} />
                    <Mixed text={b} />
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* التقدير */}
      <section className="card mt-7 p-6">
        <h2 className="flex items-center gap-2 text-sm font-extrabold">
          <Eye size={16} style={{ color: meta.color }} />
          {t.promotePage.estimateTitleA}{promoLabel(picked, locale, t)}{t.promotePage.estimateTitleB}
        </h2>
        <p className="mt-1.5 text-[12px]" style={{ color: "var(--text-dim)" }}>
          {t.promotePage.estimateLead}
        </p>

        <div className="mt-5 space-y-3">
          {[
            { label: t.promotePage.withoutBoost, n: projection.plain, color: "var(--text-dim)" },
            { label: promoLabel(picked, locale, t), n: projection.boosted, color: meta.color },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-[12px]">
                <span className="font-bold">{row.label}</span>
                <span className="num font-extrabold" style={{ color: row.color }}>
                  {formatNumber(row.n)} {t.promotePage.view}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(row.n / projection.boosted) * 100}%`, background: row.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { l: t.promotePage.costPerView, v: `${(meta.price / Math.max(1, projection.boosted - projection.plain)).toFixed(2)} ${dh}` },
            { l: t.promotePage.duration, v: `${meta.days} ${t.promotePage.perDays}` },
            { l: t.promotePage.total, v: `${meta.price} ${dh}` },
          ].map((s) => (
            <div key={s.l} className="stat text-center">
              <span className="stat-value num">{s.v}</span>
              <span className="stat-label">{s.l}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={request}
            disabled={!listing || sending || requested}
            className="btn btn-primary btn-lg flex-1"
            style={{ background: meta.color }}
          >
            <Wallet size={17} />{" "}
            {requested
              ? t.promotePage.requested
              : sending
                ? t.promotePage.sending
                : <>{t.promotePage.activateA}{promoLabel(picked, locale, t)}{t.promotePage.activateB}<span className="num">{meta.price}</span> {dh}</>}
          </button>
          <Link href="/dashboard/listings" className="btn btn-ghost btn-lg">
            {t.promotePage.backToListings}
          </Link>
        </div>

        {error && (
          <p className="mt-4 text-[12px] font-semibold" style={{ color: "var(--bad)" }}>
            {error}
          </p>
        )}
        {!listing && (
          <p className="mt-4 text-[12px]" style={{ color: "var(--text-dim)" }}>
            {t.promotePage.pickListingA} <Link href="/dashboard/listings" className="underline">{t.promotePage.yourListings}</Link> {t.promotePage.pickListingB}
          </p>
        )}

        <p
          className="mt-4 flex items-start gap-2 rounded-xl p-3 text-[11.5px] leading-relaxed"
          style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
        >
          <Info size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
          {requested ? t.promotePage.requestedNote : t.promotePage.preRequestNote}
        </p>

        {requested && promoId && (
          <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
            <h3 className="flex items-center gap-2 text-[13px] font-bold">
              <Camera size={15} style={{ color: "var(--brand)" }} /> {t.promotePage.proofSectionTitle}
            </h3>
            <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {t.promotePage.proofInstruction}
            </p>
            {proofSent ? (
              <p className="mt-3 flex items-center gap-2 rounded-lg p-3 text-[12.5px]"
                style={{ background: "var(--good-soft)", color: "var(--good)" }}>
                <BadgeCheck size={16} /> {t.promotePage.proofSubmitted}
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="label" htmlFor="promo-proof">{t.promotePage.proofUploadLabel}</label>
                  <input
                    id="promo-proof" ref={proofInput} type="file" accept="image/*" className="field"
                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <button
                  type="button"
                  onClick={submitProof}
                  disabled={!proofFile || proofSending}
                  className="btn btn-primary btn-sm shrink-0"
                >
                  {proofSending ? t.promotePage.proofSubmitting : t.promotePage.proofSubmit}
                </button>
              </div>
            )}
            {proofError && (
              <p className="mt-2 text-[12px] font-semibold" style={{ color: "var(--bad)" }}>
                {proofError}
              </p>
            )}
          </div>
        )}
      </section>

      {/* أسئلة */}
      <section className="mt-9">
        <h2 className="h-section mb-5">{t.promotePage.faqTitle}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {t.promotePage.faqs.map(([q, a]) => (
            <div key={q} className="card p-5">
              <h3 className="text-[13px] font-bold">{q}</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
