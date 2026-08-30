"use client";

import { Link } from "@/components/Link";
import { useState } from "react";
import { useMyListings } from "@/lib/useMyListings";
import { fairPriceOf, trustOf } from "@/lib/market";
import { promoOf } from "@/lib/promo";
import { formatNumber } from "@/lib/format";
import { vehicleHref } from "@/lib/slug";
import { artShape } from "@/lib/artshape";
import { VehicleArt } from "@/components/VehicleArt";
import { TrustDot } from "@/components/TrustBadge";
import { useDict, useLocale } from "@/lib/i18n/client";
import { dhUnit, fmtTimeAgo, promoLabel } from "@/lib/i18n/labels";
import { BadgeCheck, Check, Eye, Heart, Plus, Sparkle, Timer, Trash, TrendingUp } from "@/components/icons";

/** نفس قيم listing_status اللي فقاعدة البيانات */
type Status = "draft" | "pending" | "active" | "sold" | "expired" | "rejected";

const STATUS_COLOR: Record<Status, string> = {
  draft: "var(--text-dim)",
  pending: "var(--warn)",
  active: "var(--good)",
  sold: "var(--data)",
  expired: "var(--text-dim)",
  rejected: "var(--bad)",
};

const asStatus = (s: string): Status => (s in STATUS_COLOR ? (s as Status) : "active");

