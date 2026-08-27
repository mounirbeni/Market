"use client";

import Link from "next/link";
import { useState } from "react";
import { useMyListings } from "@/lib/useMyListings";
import { fairPriceOf, trustOf } from "@/lib/market";
import { promoOf } from "@/lib/promo";
import { formatNumber, timeAgo } from "@/lib/format";
import { vehicleHref } from "@/lib/slug";
import { artShape } from "@/lib/artshape";
import { VehicleArt } from "@/components/VehicleArt";
import { TrustDot } from "@/components/TrustBadge";
import { BadgeCheck, Check, Eye, Heart, Plus, Sparkle, Timer, Trash, TrendingUp } from "@/components/icons";

/** نفس قيم listing_status اللي فقاعدة البيانات */
type Status = "draft" | "pending" | "active" | "sold" | "expired" | "rejected";

const STATUS: Record<Status, { label: string; color: string }> = {
  draft: { label: "مسوّدة", color: "var(--text-dim)" },
  pending: { label: "في المراجعة", color: "var(--warn)" },
  active: { label: "نشيط", color: "var(--good)" },
  sold: { label: "مباع", color: "var(--data)" },
  expired: { label: "منتهي", color: "var(--text-dim)" },
  rejected: { label: "مرفوض", color: "var(--bad)" },
};

const asStatus = (s: string): Status => (s in STATUS ? (s as Status) : "active");

export function DashboardListings() {
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
      if (!json?.ok) throw new Error(json?.error ?? "ماقدرناش.");
      setItems((list) => list.map((x) => (x.id === ref ? { ...x, status } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "ماقدرناش.");
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
      if (!json?.ok) throw new Error(json?.error ?? "ماقدرناش نمسحوه.");
      setItems((list) => list.filter((x) => x.id !== ref));
      setConfirming(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ماقدرناش نمسحوه.");
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

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {([["all", "الكل"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])] as [string, string][]).map(
            ([k, label]) => {
              const on = filter === k;
              const n = k === "all" ? mine.length : counts[k] ?? 0;
              return (
                <button
                  key={k}
                  onClick={() => setFilter(k as Status | "all")}
                  aria-pressed={on}
                  className="chip transition"
                  style={{
                    borderColor: on ? "var(--brand)" : "var(--line)",
                    background: on ? "var(--brand-soft)" : "var(--surface-1)",
                    color: on ? "var(--brand)" : "var(--text-muted)",
                  }}
                >
                  {label} <span className="num opacity-60">{n}</span>
                </button>
              );
            },
          )}
        </div>
        <Link href="/sell" className="btn btn-primary btn-sm"><Plus size={14} /> إعلان جديد</Link>
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
          const st = STATUS[status];
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
                      style={{ background: `color-mix(in oklab, ${st.color} 14%, transparent)`, color: st.color }}
                    >
                      {st.label}
                    </span>
                    {promoOf(v) ? (
                      <span className="tag" style={{ background: promoOf(v)!.color, color: "#fff" }}>
                        <Sparkle size={10} /> {promoOf(v)!.label}
                      </span>
                    ) : (
                      <Link
                        href={`/promote?listing=${v.id}`}
                        className="tag transition-colors hover:brightness-95"
                        style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                      >
                        <TrendingUp size={10} /> روّج
                      </Link>
                    )}
                  </div>
                  <p className="num mt-1 text-[13px] font-bold" style={{ color: "var(--brand)" }}>
                    {formatNumber(v.price)} د.م
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--text-dim)" }}>
                    <span className="flex items-center gap-1"><Eye size={12} /> <span className="num">{formatNumber(v.views)}</span> مشاهدة</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> <span className="num">{v.saves}</span> حفظ</span>
                    <span className="flex items-center gap-1"><Timer size={12} /> نُشر {timeAgo(v.publishedAt)}</span>
                    <span className="tag tag-mute">{fp.weak ? "مراجع محدودة" : fp.label}</span>
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
                  تعديل
                </Link>

                {status === "active" ? (
                  <button
                    type="button" className="btn btn-solid btn-sm" disabled={busy === v.id}
                    onClick={() => setStatus(v.id, "draft")}
                  >
                    إيقاف مؤقت
                  </button>
                ) : status !== "sold" ? (
                  <button
                    type="button" className="btn btn-solid btn-sm" disabled={busy === v.id}
                    onClick={() => setStatus(v.id, "active")}
                  >
                    نشّر من جديد
                  </button>
                ) : null}

                <Link
                  href={`/promote?listing=${v.id}`}
                  className="btn btn-sm"
                  style={{ background: "var(--brand)", color: "#fff" }}
                >
                  <Sparkle size={13} /> ترويج
                </Link>

                {status !== "sold" && (
                  <button
                    type="button" className="btn btn-solid btn-sm" disabled={busy === v.id}
                    onClick={() => setStatus(v.id, "sold")}
                  >
                    <Check size={13} /> علّم كمباع
                  </button>
                )}

                {/* الحذف نهائي وماكاينش تراجع — خاصو تأكيد */}
                {confirming === v.id ? (
                  <span className="mr-auto flex items-center gap-1.5">
                    <span className="text-[11px] font-bold" style={{ color: "var(--bad)" }}>
                      تمسحو نهائياً؟
                    </span>
                    <button
                      type="button" className="btn btn-sm" disabled={busy === v.id}
                      style={{ background: "var(--bad)", color: "#fff" }}
                      onClick={() => remove(v.id)}
                    >
                      {busy === v.id ? "…" : "إيه، امسحو"}
                    </button>
                    <button
                      type="button" className="btn btn-solid btn-sm"
                      onClick={() => setConfirming(null)}
                    >
                      لا
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm mr-auto"
                    style={{ color: "var(--bad)", borderColor: "var(--line)" }}
                    onClick={() => { setError(null); setConfirming(v.id); }}
                  >
                    <Trash size={13} /> حذف
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {rows.length === 0 && (
          <div className="card flex flex-col items-center p-12 text-center">
            <BadgeCheck size={28} style={{ color: "var(--text-dim)" }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>ماكاين حتى إعلان بهاد الحالة.</p>
          </div>
        )}
      </div>
    </div>
  );
}
