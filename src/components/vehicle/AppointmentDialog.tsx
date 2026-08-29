"use client";

import { useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { useSession } from "@/store/session";
import { vehicleHref } from "@/lib/slug";
import { Modal, ModalCloseButton, useModalClose } from "@/components/Modal";
import { Calendar, Check, MapPin, ShieldCheck } from "@/components/icons";

/** أقرب موعد ممكن: غدّا فـ11:00 — كيعمّر الحقل بقيمة معقولة */
function defaultSlot() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(11, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AppointmentDialog({ v, onClose }: { v: Vehicle; onClose: () => void }) {
  const { user } = useSession();
  const [at, setAt] = useState(defaultSlot);
  const [place, setPlace] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ref: v.id, at: new Date(at).toISOString(), place }),
      });
      const json = await res.json();
      if (!json?.ok) {
        setError(json?.error ?? "ماقدرناش نسجّلو الطلب. عاود المحاولة.");
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
    <Modal onClose={onClose} ariaLabel="طلب موعد معاينة" maxWidth="max-w-md">
      <AppointmentDialogBody
        v={v} user={user} at={at} setAt={setAt} place={place} setPlace={setPlace}
        sending={sending} sent={sent} error={error} send={send}
      />
    </Modal>
  );
}

function AppointmentDialogBody({
  v, user, at, setAt, place, setPlace, sending, sent, error, send,
}: {
  v: Vehicle;
  user: ReturnType<typeof useSession>["user"];
  at: string;
  setAt: (v: string) => void;
  place: string;
  setPlace: (v: string) => void;
  sending: boolean;
  sent: boolean;
  error: string;
  send: () => void;
}) {
  const close = useModalClose();

  if (sent) {
    return (
      <div className="p-8 text-center">
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: "var(--good-soft)", color: "var(--good)" }}
        >
          <ShieldCheck size={26} />
        </span>
        <h2 className="mt-5 text-lg font-extrabold">تصيفط الطلب</h2>
        <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          البائع غادي يشوف الطلب ويأكّدو ولا يقترح وقت آخر. غادي تلقا الجواب
          فـ<Link href="/dashboard/appointments" className="underline">المواعيد ديالك</Link>.
        </p>
        <button onClick={close} className="btn btn-primary mt-6">سالينا</button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
            <Calendar size={17} style={{ color: "var(--brand)" }} /> اطلب موعد معاينة
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: "var(--text-muted)" }}>
            {v.make} {v.model} <span className="num">{v.year}</span>
          </p>
        </div>
        <ModalCloseButton />
      </div>

      {!user ? (
        <div className="mt-5 text-center">
          <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            خاصك تسجّل الدخول باش تطلب موعد — هكا البائع كيعرف مع من غادي يتلاقا.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(vehicleHref(v))}`}
            className="btn btn-primary mt-4 w-full"
          >
            تسجيل الدخول
          </Link>
        </div>
      ) : (
        <>
          <label className="label mt-5" htmlFor="appt-at">
            <Calendar size={13} /> النهار والوقت
          </label>
          <input
            id="appt-at"
            type="datetime-local"
            className="field"
            value={at}
            onChange={(e) => setAt(e.target.value)}
          />

          <label className="label mt-4" htmlFor="appt-place">
            <MapPin size={13} /> البلاصة (اختياري)
          </label>
          <input
            id="appt-place"
            className="field"
            placeholder="مثلاً: الدار البيضاء — محطة الشحن"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            maxLength={200}
          />

          <p
            className="mt-4 rounded-xl p-3 text-[11.5px] leading-relaxed"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
          >
            تلاقاو ديما فبلاصة عامة ونهاراً. متخلّصش حتى درهم قبل ما تشوف المركبة
            والوثائق بعينيك.
          </p>

          {error && (
            <p className="mt-3 text-[12px] font-semibold" style={{ color: "var(--bad)" }}>
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button onClick={send} disabled={sending || !at} className="btn btn-primary flex-1">
              <Check size={16} /> {sending ? "كنصيفطو…" : "صيفط الطلب"}
            </button>
            <button onClick={close} className="btn btn-ghost">إلغاء</button>
          </div>
        </>
      )}
    </div>
  );
}
