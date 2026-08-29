import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

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
    const path = (await headers()).get("x-pathname") ?? "/dashboard";
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  return <>{children}</>;
}
