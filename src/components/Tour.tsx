"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { useDict } from "@/lib/i18n/client";
import { TOUR_OPEN_EVENT, TOUR_STORAGE_KEY } from "@/lib/tour";
import {
  BadgeCheck, Calculator, ChevronLeft, ChevronRight, Flag, Message, Plus, Search, ShieldCheck,
} from "@/components/icons";

/* ============================================================
   جولة التعريف بالمنصة

   أغلب الزوار الجدد ماعارفينش كيفاش يقلّبو ولا يبيعو ولا
   يفهمو مؤشر الثقة. هاد المكوّن كيبان أوتوماتيكياً مرة وحدة لكل
   زائر جديد (localStorage)، وكيبقى قابل للفتح فأي وقت من زر "؟"
   فالهيدر — نفس الجولة، بلا ما تحتاج تعاود تصاوب حساب.
   ============================================================ */

const STEP_ICONS = [Flag, Search, ShieldCheck, Message, Plus, BadgeCheck, Calculator] as const;

export function Tour() {
  const t = useDict().tour;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  /* أول زيارة — كنفتحو بعد شوية باش الصفحة تكمل التحميل أولاً */
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(TOUR_STORAGE_KEY) === "1";
    } catch {
      /* localStorage ماشي متاح (وضع خاص...) — نعتبروها مشافة، الزر يبقى موجود */
    }
    if (seen) return;
    const id = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(id);
  }, []);

  /* زر "؟" فالهيدر كيصيفط هاد الحدث */
  useEffect(() => {
    const onOpen = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(TOUR_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(TOUR_OPEN_EVENT, onOpen);
  }, []);

  function finish() {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "1");
    } catch {
      /* بلا localStorage، الجولة غادي تبان تاني المرة الجاية — مقبول */
    }
    setOpen(false);
  }

  if (!open) return null;

  const total = t.steps.length;
  const [title, body] = t.steps[step];
  const Icon = STEP_ICONS[step] ?? Flag;
  const last = step === total - 1;

  return (
    <Modal onClose={finish} ariaLabel={t.title} maxWidth="max-w-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
          >
            <Icon size={22} />
          </span>
          <span className="text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
            {t.stepOfA}<span className="num">{step + 1}</span>{t.stepOfB}<span className="num">{total}</span>
          </span>
        </div>

        <h2 className="mt-4 text-lg font-extrabold">{title}</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {body}
        </p>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          {t.steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 18 : 6,
                background: i === step ? "var(--brand)" : "var(--line-strong)",
              }}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button onClick={finish} className="btn btn-ghost btn-sm">{t.skip}</button>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="btn btn-ghost btn-sm">
                <ChevronRight size={14} className="dir-flip" /> {t.prev}
              </button>
            )}
            <button
              onClick={() => (last ? finish() : setStep((s) => s + 1))}
              className="btn btn-primary btn-sm"
            >
              {last ? t.done : t.next} {!last && <ChevronLeft size={14} className="dir-flip" />}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
