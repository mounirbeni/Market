"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/client";
import {
  LOCALES, LOCALE_COOKIE, LOCALE_NAME, localePath, type Locale,
} from "@/lib/i18n/config";

/* ============================================================
   مبدّل اللغة

   كيبقى الزائر فنفس الصفحة — غير البادئة اللي كتتبدّل. ملي كتكون
   فـ/fr/cars?city=casablanca وكتختار العربية، كتمشي لـ
   /ar/cars?city=casablanca بنفس الفلاتر.

   الاختيار كيتخزّن فكوكي باش proxy يتذكّرو فالزيارة الجاية — بلاه
   الزائر كيرجع للغة المتصفح فكل مرة.
   ============================================================ */

export function LanguageSwitcher({ onNav = false }: { onNav?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = useLocale();

  function pick(next: Locale) {
    if (next === active) return;
    /* سنة كاملة، وSameSite=Lax باش يمشي مع التنقّل العادي */
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    const qs = window.location.search + window.location.hash;
    router.push(`${localePath(pathname, next)}${qs}`);
    router.refresh();
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border p-0.5"
      style={{ borderColor: onNav ? "var(--nav-line)" : "var(--line)" }}
      role="group"
      aria-label={active === "ar" ? "اللغة" : "Langue"}
    >
      {LOCALES.map((l) => {
        const on = l === active;
        return (
          <button
            key={l}
            type="button"
            onClick={() => pick(l)}
            aria-pressed={on}
            lang={l}
            className="rounded-md px-2 py-1 text-[11px] font-bold transition"
            style={{
              background: on ? "var(--brand)" : "transparent",
              color: on ? "#fff" : onNav ? "var(--nav-muted)" : "var(--text-muted)",
            }}
          >
            {l === "ar" ? "ع" : "FR"}
            <span className="sr-only"> — {LOCALE_NAME[l]}</span>
          </button>
        );
      })}
    </div>
  );
}
