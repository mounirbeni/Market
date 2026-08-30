"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { Modal, ModalCloseButton, useModalClose } from "@/components/Modal";
import { useDict } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/labels";
import { AlertTriangle, Check, Flag, ShieldCheck } from "@/components/icons";

const REASON_KEYS = ["fake", "sold", "price", "photos", "papers", "deposit", "duplicate", "other"] as const;

export function ReportDialog({ v, onClose }: { v: Vehicle; onClose: () => void }) {
  const t = useDict();
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
        setError(json?.error ?? t.report.genericError);
        return;
      }
      setSent(true);
    } catch {
      setError(t.report.networkError);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal onClose={onClose} ariaLabel={t.report.ariaLabel} maxWidth="max-w-lg">
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
                {t.report.title}
              </h2>
              <ModalCloseButton label={t.report.close} className="btn btn-icon btn-sm" />
            </header>

            <div className="p-5">
              <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {t.report.reportingOn} <b>{v.make} {v.model} <span className="num">{v.year}</span></b>.{" "}
                {t.report.confidential}
              </p>

              <fieldset className="mt-5">
                <legend className="label mb-2.5">{t.report.whyLegend}</legend>
                <div className="grid gap-1.5">
                  {REASON_KEYS.map((k) => {
                    const r = t.report.reasons[k];
                    return (
                    <label
                      key={k}
                      className="flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors"
                      style={{
                        borderColor: reason === k ? "var(--bad)" : "var(--line)",
                        background: reason === k ? "var(--bad-soft)" : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={k}
                        checked={reason === k}
                        onChange={() => setReason(k)}
                        className="mt-0.5 shrink-0 accent-[var(--bad)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold">{r.label}</span>
                        {r.hint && (
                          <span className="block text-[11.5px]" style={{ color: "var(--text-dim)" }}>{r.hint}</span>
                        )}
                      </span>
                    </label>
                    );
                  })}
                </div>
              </fieldset>

              <label className="label mt-5 block" htmlFor="report-note">
                {t.report.detailsLabel} <span style={{ color: "var(--text-dim)" }}>{t.report.optional}</span>
              </label>
              <textarea
                id="report-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                placeholder={t.report.detailsPlaceholder}
                className="field mt-1.5 w-full resize-none"
              />
              <p className="mt-1 text-end text-[10.5px]" style={{ color: "var(--text-dim)" }}>
                <span className="num">{note.length}</span>/<span className="num">500</span>
              </p>

              <div
                className="mt-4 flex gap-2.5 rounded-xl p-3 text-[11.5px] leading-relaxed"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                <AlertTriangle size={15} className="mt-px shrink-0" style={{ color: "var(--warn)" }} />
                <span>
                  {t.report.abuseWarning}
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
                  <Check size={16} /> {sending ? t.report.sending : t.report.send}
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
  const t = useDict();
  const close = useModalClose();
  return (
    <div className="p-8 text-center">
      <span
        className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
        style={{ background: "color-mix(in oklab, var(--good) 14%, transparent)", color: "var(--good)" }}
      >
        <ShieldCheck size={26} />
      </span>
      <h2 className="mt-5 text-lg font-extrabold">{t.report.sentTitle}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {fill(t.report.sentLead, { h: "24" })}
      </p>
      <button onClick={close} className="btn btn-primary mt-6">{t.report.done}</button>
    </div>
  );
}

function CancelButton() {
  const close = useModalClose();
  const t = useDict();
  return <button onClick={close} className="btn btn-ghost">{t.report.cancel}</button>;
}
