"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { Toolbar } from "./Toolbar";
import { useDict, useLocale } from "@/lib/i18n/client";
import { fmtTimeAgo } from "@/lib/i18n/labels";
import { Modal } from "@/components/Modal";
import { BadgeCheck, Check, Close, IdCard } from "@/components/icons";

interface Row {
  id: string; kind: string; doc_path: string; doc_back_path: string | null;
  status: string; note: string | null; created_at: string;
  reviewed_by: string | null; reviewed_at: string | null;
  user_id: string; user_name: string; user_email: string | null;
  user_phone: string | null; user_type: string; user_verified: boolean;
}

const docUrl = (p: string) => `/api/admin/doc/${p.split("/").map(encodeURIComponent).join("/")}`;

/* ============================================================
   مراجعة التوثيق

   الوثيقة كتبان غير هنا: مسار /api/admin/doc كيتحقق من جلسة
   الإشراف، وبلا cache — وثيقة هوية ماخاصهاش تبقى فأي حافة.

   القبول كيحط id_verified، وهي اللي كتعطي الشارة و8 نقط فمؤشر
   الثقة. ولهذا خاصك تشوف الوثيقة بعينيك قبل ما تقبل.
   ============================================================ */
export function VerificationsPanel({
  rows,
  counts,
}: {
  rows: Row[];
  counts: { pending: number };
}) {
  const t = useDict();
  const locale = useLocale();
  const p = t.verificationsPanel;
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
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
          {p.leadA} <span className="num">8</span> {p.leadB}
        </p>
      </header>

      <Toolbar
        tabs={[
          { key: "pending", label: p.tabs.pending, count: counts.pending },
          { key: "approved", label: p.tabs.approved },
          { key: "rejected", label: p.tabs.rejected },
          { key: "all", label: p.tabs.all },
        ]}
        placeholder=""
      />

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          {p.empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((v) => {
            const pending = v.status === "pending";
            return (
              <li key={v.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag" style={{ background: "var(--brand)", color: "#fff" }}>
                        <IdCard size={10} /> {p.kinds[v.kind as keyof typeof p.kinds] ?? v.kind}
                      </span>
                      {v.status === "approved" && (
                        <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
                          <BadgeCheck size={10} /> {p.approved}
                        </span>
                      )}
                      {v.status === "rejected" && (
                        <span className="tag" style={{ background: "var(--bad)", color: "#fff" }}>
                          {p.rejected}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[14px] font-bold">{v.user_name}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      {v.user_email && <bdi dir="ltr" className="num">{v.user_email}</bdi>}
                      {v.user_phone && <bdi dir="ltr" className="num">{v.user_phone}</bdi>}
                      <span>{fmtTimeAgo(v.created_at, locale)}</span>
                      {v.reviewed_by && <bdi dir="ltr">{p.reviewedByPrefix} {v.reviewed_by}</bdi>}
                    </p>
                    {v.note && (
                      <p className="mt-1 text-[11.5px]" style={{ color: "var(--bad)" }}>
                        {p.reasonPrefix} {v.note}
                      </p>
                    )}
                  </div>

                  {pending && (
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <input
                        className="field h-8 w-[190px] py-0 text-[11.5px]"
                        placeholder={p.rejectReasonPlaceholder}
                        value={note[v.id] ?? ""}
                        onChange={(e) => setNote((n) => ({ ...n, [v.id]: e.target.value }))}
                      />
                      <div className="flex gap-1.5">
                        <button className="btn btn-primary btn-sm" disabled={busy !== null}
                          onClick={() => act(v.id + "a", { action: "verif:approve", verifId: v.id })}>
                          <Check size={13} /> {p.approve}
                        </button>
                        <button className="btn btn-sm" style={{ background: "var(--bad)", color: "#fff" }}
                          disabled={busy !== null}
                          onClick={() => act(v.id + "r", {
                            action: "verif:reject", verifId: v.id, note: note[v.id] ?? "",
                          })}>
                          <Close size={13} /> {p.reject}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[v.doc_path, v.doc_back_path].filter(Boolean).map((path) => (
                    <button
                      key={path as string}
                      type="button"
                      onClick={() => setZoom(docUrl(path as string))}
                      className="overflow-hidden rounded-lg border"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={docUrl(path as string)} alt={p.docAlt} className="h-28 w-auto object-cover" />
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {zoom && (
        <Modal onClose={() => setZoom(null)} ariaLabel={p.zoomAria} maxWidth="max-w-4xl">
          <div className="grid place-items-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom} alt={p.docAlt} className="max-h-[80vh] max-w-full rounded-lg object-contain" />
          </div>
        </Modal>
      )}
    </div>
  );
}
