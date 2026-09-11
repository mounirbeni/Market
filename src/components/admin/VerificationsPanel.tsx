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
  selfie_path: string | null;
  status: string; note: string | null; created_at: string;
  reviewed_by: string | null; reviewed_at: string | null;
  user_id: string; user_name: string; user_email: string | null;
  user_phone: string | null; user_type: string; user_verified: boolean;
  user_avatar: string | null;
}

const docUrl = (p: string) => `/api/admin/doc/${p.split("/").map(encodeURIComponent).join("/")}`;

/* ============================================================
   مراجعة التوثيق

   الوثائق كتبان غير هنا: مسار /api/admin/doc كيتحقق من جلسة
   الإشراف، وبلا cache — وثيقة هوية ماخاصهاش تبقى فأي حافة.

   المراجعة هي مقارنة بعينيك بين ثلاثة أشياء:
     · الاسم المكتوب فالحساب  ↔  الاسم اللي فالوثيقة
     · الصورة الشخصية بالوثيقة فاليد  ↔  الصورة اللي فالوثيقة
   ولهذا زر القبول كيبقى مطفّي حتى تأكّد التطابقين بوحدك. القبول
   كيحط id_verified، وهي اللي كتعطي الشارة و12 نقطة فمؤشر ثقة
   الإعلان و35 فمؤشر ثقة الحساب — ماشي ضغطة ساهلة.
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
  /* تأكيدات المشرف لكل طلب: الاسم والصورة. كيتصفّاو من بعد كل
     إجراء باش الطلب الجاي مايرثش تأكيد ماشي ديالو. */
  const [checked, setChecked] = useState<Record<string, { name?: boolean; face?: boolean }>>({});
  const tick = (id: string, k: "name" | "face", v: boolean) =>
    setChecked((c) => ({ ...c, [id]: { ...c[id], [k]: v } }));
  const reviewed = (id: string) => Boolean(checked[id]?.name && checked[id]?.face);

  async function act(key: string, payload: Record<string, string>) {
    setBusy(key);
    setError(null);
    const err = await adminAction(payload);
    if (err) setError(err);
    else {
      setChecked((c) => ({ ...c, [payload.verifId ?? ""]: {} }));
      router.refresh();
    }
    setBusy(null);
  }

  return (
    <div>
      <header className="mb-5">
        <h2 className="text-[17px] font-extrabold">{p.title}</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {p.leadA} <span className="num">12</span> {p.leadB}
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
                      {/* التأكيدان هما المراجعة نفسها، ماشي تزيين: بلاهم زر
                          القبول مطفّي، باش ماتمرّش شي بطاقة ماشي ديال صاحب
                          الحساب بضغطة بلا ما تتشاف. */}
                      <div className="flex flex-col items-start gap-1 self-stretch rounded-lg p-2"
                        style={{ background: "var(--surface-3)" }}>
                        {([["name", p.confirmName], ["face", p.confirmFace]] as const).map(([k, label]) => (
                          <label key={k} className="flex cursor-pointer items-center gap-2 text-[11.5px]">
                            <input type="checkbox" className="h-3.5 w-3.5"
                              checked={Boolean(checked[v.id]?.[k])}
                              onChange={(e) => tick(v.id, k, e.target.checked)} />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                      <input
                        className="field h-8 w-[190px] py-0 text-[11.5px]"
                        placeholder={p.rejectReasonPlaceholder}
                        value={note[v.id] ?? ""}
                        onChange={(e) => setNote((n) => ({ ...n, [v.id]: e.target.value }))}
                      />
                      <div className="flex gap-1.5">
                        <button className="btn btn-primary btn-sm"
                          title={reviewed(v.id) ? undefined : p.confirmFirst}
                          disabled={busy !== null || !reviewed(v.id)}
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

                {/* الصور بترتيب المقارنة: الشخص الأول، من بعد الوثيقة.
                    كل وحدة معنونة باش المشرف يعرف فاش كيشوف. */}
                <div className="mt-3 flex flex-wrap gap-3">
                  {([
                    [v.selfie_path, p.selfieLabel],
                    [v.user_avatar, p.avatarLabel],
                    [v.doc_path, p.docFrontLabel],
                    [v.doc_back_path, p.docBackLabel],
                  ] as const)
                    .filter(([path]) => Boolean(path))
                    .map(([path, label]) => {
                      // صورة البروفايل عمومية؛ الصور الخاصة كتعدي من مسار الإشراف
                      const src = (path as string).startsWith("private/")
                        ? docUrl(path as string)
                        : (path as string);
                      return (
                        <figure key={path as string} className="m-0">
                          <button
                            type="button"
                            onClick={() => setZoom(src)}
                            className="block overflow-hidden rounded-lg border"
                            style={{ borderColor: "var(--line)" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={label} className="h-28 w-auto object-cover" />
                          </button>
                          <figcaption className="mt-1 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
                            {label}
                          </figcaption>
                        </figure>
                      );
                    })}
                  {!v.selfie_path && (
                    <p className="self-center rounded-lg p-2.5 text-[11.5px] leading-relaxed"
                      style={{ background: "var(--surface-3)", color: "var(--text-muted)", maxWidth: 260 }}>
                      {p.noSelfieLegacy}
                    </p>
                  )}
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
