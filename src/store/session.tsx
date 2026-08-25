"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/* ============================================================
   جلسة المستخدم — مصدر واحد للحقيقة

   القيمة كتجي من الخادم (كوكي httpOnly) عبر layout، ماشي من
   localStorage. حتى واحد ماقدرش «يسجّل الدخول» بتعديل التخزين
   فالمتصفح.
   ============================================================ */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** اختياري — من الملف الشخصي، ماشي من التسجيل */
  phone: string | null;
  type: "particulier" | "professionnel";
  city: string | null;
  email_verified: boolean;
  id_verified: boolean;
}

interface SessionState {
  user: SessionUser | null;
  /** عدد الرسائل غير المقروءة */
  unread: number;
  signOut: () => Promise<void>;
  /** إعادة قراءة الجلسة من الخادم */
  refresh: () => Promise<void>;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({
  user: initial,
  unread: initialUnread = 0,
  children,
}: {
  user: SessionUser | null;
  unread?: number;
  children: ReactNode;
}) {
  const [user, setUser] = useState(initial);
  const [unread, setUnread] = useState(initialUnread);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const j = await r.json();
      if (j.ok) {
        setUser(j.data.user);
        setUnread(j.data.unread ?? 0);
      }
    } catch {
      /* الشبكة قاطعة — كنخلّيو الحالة الحالية */
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* حتى إلا فشل الطلب، كنمسحو الحالة المحلية */
    }
    setUser(null);
    setUnread(0);
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <Ctx.Provider value={{ user, unread, signOut, refresh }}>{children}</Ctx.Provider>
  );
}

export function useSession(): SessionState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession خاصها تكون داخل SessionProvider");
  return v;
}
