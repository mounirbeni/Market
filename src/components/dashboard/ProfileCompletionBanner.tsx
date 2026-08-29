"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/store/session";
import { AlertTriangle, ArrowLeft } from "@/components/icons";

/* ============================================================
   تنبيه استكمال الملف الشخصي

   ثابت وماشي قابل للإخفاء — بلا زر إغلاق. كيبان فكل صفحات لوحة
   القيادة حتى يكمّل المستخدم المعلومات الإلزامية. صفحة الاستكمال
   راسها ماكتبيّنش هاد التنبيه (لا فائدة تكرار نفس الرسالة).
   ============================================================ */
export function ProfileCompletionBanner({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  if (user.onboarded || pathname === "/dashboard/complete-profile") return null;

  const items = [
    Boolean(user.name && user.name !== "مستعمل طريق"),
    Boolean(user.phone),
    Boolean(user.city),
    user.email_verified,
  ];
  const percent = Math.round((items.filter(Boolean).length / items.length) * 100);

  return (
    <div
      className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border p-4"
      style={{ borderColor: "var(--warn)", background: "var(--warn-soft)" }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ background: "var(--surface-1)", color: "var(--warn)" }}
      >
        <AlertTriangle size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold">
          أكمل معلومات حسابك — اكتمال الملف الشخصي: <span className="num">{percent}%</span>
        </p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          خاصك تكمّل الاسم، الهاتف، والمدينة قبل ما تقدر تنشر إعلان ولا تستافد
          من كل خدمات المنصة.
        </p>
      </div>
      <Link
        href={`/dashboard/complete-profile?next=${encodeURIComponent(pathname || "/dashboard")}`}
        className="btn btn-primary btn-sm shrink-0"
      >
        كمّل دابا <ArrowLeft size={14} className="dir-flip" />
      </Link>
    </div>
  );
}
