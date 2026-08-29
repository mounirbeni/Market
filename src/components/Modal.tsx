"use client";

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";
import { Close } from "@/components/icons";

/* ============================================================
   قسم منبثق (Modal) — أساس واحد لكل الأقسام المنبثقة فالموقع

   كان عندنا 4 نسخ مكررة من نفس المنطق (Escape، قفل التمرير،
   التركيز، الخلفية) فـ AppointmentDialog وReportDialog ولوحة
   التوثيق وفلاتر الهاتف. دابا كلشي كيمرّ من هنا — نفس السلوك
   ونفس الحركة فكل بلاصة.

   variant="dialog": ورقة من تحت فالهاتف، بطاقة فالوسط فالحاسوب.
   variant="drawer": لوح جانبي (فلاتر، قوائم).

   الإغلاق كيدير حركة خروج قبل ما يمسح العنصر فعليّاً — بلا هادشي
   كان كيختفي دفعة وحدة، بلا إحساس.
   ============================================================ */

const EXIT_MS = 200;

const CloseCtx = createContext<() => void>(() => {});

/** الزر ولا أي عنصر داخل Modal يقدر يطلب الإغلاق المتحرك بهاد الهوك */
export function useModalClose() {
  return useContext(CloseCtx);
}

export function ModalCloseButton({
  label = "إغلاق",
  className = "btn btn-ghost btn-sm",
}: {
  label?: string;
  className?: string;
}) {
  const close = useModalClose();
  return (
    <button onClick={close} aria-label={label} className={className} type="button">
      <Close size={16} />
    </button>
  );
}

export function Modal({
  onClose,
  children,
  ariaLabel,
  maxWidth = "max-w-md",
  variant = "dialog",
}: {
  /** كيتنادى بعد ما تكمل حركة الخروج — هنا فين تبدّل الحالة (setOpen(false)) */
  onClose: () => void;
  children: ReactNode;
  ariaLabel: string;
  maxWidth?: string;
  variant?: "dialog" | "drawer";
}) {
  const [closing, setClosing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    boxRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  const isDrawer = variant === "drawer";

  return (
    <CloseCtx.Provider value={close}>
      <div
        className={`fixed inset-0 z-[70] flex ${isDrawer ? "" : "items-end justify-center p-0 sm:items-center sm:p-4"} ${closing ? "animate-fade-out" : "animate-fade"}`}
        style={{ background: "rgba(4,12,26,0.55)", backdropFilter: "blur(3px)" }}
        onClick={close}
        role="presentation"
      >
        <div
          ref={boxRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          onClick={(e) => e.stopPropagation()}
          className={
            isDrawer
              ? `absolute inset-y-0 start-0 flex w-[90%] ${maxWidth} flex-col ${closing ? "animate-drawer-out" : "animate-drawer-in"}`
              : `card-raised max-h-[88vh] w-full ${maxWidth} overflow-y-auto rounded-b-none sm:rounded-b-2xl ${closing ? "animate-sheet-out" : "animate-sheet-in"}`
          }
          style={isDrawer ? { background: "var(--bg)" } : undefined}
        >
          {children}
        </div>
      </div>
    </CloseCtx.Provider>
  );
}
