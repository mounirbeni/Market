"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/format";
import { AlertTriangle, BadgeCheck, Check, Close, ShieldAlert } from "@/components/icons";

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

/* نفس القيم ديال report_reason فقاعدة البيانات */
const REASONS: Record<string, string> = {
  fake: "إعلان مزوّر",
  sold: "تباعت وباقية",
  price: "الثمن غالط",
  photos: "صور ماشي ديالها",
  papers: "مشكل فالوثائق",
  deposit: "كيطلب عربون",
  duplicate: "إعلان مكرّر",
  other: "سبب آخر",
};

const TABS = [
  { key: "open", label: "مفتوحة" },
  { key: "actioned", label: "تعالجات" },
  { key: "dismissed", label: "مرفوضة" },
  { key: "all", label: "كلشي" },
];

export function ModerationPanel({
  reports,
  counts,
  status,
}: {
  reports: Report[];
  counts: Record<string, number>;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(key: string, payload: Record<string, string>) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error ?? "ماقدرناش.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ماقدرناش.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <header className="mb-7">
        <span className="eyebrow"><ShieldAlert size={13} /> إشراف</span>
        <h1 className="h-page mt-3">التبليغات</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          كل تبليغ فيه الإعلان والبائع. «حيّد» كيخرّج الإعلان من الموقع،
          و«حضر» كيوقف الحساب وكيخرّج كل الإعلانات ديالو.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin?status=${t.key}`}
            className="chip transition"
            style={{
              borderColor: status === t.key ? "var(--brand)" : "var(--line)",
              background: status === t.key ? "var(--brand-soft)" : "var(--surface-1)",
              color: status === t.key ? "var(--brand)" : "var(--text-muted)",
            }}
          >
            {t.label}
            {counts[t.key] ? <span className="num"> {counts[t.key]}</span> : null}
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
          <h2 className="mt-4 text-lg font-bold">ماكاين حتى تبليغ</h2>
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
                      <AlertTriangle size={11} /> {REASONS[r.reason] ?? r.reason}
                    </span>
                    <Link
                      href={`/vehicle/${r.listing_slug}`}
                      className="mt-2 block truncate text-[14px] font-bold"
                    >
                      {r.listing_title}
                      <span className="num mr-2 opacity-55">{r.listing_ref}</span>
                    </Link>
                    <p className="mt-0.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      {r.seller_name}
                      {r.seller_email && <span className="num"> · {r.seller_email}</span>}
                      {" · "}
                      {timeAgo(r.created_at)}
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
                        act(r.id + "l", { action: hidden ? "restore" : "hide", ref: r.listing_ref })
                      }
                    >
                      {hidden ? "رجّع الإعلان" : <><Close size={13} /> حيّد الإعلان</>}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: banned ? "var(--surface-3)" : "var(--bad)", color: banned ? "var(--text)" : "#fff" }}
                      disabled={busy !== null}
                      onClick={() =>
                        act(r.id + "u", { action: banned ? "unban" : "ban", userId: r.seller_id })
                      }
                    >
                      {banned ? "رفع الحضر" : "حضر البائع"}
                    </button>
                    {r.status === "open" && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={busy !== null}
                          onClick={() => act(r.id + "a", { action: "actioned", reportId: r.id })}
                        >
                          <Check size={13} /> تعالج
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={busy !== null}
                          onClick={() => act(r.id + "d", { action: "dismissed", reportId: r.id })}
                        >
                          ماشي مشكل
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {(hidden || banned) && (
                  <p className="mt-2 text-[11px] font-bold" style={{ color: "var(--warn)" }}>
                    {hidden && "الإعلان محيّد من الموقع. "}
                    {banned && "الحساب محضور."}
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
