"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { Toolbar } from "./Toolbar";
import { timeAgo } from "@/lib/format";
import { BadgeCheck, Check, Close, IdCard } from "@/components/icons";

interface Row {
  id: string; kind: string; doc_path: string; doc_back_path: string | null;
  status: string; note: string | null; created_at: string;
  reviewed_by: string | null; reviewed_at: string | null;
  user_id: string; user_name: string; user_email: string | null;
  user_phone: string | null; user_type: string; user_verified: boolean;
}

const KIND: Record<string, string> = {
  cin: "البطاقة الوطنية",
  registre: "السجل التجاري",
};

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
        <h2 className="text-[17px] font-extrabold">توثيق الهوية</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          شوف الوثيقة وتأكّد أنّ الاسم فيها هو اسم الحساب. القبول كيعطي شارة
          «موثّق» و<span className="num">8</span> نقط فمؤشر الثقة ديال كل
          إعلاناتو.
        </p>
      </header>

      <Toolbar
        tabs={[
          { key: "pending", label: "فانتظار", count: counts.pending },
          { key: "approved", label: "مقبولة" },
          { key: "rejected", label: "مرفوضة" },
          { key: "all", label: "كلشي" },
        ]}
        placeholder=""
      />

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          ماكاين حتى طلب.
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
                        <IdCard size={10} /> {KIND[v.kind] ?? v.kind}
                      </span>
                      {v.status === "approved" && (
                        <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
                          <BadgeCheck size={10} /> مقبول
                        </span>
                      )}
                      {v.status === "rejected" && (
                        <span className="tag" style={{ background: "var(--bad)", color: "#fff" }}>
                          مرفوض
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[14px] font-bold">{v.user_name}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      {v.user_email && <bdi dir="ltr" className="num">{v.user_email}</bdi>}
                      {v.user_phone && <bdi dir="ltr" className="num">{v.user_phone}</bdi>}
                      <span>{timeAgo(v.created_at)}</span>
                      {v.reviewed_by && <bdi dir="ltr">راجعو {v.reviewed_by}</bdi>}
                    </p>
                    {v.note && (
                      <p className="mt-1 text-[11.5px]" style={{ color: "var(--bad)" }}>
                        السبب: {v.note}
                      </p>
                    )}
                  </div>

                  {pending && (
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <input
                        className="field h-8 w-[190px] py-0 text-[11.5px]"
                        placeholder="سبب الرفض (اختياري)"
                        value={note[v.id] ?? ""}
                        onChange={(e) => setNote((n) => ({ ...n, [v.id]: e.target.value }))}
                      />
                      <div className="flex gap-1.5">
                        <button className="btn btn-primary btn-sm" disabled={busy !== null}
                          onClick={() => act(v.id + "a", { action: "verif:approve", verifId: v.id })}>
                          <Check size={13} /> اقبل
                        </button>
                        <button className="btn btn-sm" style={{ background: "var(--bad)", color: "#fff" }}
                          disabled={busy !== null}
                          onClick={() => act(v.id + "r", {
                            action: "verif:reject", verifId: v.id, note: note[v.id] ?? "",
                          })}>
                          <Close size={13} /> ارفض
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[v.doc_path, v.doc_back_path].filter(Boolean).map((p) => (
                    <button
                      key={p as string}
                      type="button"
                      onClick={() => setZoom(docUrl(p as string))}
                      className="overflow-hidden rounded-lg border"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={docUrl(p as string)} alt="وثيقة" className="h-28 w-auto object-cover" />
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setZoom(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="وثيقة" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
