"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { Toolbar } from "./Toolbar";
import { PROMOS, type PromoTier } from "@/lib/promo";
import { formatNumber, timeAgo } from "@/lib/format";
import { Check, Close, Phone, Star } from "@/components/icons";

interface Row {
  id: string; tier: string; amount_mad: number; days: number;
  paid_at: string | null; starts_at: string | null; ends_at: string | null;
  created_at: string; provider: string | null;
  listing_ref: string; listing_slug: string; listing_title: string;
  listing_promo: string | null;
  seller_name: string; seller_email: string | null; seller_phone: string | null;
}

const daysLeft = (ends: string) =>
  Math.max(0, Math.ceil((Date.parse(ends) - Date.now()) / 86400000));

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
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        <h2 className="text-[17px] font-extrabold">الترويج</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          البائع كيطلب من صفحة الترويج، ونتا كتأكّد الأداء هنا. المدة كتبدا
          من لحظة التأكيد، والشارة كتّحيّد أوتوماتيكياً ملي تسالي.
        </p>
      </header>

      <Toolbar
        tabKey="filter"
        placeholder=""
        tabs={[
          { key: "pending", label: "فانتظار الأداء", count: counts.pending },
          { key: "active", label: "شغّالة", count: counts.active },
          { key: "ended", label: "سالات" },
          { key: "all", label: "كلشي" },
        ]}
      />

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          ماكاين حتى طلب.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((p) => {
            const meta = PROMOS[p.tier as PromoTier];
            const pending = !p.paid_at;
            const live = Boolean(p.paid_at && p.ends_at && Date.parse(p.ends_at) > Date.now());
            return (
              <li key={p.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag" style={{ background: meta?.color ?? "var(--brand)", color: "#fff" }}>
                        <Star size={10} /> {meta?.label ?? p.tier}
                      </span>
                      <span className="num text-[13px] font-extrabold">
                        {formatNumber(p.amount_mad)} د.م
                      </span>
                      <span className="num text-[11px]" style={{ color: "var(--text-dim)" }}>
                        {p.days} يوم
                      </span>
                      {pending ? (
                        <span className="tag" style={{ background: "var(--warn)", color: "#000" }}>
                          فانتظار الأداء
                        </span>
                      ) : live ? (
                        <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
                          شغّال · باقي <span className="num">{daysLeft(p.ends_at!)}</span> يوم
                        </span>
                      ) : (
                        <span className="tag" style={{ background: "var(--surface-3)" }}>سالا</span>
                      )}
                      {p.provider === "admin" && (
                        <span className="tag" style={{ background: "var(--surface-3)" }}>مجاني</span>
                      )}
                    </div>

                    <Link href={`/vehicle/${p.listing_slug}`} className="mt-1.5 block truncate text-[14px] font-bold">
                      {p.listing_title} <span className="num opacity-55">{p.listing_ref}</span>
                    </Link>

                    <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      <span>{p.seller_name}</span>
                      {p.seller_email && <bdi dir="ltr" className="num">{p.seller_email}</bdi>}
                      {p.seller_phone && (
                        <a href={`tel:${p.seller_phone}`} className="num" style={{ color: "var(--brand)" }}>
                          <Phone size={11} /> {p.seller_phone}
                        </a>
                      )}
                      <span>{timeAgo(p.created_at)}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {pending && (
                      <button className="btn btn-primary btn-sm" disabled={busy !== null}
                        onClick={() => act(p.id + "a", { action: "promo:activate", promoId: p.id })}>
                        <Check size={13} /> أكّد الأداء
                      </button>
                    )}
                    {live && (
                      <button className="btn btn-solid btn-sm" disabled={busy !== null}
                        onClick={() => act(p.id + "e", { action: "promo:activate", promoId: p.id })}>
                        مدّد
                      </button>
                    )}
                    {(pending || live) && (
                      <button className="btn btn-sm"
                        style={{ background: "var(--bad)", color: "#fff" }}
                        disabled={busy !== null}
                        onClick={() => act(p.id + "c", { action: "promo:cancel", promoId: p.id })}>
                        <Close size={13} /> {pending ? "ارفض" : "وقّف"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
