"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { Toolbar } from "./Toolbar";
import { formatNumber, timeAgo } from "@/lib/format";
import { cityName } from "@/lib/cities";
import { AlertTriangle, Camera, Close, Eye, Star, Trash } from "@/components/icons";

interface Row {
  ref: string; slug: string; title: string; status: string; price_mad: number;
  city: string; photo_count: number; trust_score: number | null; views: number;
  promo: string | null; created_at: string; seller_id: string; seller_name: string;
  seller_email: string | null; seller_banned: string | null; reports: string;
}

const STATUS: Record<string, { label: string; color: string }> = {
  active: { label: "نشيط", color: "var(--good)" },
  rejected: { label: "محيّد", color: "var(--bad)" },
  sold: { label: "تباع", color: "var(--data)" },
  draft: { label: "مسوّدة", color: "var(--text-dim)" },
  pending: { label: "فانتظار", color: "var(--warn)" },
  expired: { label: "منتهي", color: "var(--text-dim)" },
};

export function ListingsPanel({ rows }: { rows: Row[] }) {
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
        <h2 className="text-[17px] font-extrabold">الإعلانات</h2>
        <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          كل الإعلانات بكل حالاتها. الترويج من هنا مجاني — للحالات الخاصة.
        </p>
      </header>

      <Toolbar
        placeholder="مرجع، ماركة، موديل، ولا إيميل البائع…"
        tabs={[
          { key: "all", label: "كلشي" },
          { key: "active", label: "نشيطة" },
          { key: "rejected", label: "محيّدة" },
          { key: "sold", label: "تباعت" },
        ]}
      />

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          ماكاين حتى إعلان.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => {
            const st = STATUS[r.status] ?? { label: r.status, color: "var(--text-dim)" };
            const open = Number(r.reports);
            return (
              <li key={r.ref} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag" style={{ background: st.color, color: "#fff" }}>
                        {st.label}
                      </span>
                      {r.promo && (
                        <span className="tag" style={{ background: "var(--warn)", color: "#000" }}>
                          <Star size={10} /> {r.promo}
                        </span>
                      )}
                      {open > 0 && (
                        <span className="tag" style={{ background: "var(--bad)", color: "#fff" }}>
                          <AlertTriangle size={10} /> <span className="num">{open}</span> تبليغ
                        </span>
                      )}
                    </div>

                    <Link href={`/vehicle/${r.slug}`} className="mt-1.5 block truncate text-[14px] font-bold">
                      {r.title} <span className="num opacity-55">{r.ref}</span>
                    </Link>

                    <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      <span className="num font-bold" style={{ color: "var(--text-muted)" }}>
                        {formatNumber(r.price_mad)} د.م
                      </span>
                      <span>{cityName(r.city)}</span>
                      <span><Camera size={11} /> <span className="num">{r.photo_count}</span></span>
                      <span><Eye size={11} /> <span className="num">{r.views}</span></span>
                      {r.trust_score != null && <span className="num">ثقة {r.trust_score}</span>}
                      <span>{timeAgo(r.created_at)}</span>
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
                      {r.seller_name}
                      {r.seller_email && <bdi dir="ltr" className="num"> · {r.seller_email}</bdi>}
                      {r.seller_banned && (
                        <span style={{ color: "var(--bad)" }}> · محضور</span>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {r.status === "active" ? (
                      <button className="btn btn-solid btn-sm" disabled={busy !== null}
                        onClick={() => act(r.ref + "h", { action: "listing:hide", ref: r.ref })}>
                        <Close size={13} /> حيّد
                      </button>
                    ) : (
                      <button className="btn btn-solid btn-sm" disabled={busy !== null}
                        onClick={() => act(r.ref + "r", { action: "listing:restore", ref: r.ref })}>
                        رجّع
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
                      <option value="">بلا ترويج</option>
                      <option value="featured">مميّز</option>
                      <option value="urgent">مستعجل</option>
                      <option value="top">فوق</option>
                    </select>

                    {confirming === r.ref ? (
                      <button className="btn btn-sm" style={{ background: "var(--bad)", color: "#fff" }}
                        disabled={busy !== null}
                        onClick={() => act(r.ref + "d", { action: "listing:delete", ref: r.ref })}>
                        متأكّد؟ امسح
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
