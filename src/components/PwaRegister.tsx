"use client";

import { useEffect } from "react";

/**
 * تسجيل Service Worker — غير فالإنتاج. فالتطوير Turbopack كيعاود
 * يبني الملفات بسرعة، وSW مسجّل كيقدر يخدم نسخة قديمة مخزّنة
 * ويبيّن أخطاء «تحميل الملف فشل» بلا داعي.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ماشي حرج — الموقع كيخدم عادي بلا SW */
    });
  }, []);

  return null;
}
