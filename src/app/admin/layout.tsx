import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminConfigured, getAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "الإشراف",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * بوابة اللوحة.
 *
 * · الإشراف ماشي مضبوط  → 404. الصفحة ماخاصهاش تبان كاينة أصلاً.
 * · مضبوط وماشي داخل    → فورمير الدخول (كلمة سر + رمز).
 * · داخل                → اللوحة.
 *
 * الحماية هنا فاللايوت: أي صفحة جديدة تحت /admin كتّحمى
 * أوتوماتيكياً، ماكاينش شي واحد كينسى يزيد الفحص.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!adminConfigured()) notFound();

  const admin = await getAdmin();
  if (!admin) return <AdminLogin />;

  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
