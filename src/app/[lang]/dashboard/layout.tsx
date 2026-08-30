import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/config";

/**
 * حماية لوحة التحكم — كتتحقق فالخادم قبل ما يتصيفط أي محتوى.
 * ماكاينش اعتماد على حالة المتصفح: تعديل localStorage ماكيعطيش دخول.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    // مسار middleware.ts — بلا هادشي رابط عميق (مثلاً تعديل إعلان)
    // كان كيرجّع المستخدم بعد الدخول لواجهة القيادة العامة، ماشي
    // للصفحة اللي كان قاصدها
    const locale = await getLocale();
    const path = (await headers()).get("x-pathname") ?? "/dashboard";
    redirect(localePath(`/login?next=${encodeURIComponent(path)}`, locale));
  }
  return <>{children}</>;
}
