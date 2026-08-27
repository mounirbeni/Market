import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { ModerationPanel } from "@/components/admin/ModerationPanel";

export const metadata: Metadata = {
  title: "الإشراف",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * لوحة الإشراف.
 *
 * ملي ماكونش المستخدم مشرف كنرجعو 404 ماشي 403: الصفحة ماخاصهاش
 * حتى تبان كاينة للي ماعندوش الصلاحية.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) notFound();

  const { status = "open" } = await searchParams;
  const { listReports, reportCounts } = await import("@/lib/db/moderation");
  const [reports, counts] = await Promise.all([listReports(status), reportCounts()]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10">
      <ModerationPanel reports={reports} counts={counts} status={status} />
    </div>
  );
}
