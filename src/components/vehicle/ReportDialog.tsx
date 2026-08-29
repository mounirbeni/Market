"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { Modal, ModalCloseButton, useModalClose } from "@/components/Modal";
import { AlertTriangle, Check, Flag, ShieldCheck } from "@/components/icons";

const REASONS = [
  { value: "fake", label: "إعلان كذاب", hint: "المركبة ماكايناش أصلاً" },
  { value: "sold", label: "تباعت ومازال منشور", hint: "البائع ماحيّدش الإعلان" },
  { value: "price", label: "ثمن مشبوه", hint: "رخيص بزاف على السوق — علامة نصب" },
  { value: "photos", label: "صور مسروقة", hint: "الصور مأخوذة من إعلان آخر" },
  { value: "papers", label: "مشكل فالوثائق", hint: "كارط كريز ماشي فسمية البائع" },
  { value: "deposit", label: "كيطلب عربوناً قبل المعاينة", hint: "أشهر طريقة نصب" },
  { value: "duplicate", label: "إعلان مكرر", hint: "نفس المركبة منشورة بزاف ديال المرات" },
  { value: "other", label: "سبب آخر", hint: "" },
];

export function ReportDialog({ v, onClose }: { v: Vehicle; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  /** كيسجّل التبليغ فقاعدة البيانات — بلا ما يكون المستخدم داخل */
  async function send() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ref: v.id, reason, note }),
      });
      const json = await res.json();
      if (!json?.ok) {
        setError(json?.error ?? "ماقدرناش نسجّلو التبليغ. عاود المحاولة.");
        return;
      }
      setSent(true);
    } catch {
      setError("الشبكة قاطعة. عاود المحاولة.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal onClose={onClose} ariaLabel="التبليغ عن إعلان" maxWidth="max-w-lg">
        {sent ? (
          <ReportSentBody />
        ) : (
          <>
            <header
              className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b p-5"
              style={{ borderColor: "var(--line-soft)", background: "var(--surface-1)" }}
            >
              <h2 className="flex items-center gap-2 text-base font-extrabold">
                <Flag size={18} style={{ color: "var(--bad)" }} />
                بلّغ على الإعلان
              </h2>
              <ModalCloseButton label="سدّ" className="btn btn-icon btn-sm" />
            </header>

            <div className="p-5">
              <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                كتبلّغ على: <b>{v.make} {v.model} <span className="num">{v.year}</span></b>.
                التبليغ سرّي — البائع ماكيعرفش شكون بلّغ.
              </p>

              <fieldset className="mt-5">
                <legend className="label mb-2.5">علاش كتبلّغ؟</legend>
                <div className="grid gap-1.5">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className="flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors"
                      style={{
                        borderColor: reason === r.value ? "var(--bad)" : "var(--line)",
                        background: reason === r.value ? "var(--bad-soft)" : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="mt-0.5 shrink-0 accent-[var(--bad)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold">{r.label}</span>
                        {r.hint && (
                          <span className="block text-[11.5px]" style={{ color: "var(--text-dim)" }}>{r.hint}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="label mt-5 block" htmlFor="report-note">
                تفاصيل إضافية <span style={{ color: "var(--text-dim)" }}>(اختياري)</span>
              </label>
              <textarea
                id="report-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                placeholder="مثلاً: نفس الصور كاينة فإعلان آخر بثمن مختلف…"
                className="field mt-1.5 w-full resize-none"
              />
              <p className="mt-1 text-left text-[10.5px]" style={{ color: "var(--text-dim)" }}>
                <span className="num">{note.length}</span>/<span className="num">500</span>
              </p>

              <div
                className="mt-4 flex gap-2.5 rounded-xl p-3 text-[11.5px] leading-relaxed"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                <AlertTriangle size={15} className="mt-px shrink-0" style={{ color: "var(--warn)" }} />
                <span>
                  التبليغ الكاذب المتكرر كيأدي لتوقيف الحساب. بلّغ غير إلا كنتي متأكد.
                </span>
              </div>

              {error && (
                <p className="mt-3 text-[12px] font-semibold" style={{ color: "var(--bad)" }}>
                  {error}
                </p>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={send}
                  disabled={!reason || sending}
                  className="btn btn-primary flex-1"
                  style={reason ? { background: "var(--bad)" } : undefined}
                >
                  <Check size={16} /> {sending ? "كنصيفطو…" : "صيفط التبليغ"}
                </button>
                <CancelButton />
              </div>
            </div>
          </>
        )}
    </Modal>
  );
}

function ReportSentBody() {
  const close = useModalClose();
  return (
    <div className="p-8 text-center">
      <span
        className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
        style={{ background: "color-mix(in oklab, var(--good) 14%, transparent)", color: "var(--good)" }}
      >
        <ShieldCheck size={26} />
      </span>
      <h2 className="mt-5 text-lg font-extrabold">تسجّل التبليغ ديالك</h2>
      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        فريق المراجعة غادي يشوف الإعلان داخل <span className="num">24</span> ساعة.
        إلا تأكد المشكل غادي يتحيّد الإعلان ويتنبّه البائع.
        شكراً — بهاد الطريقة كنحافظو على نظافة السوق.
      </p>
      <button onClick={close} className="btn btn-primary mt-6">سالينا</button>
    </div>
  );
}

function CancelButton() {
  const close = useModalClose();
  return <button onClick={close} className="btn btn-ghost">إلغاء</button>;
}
