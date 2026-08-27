"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/store/session";

/* ============================================================
   عدّاد الإشعارات غير المقروءة

   كان محسوب مرة وحدة ملي كيتحمّل الهيدر: تقرا الإشعارات، ترجع
   للصفحة، والرقم الأحمر مازال باين. دابا كيتعاود:

   - ملي تبدّل الصفحة (خرجتي من /notifications ← الرقم كيتحيّن)
   - ملي ترجع للتبويب (كنتي فتطبيق آخر وجاك إشعار)

   بلا مستخدم داخل: صفر، والجرس ماكيبانش أصلاً.
   ============================================================ */
export function useUnreadNotifications() {
  const { user } = useSession();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  const uid = user?.id ?? null;

  const load = useCallback(async (): Promise<number> => {
    if (!uid) return 0;
    const r = await fetch("/api/me/notifications", { cache: "no-store" });
    const j = await r.json();
    if (!j?.ok) return 0;
    const items = j.data.items as { read_at: string | null }[];
    return items.filter((n) => !n.read_at).length;
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setUnread(0);
      return;
    }
    let alive = true;
    const refresh = () => {
      load()
        .then((n) => { if (alive) setUnread(n); })
        .catch(() => { /* الشبكة قاطعة — كنخلّيو الرقم اللي كاين */ });
    };

    refresh();

    /* ملي يرجع المستخدم للتبويب، الرقم يمكن يكون تبدّل */
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [uid, pathname, load]);

  return unread;
}
