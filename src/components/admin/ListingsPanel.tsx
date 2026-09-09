"use client";

import { useState } from "react";
import { Link } from "@/components/Link";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { Toolbar } from "./Toolbar";
import { formatNumber } from "@/lib/format";
import { useDict, useLocale } from "@/lib/i18n/client";
import { cityLabel, dhUnit, fmtTimeAgo } from "@/lib/i18n/labels";
import { AlertTriangle, Camera, Close, Eye, Star, Trash } from "@/components/icons";

interface Row {
  ref: string; slug: string; title: string; status: string; price_mad: number;
  city: string; photo_count: number; trust_score: number | null; views: number;
  promo: string | null; created_at: string; seller_id: string; seller_name: string;
  seller_email: string | null; seller_banned: string | null; reports: string;
}

const STATUS_COLOR: Record<string, string> = {
  active: "var(--good)",
  rejected: "var(--bad)",
  sold: "var(--data)",
  draft: "var(--text-dim)",
  pending: "var(--warn)",
  expired: "var(--text-dim)",
};

export function ListingsPanel({ rows }: { rows: Row[] }) {
  const t = useDict();
  const locale = useLocale();
  const dh = dhUnit(locale);
  const p = t.listingsPanel;
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  async function act(key: string, payload: Record<string, string | null>) {
    setBusy(key);
    setError(null);
    const err = await adminAction(payload);
    if (err) setError(err);
    else router.refresh();
    setBusy(null);
    setConfirming(null);
  }

  return (
    <div>
      <header className="mb-5">
        <h2 className="text-[17px] font-extrabold">{p.title}</h2>
        <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          {p.lead}
        </p>
      </header>

      <Toolbar
        placeholder={p.searchPlaceholder}
        tabs={[
          { key: "all", label: p.tabs.all },
          { key: "active", label: p.tabs.active },
          { key: "rejected", label: p.tabs.rejected },
          { key: "sold", label: p.tabs.sold },
        ]}
      />

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          {p.empty}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => {
            const stLabel = p.status[r.status as keyof typeof p.status] ?? r.status;
            const stColor = STATUS_COLOR[r.status] ?? "var(--text-dim)";
            const open = Number(r.reports);
            return (
              <li key={r.ref} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag" style={{ background: stColor, color: "#fff" }}>
                        {stLabel}
                      </span>
                      {r.promo && (
                        <span className="tag" style={{ background: "var(--warn)", color: "#000" }}>
                          <Star size={10} /> {r.promo}
                        </span>
                      )}
                      {open > 0 && (
                        <span className="tag" style={{ background: "var(--bad)", color: "#fff" }}>
                          <AlertTriangle size={10} /> <span className="num">{open}</span> {p.reportsSuffix}
                        </span>
                      )}
                    </div>

                    <Link href={`/vehicle/${r.slug}`} className="mt-1.5 block truncate text-[14px] font-bold">
                      {r.title} <span className="num opacity-55">{r.ref}</span>
                    </Link>

                    <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      <span className="num font-bold" style={{ color: "var(--text-muted)" }}>
                        {formatNumber(r.price_mad)} {dh}
                      </span>
                      <span>{cityLabel(r.city, locale)}</span>
                      <span><Camera size={11} /> <span className="num">{r.photo_count}</span></span>
                      <span><Eye size={11} /> <span className="num">{r.views}</span></span>
                      {r.trust_score != null && <span className="num">{p.trustPrefix} {r.trust_score}</span>}
                      <span>{fmtTimeAgo(r.created_at, locale)}</span>
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
                      {r.seller_name}
                      {r.seller_email && <bdi dir="ltr" className="num"> · {r.seller_email}</bdi>}
                      {r.seller_banned && (
                        <span style={{ color: "var(--bad)" }}> · {p.banned}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {r.status === "active" ? (
                      <button className="btn btn-solid btn-sm" disabled={busy !== null}
                        onClick={() => act(r.ref + "h", { action: "listing:hide", ref: r.ref })}>
                        <Close size={13} /> {p.hide}
                      </button>
                    ) : (
                      <button className="btn btn-solid btn-sm" disabled={busy !== null}
                        onClick={() => act(r.ref + "r", { action: "listing:restore", ref: r.ref })}>
                        {p.restore}
                      </button>
                    )}

                    <select
                      className="field h-8 w-auto py-0 text-[11.5px]"
                      value={r.promo ?? ""}
                      disabled={busy !== null}
                      onChange={(e) =>
                        act(
                          r.ref + "p",
                          e.target.value
                            ? { action: "promo:grant", ref: r.ref, tier: e.target.value }
                            : { action: "promo:clear", ref: r.ref },
                        )
                      }
                    >
                      <option value="">{p.noPromo}</option>
                      <option value="featured">{p.promoFeatured}</option>
                      <option value="urgent">{p.promoUrgent}</option>
                      <option value="top">{p.promoTop}</option>
                    </select>

                    {confirming === r.ref ? (
                      <button className="btn btn-sm" style={{ background: "var(--bad)", color: "#fff" }}
                        disabled={busy !== null}
                        onClick={() => act(r.ref + "d", { action: "listing:delete", ref: r.ref })}>
                        {p.confirmDelete}
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(r.ref)}>
                        <Trash size={13} />
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
