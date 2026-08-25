import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * حماية لوحة التحكم — كتتحقق فالخادم قبل ما يتصيفط أي محتوى.
 * ماكاينش اعتماد على حالة المتصفح: تعديل localStorage ماكيعطيش دخول.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fdashboard");
  return <>{children}</>;
}