export function DashboardListings() {
  const t = useDict();
  const locale = useLocale();
  const dh = dhUnit(locale);
  const p = t.listingsPage;
  const [filter, setFilter] = useState<Status | "all">("all");
  /* الإعلان اللي فيه عملية دابا — باش نعطّلو أزرارو وحدو */
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  /* إعلاناتك الحقيقية من قاعدة البيانات */
  const { items: mine, setItems } = useMyListings();

  /* الأزرار كانو مرسومين بلا onClick — كيبانو خدّامين وماكيديرو
     والو. دابا كل واحد كيمشي لـ/api/me/listings/<المرجع>. */
  async function setStatus(ref: string, status: Status) {
    setError(null);
    setBusy(ref);
    try {
      const res = await fetch(`/api/me/listings/${ref}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? p.genericError);
      setItems((list) => list.map((x) => (x.id === ref ? { ...x, status } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : p.genericError);
    } finally {
      setBusy(null);
    }
  }

  async function remove(ref: string) {
    setError(null);
    setBusy(ref);
    try {
      const res = await fetch(`/api/me/listings/${ref}`, { method: "DELETE" });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? p.deleteError);
      setItems((list) => list.filter((x) => x.id !== ref));
      setConfirming(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : p.deleteError);
    } finally {
      setBusy(null);
    }
  }

  const rows = mine
    .map((v) => ({ v, status: asStatus(v.status) }))
    .filter((r) => filter === "all" || r.status === filter);

  const counts = mine.reduce<Record<string, number>>((acc, v) => {
    const s = asStatus(v.status);
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  const statusKeys: (Status | "all")[] = ["all", "draft", "pending", "active", "sold", "expired", "rejected"];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {statusKeys.map((k) => {
            const on = filter === k;
            const n = k === "all" ? mine.length : counts[k] ?? 0;
            return (
              <button
                key={k}
                onClick={() => setFilter(k)}
                aria-pressed={on}
                className="chip transition"
                style={{
                  borderColor: on ? "var(--brand)" : "var(--line)",
                  background: on ? "var(--brand-soft)" : "var(--surface-1)",
                  color: on ? "var(--brand)" : "var(--text-muted)",
                }}
              >
                {p.status[k]} <span className="num opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
        <Link href="/sell" className="btn btn-primary btn-sm"><Plus size={14} /> {p.newListing}</Link>
      </div>

      {error && (
        <p className="card mb-3 p-3 text-[12.5px] font-bold" style={{ color: "var(--bad)" }}>
          {error}
        </p>
      )}

      <div className="space-y-3">
        {rows.map(({ v, status }) => {
          const trust = trustOf(v);
          const fp = fairPriceOf(v);
          const stColor = STATUS_COLOR[status];
          const promo = promoOf(v);
          return (
            <article key={v.id} className="card overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Link href={vehicleHref(v)} className="h-20 w-32 shrink-0 overflow-hidden rounded-xl">
                  <VehicleArt id={v.id} kind={v.kind} body={artShape(v)} color={v.color} className="h-full w-full" />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={vehicleHref(v)} className="text-[14px] font-bold hover:text-[var(--brand)]">
                      {v.make} {v.model}
                    </Link>
                    <span
                      className="tag"
                      style={{ background: `color-mix(in oklab, ${stColor} 14%, transparent)`, color: stColor }}
                    >
                      {p.status[status]}
                    </span>
                    {promo ? (
                      <span className="tag" style={{ background: promo.color, color: "#fff" }}>
                        <Sparkle size={10} /> {promoLabel(promo.tier, locale, t)}
                      </span>
                    ) : (
                      <Link
                        href={`/promote?listing=${v.id}`}
                        className="tag transition-colors hover:brightness-95"
                        style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                      >
                        <TrendingUp size={10} /> {p.promote}
                      </Link>
                    )}
                  </div>
                  <p className="num mt-1 text-[13px] font-bold" style={{ color: "var(--brand)" }}>
                    {formatNumber(v.price)} {dh}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--text-dim)" }}>
                    <span className="flex items-center gap-1"><Eye size={12} /> <span className="num">{formatNumber(v.views)}</span> {p.viewsSuffix}</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> <span className="num">{v.saves}</span> {p.savesSuffix}</span>
                    <span className="flex items-center gap-1"><Timer size={12} /> {p.publishedPrefix} {fmtTimeAgo(v.publishedAt, locale)}</span>
                    <span className="tag tag-mute">{fp.weak ? p.limitedRefs : fp.label}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <TrustDot trust={trust} />
                </div>
              </div>

              <div
                className="flex flex-wrap gap-1.5 border-t px-4 py-2.5"
                style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
              >
                <Link href={`/dashboard/listings/${v.id}/edit`} className="btn btn-solid btn-sm">
                  {p.edit}
                </Link>

                {status === "active" ? (
                  <button
                    type="button" className="btn btn-solid btn-sm" disabled={busy === v.id}
                    onClick={() => setStatus(v.id, "draft")}
                  >
                    {p.pause}
                  </button>
                ) : status !== "sold" ? (
                  <button
                    type="button" className="btn btn-solid btn-sm" disabled={busy === v.id}
                    onClick={() => setStatus(v.id, "active")}
                  >
                    {p.republish}
                  </button>
                ) : null}

                <Link
                  href={`/promote?listing=${v.id}`}
                  className="btn btn-sm"
                  style={{ background: "var(--brand)", color: "#fff" }}
                >
                  <Sparkle size={13} /> {p.boost}
                </Link>

                {status !== "sold" && (
                  <button
                    type="button" className="btn btn-solid btn-sm" disabled={busy === v.id}
                    onClick={() => setStatus(v.id, "sold")}
                  >
                    <Check size={13} /> {p.markSold}
                  </button>
                )}

                {/* الحذف نهائي وماكاينش تراجع — خاصو تأكيد */}
                {confirming === v.id ? (
                  <span className="me-auto flex items-center gap-1.5">
                    <span className="text-[11px] font-bold" style={{ color: "var(--bad)" }}>
                      {p.confirmDelete}
                    </span>
                    <button
                      type="button" className="btn btn-sm" disabled={busy === v.id}
                      style={{ background: "var(--bad)", color: "#fff" }}
                      onClick={() => remove(v.id)}
                    >
                      {busy === v.id ? "…" : p.yesDelete}
                    </button>
                    <button
                      type="button" className="btn btn-solid btn-sm"
                      onClick={() => setConfirming(null)}
                    >
                      {p.no}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm me-auto"
                    style={{ color: "var(--bad)", borderColor: "var(--line)" }}
                    onClick={() => { setError(null); setConfirming(v.id); }}
                  >
                    <Trash size={13} /> {p.delete}
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {rows.length === 0 && (
          <div className="card flex flex-col items-center p-12 text-center">
            <BadgeCheck size={28} style={{ color: "var(--text-dim)" }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>{p.emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
