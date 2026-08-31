"use client";

import { useState } from "react";
import { Link } from "@/components/Link";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { Toolbar } from "./Toolbar";
import { Modal } from "@/components/Modal";
import { PROMOS, type PromoTier } from "@/lib/promo";
import { formatNumber } from "@/lib/format";
import { useDict, useLocale } from "@/lib/i18n/client";
import { dhUnit, fmtTimeAgo, promoLabel } from "@/lib/i18n/labels";
import { Camera, Check, Close, Phone, Star } from "@/components/icons";

interface Row {
  id: string; tier: string; amount_mad: number; days: number;
  paid_at: string | null; starts_at: string | null; ends_at: string | null;
  created_at: string; provider: string | null; proof_path: string | null;
  listing_ref: string; listing_slug: string; listing_title: string;
  listing_promo: string | null;
  seller_name: string; seller_email: string | null; seller_phone: string | null;
}

const daysLeft = (ends: string) =>
  Math.max(0, Math.ceil((Date.parse(ends) - Date.now()) / 86400000));

/** الصورة خاصة — نفس مسار وثائق التوثيق، غير المشرف كيقدر يشوفها */
const proofUrl = (p: string) => `/api/admin/doc/${p.split("/").map(encodeURIComponent).join("/")}`;

/* ============================================================
   طلبات الترويج

   الأداء ماشي مربوط بشي بوابة دابا: البائع كيطلب، ونتا كتأكّد
   الأداء من هنا. ملي تأكّد، الشارة والرفعة كيتفعّلو دغيا،
   والمدة كتبدا من دابا ماشي من وقت الطلب — البائع خلّص اليوم.

   الانتهاء أوتوماتيكي: مهمة يومية كتحيّد الشارة ملي تسالي المدة.
   ============================================================ */
export function PromosPanel({
  rows,
  counts,
}: {
  rows: Row[];
  counts: { pending: number; active: number };
}) {
  const t = useDict();
  const locale = useLocale();
  const dh = dhUnit(locale);
  const p = t.promosPanel;
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  async function act(key: string, payload: Record<string, string>) {
    setBusy(key);
    setError(null);
    const err = await adminAction(payload);
    if (err) setError(err);
    else router.refresh();
    setBusy(null);
  }

  return (
    <div>
      <header className="mb-5">
        <h2 className="text-[17px] font-extrabold">{p.title}</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {p.lead}
        </p>
      </header>

      <Toolbar
        tabKey="filter"
        placeholder=""
        tabs={[
          { key: "pending", label: p.tabs.pending, count: counts.pending },
          { key: "active", label: p.tabs.active, count: counts.active },
          { key: "ended", label: p.tabs.ended },
          { key: "all", label: p.tabs.all },
        ]}
      />

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          {p.empty}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const meta = PROMOS[row.tier as PromoTier];
            const pending = !row.paid_at;
            const live = Boolean(row.paid_at && row.ends_at && Date.parse(row.ends_at) > Date.now());
            return (
              <li key={row.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag" style={{ background: meta?.color ?? "var(--brand)", color: "#fff" }}>
                        <Star size={10} /> {row.tier in PROMOS ? promoLabel(row.tier as PromoTier, locale, t) : row.tier}
                      </span>
                      <span className="num text-[13px] font-extrabold">
                        {formatNumber(row.amount_mad)} {dh}
                      </span>
                      <span className="num text-[11px]" style={{ color: "var(--text-dim)" }}>
                        {row.days} {p.daysSuffix}
                      </span>
                      {pending ? (
                        <span className="tag" style={{ background: "var(--warn)", color: "#000" }}>
                          {p.awaitingPayment}
                        </span>
                      ) : live ? (
                        <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
                          {p.liveA} <span className="num">{daysLeft(row.ends_at!)}</span> {p.liveB}
                        </span>
                      ) : (
                        <span className="tag" style={{ background: "var(--surface-3)" }}>{p.ended}</span>
                      )}
                      {row.provider === "admin" && (
                        <span className="tag" style={{ background: "var(--surface-3)" }}>{p.free}</span>
                      )}
                    </div>

                    <Link href={`/vehicle/${row.listing_slug}`} className="mt-1.5 block truncate text-[14px] font-bold">
                      {row.listing_title} <span className="num opacity-55">{row.listing_ref}</span>
                    </Link>

                    <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      <span>{row.seller_name}</span>
                      {row.seller_email && <bdi dir="ltr" className="num">{row.seller_email}</bdi>}
                      {row.seller_phone && (
                        <a href={`tel:${row.seller_phone}`} className="num" style={{ color: "var(--brand)" }}>
                          <Phone size={11} /> {row.seller_phone}
                        </a>
                      )}
                      <span>{fmtTimeAgo(row.created_at, locale)}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {pending && (
                      <button className="btn btn-primary btn-sm" disabled={busy !== null}
                        onClick={() => act(row.id + "a", { action: "promo:activate", promoId: row.id })}>
                        <Check size={13} /> {p.confirmPayment}
                      </button>
                    )}
                    {live && (
                      <button className="btn btn-solid btn-sm" disabled={busy !== null}
                        onClick={() => act(row.id + "e", { action: "promo:activate", promoId: row.id })}>
                        {p.extend}
                      </button>
                    )}
                    {(pending || live) && (
                      <button className="btn btn-sm"
                        style={{ background: "var(--bad)", color: "#fff" }}
                        disabled={busy !== null}
                        onClick={() => act(row.id + "c", { action: "promo:cancel", promoId: row.id })}>
                        <Close size={13} /> {pending ? p.reject : p.stop}
                      </button>
                    )}
                  </div>
                </div>

                {pending && (
                  <div className="mt-3 flex items-center gap-2.5">
                    {row.proof_path ? (
                      <button
                        type="button"
                        onClick={() => setZoom(proofUrl(row.proof_path!))}
                        className="overflow-hidden rounded-lg border"
                        style={{ borderColor: "var(--line)" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proofUrl(row.proof_path)} alt={p.proofAlt} className="h-24 w-auto object-cover" />
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px]"
                        style={{ background: "var(--surface-3)", color: "var(--text-dim)" }}>
                        <Camera size={13} /> {p.noProof}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {zoom && (
        <Modal onClose={() => setZoom(null)} ariaLabel={p.zoomAria} maxWidth="max-w-4xl">
          <div className="grid place-items-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom} alt={p.proofAlt} className="max-h-[80vh] max-w-full rounded-lg object-contain" />
          </div>
        </Modal>
      )}
    </div>
  );
}
