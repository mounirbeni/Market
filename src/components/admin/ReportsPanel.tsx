"use client";

import { useState } from "react";
import { Link } from "@/components/Link";
import { useRouter } from "next/navigation";
import { useDict, useLocale } from "@/lib/i18n/client";
import { fmtTimeAgo } from "@/lib/i18n/labels";
import { adminAction } from "./actions";
import { AlertTriangle, BadgeCheck, Check, Close } from "@/components/icons";

interface Report {
  id: string;
  reason: string;
  note: string | null;
  status: string;
  created_at: string;
  listing_ref: string;
  listing_slug: string;
  listing_title: string;
  listing_status: string;
  seller_id: string;
  seller_name: string;
  seller_email: string | null;
  seller_banned: string | null;
}

const TAB_KEYS = ["open", "actioned", "dismissed", "all"] as const;

export function ReportsPanel({
  reports,
  counts,
  status,
}: {
  reports: Report[];
  counts: Record<string, number>;
  status: string;
}) {
  const t = useDict();
  const locale = useLocale();
  const r0 = t.reportsPanel;
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
        <h2 className="text-[17px] font-extrabold">{r0.title}</h2>
        <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          {r0.lead}
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {TAB_KEYS.map((k) => (
          <Link
            key={k}
            href={`/admin/reports?status=${k}`}
            className="chip transition"
            style={{
              borderColor: status === k ? "var(--brand)" : "var(--line)",
              background: status === k ? "var(--brand-soft)" : "var(--surface-1)",
              color: status === k ? "var(--brand)" : "var(--text-muted)",
            }}
          >
            {r0.tabs[k]}
            {counts[k] ? <span className="num"> {counts[k]}</span> : null}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>
      )}

      {reports.length === 0 ? (
        <div className="card flex flex-col items-center p-12 text-center">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: "var(--good-soft)", color: "var(--good)" }}
          >
            <BadgeCheck size={26} />
          </span>
          <h2 className="mt-4 text-lg font-bold">{r0.emptyTitle}</h2>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => {
            const hidden = r.listing_status === "rejected";
            const banned = Boolean(r.seller_banned);
            return (
              <li key={r.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="tag" style={{ background: "var(--bad)", color: "#fff" }}>
                      <AlertTriangle size={11} /> {r0.reasons[r.reason as keyof typeof r0.reasons] ?? r.reason}
                    </span>
                    <Link
                      href={`/vehicle/${r.listing_slug}`}
                      className="mt-2 block truncate text-[14px] font-bold"
                    >
                      {r.listing_title}
                      <span className="num me-2 opacity-55">{r.listing_ref}</span>
                    </Link>
                    <p className="mt-0.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      {r.seller_name}
                      {r.seller_email && <span className="num"> · {r.seller_email}</span>}
                      {" · "}
                      {fmtTimeAgo(r.created_at, locale)}
                    </p>
                    {r.note && (
                      <p
                        className="mt-2 rounded-lg p-2.5 text-[12px] leading-relaxed"
                        style={{ background: "var(--surface-3)" }}
                      >
                        {r.note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <button
                      className="btn btn-solid btn-sm"
                      disabled={busy !== null}
                      onClick={() =>
                        act(r.id + "l", {
                          action: hidden ? "listing:restore" : "listing:hide",
                          ref: r.listing_ref,
                        })
                      }
                    >
                      {hidden ? r0.restoreListing : <><Close size={13} /> {r0.hideListing}</>}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: banned ? "var(--surface-3)" : "var(--bad)", color: banned ? "var(--text)" : "#fff" }}
                      disabled={busy !== null}
                      onClick={() =>
                        act(r.id + "u", {
                          action: banned ? "user:unban" : "user:ban",
                          userId: r.seller_id,
                        })
                      }
                    >
                      {banned ? r0.unban : r0.ban}
                    </button>
                    {r.status === "open" && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={busy !== null}
                          onClick={() => act(r.id + "a", { action: "report:actioned", reportId: r.id })}
                        >
                          <Check size={13} /> {r0.actioned}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={busy !== null}
                          onClick={() => act(r.id + "d", { action: "report:dismissed", reportId: r.id })}
                        >
                          {r0.dismiss}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {(hidden || banned) && (
                  <p className="mt-2 text-[11px] font-bold" style={{ color: "var(--warn)" }}>
                    {hidden && r0.hiddenNote}
                    {banned && r0.bannedNote}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
