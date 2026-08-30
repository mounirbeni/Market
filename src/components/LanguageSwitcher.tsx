"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/client";
import {
  LOCALES, LOCALE_COOKIE, LOCALE_NAME, localePath, type Locale,
} from "@/lib/i18n/config";
import { Check, ChevronDown } from "./icons";

/* ============================================================
   مبدّل اللغة

   كيبقى الزائر فنفس الصفحة — غير البادئة اللي كتتبدّل. ملي كتكون
   فـ/fr/cars?city=casablanca وكتختار العربية، كتمشي لـ
   /ar/cars?city=casablanca بنفس الفلاتر.

   الاختيار كيتخزّن فكوكي باش proxy يتذكّرو فالزيارة الجاية — بلاه
   الزائر كيرجع للغة المتصفح فكل مرة.

   قائمة منسدلة ماشي زوج أزرار جنب بعضهم — باش ماكتاخدش حيّز
   زايد فالهيدر، خصوصاً ملي تكون النصوص بالفرنسية أطول.
   ============================================================ */

export function LanguageSwitcher({ onNav = false }: { onNav?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = useLocale();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(next: Locale) {
    setOpen(false);
    if (next === active) return;
    /* سنة كاملة، وSameSite=Lax باش يمشي مع التنقّل العادي */
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    const qs = window.location.search + window.location.hash;
    router.push(`${localePath(pathname, next)}${qs}`);
    router.refresh();
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={active === "ar" ? "اللغة" : "Langue"}
        className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition"
        style={{
          borderColor: onNav ? "var(--nav-line)" : "var(--line)",
          color: onNav ? "var(--nav-muted)" : "var(--text-muted)",
        }}
      >
        <span lang={active}>{active === "ar" ? "ع" : "FR"}</span>
        <ChevronDown size={12} style={{ opacity: 0.7 }} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 top-[calc(100%+4px)] z-20 min-w-[130px] overflow-hidden rounded-lg border py-1 shadow-lg"
          style={{ borderColor: "var(--line)", background: "var(--surface-1)" }}
        >
          {LOCALES.map((l) => {
            const on = l === active;
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  lang={l}
                  onClick={() => pick(l)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-start text-[12.5px] font-semibold transition hover:bg-[var(--surface-3)]"
                  style={{ color: on ? "var(--brand)" : "var(--text)" }}
                >
                  {LOCALE_NAME[l]}
                  {on && <Check size={13} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
